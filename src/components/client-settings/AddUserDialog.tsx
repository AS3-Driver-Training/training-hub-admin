
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, Mail } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EmailInput } from "./add-user/EmailInput";
import { RoleSelect } from "./add-user/RoleSelect";
import { GroupSelect } from "./add-user/GroupSelect";
import { TeamSelect } from "./add-user/TeamSelect";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Group, Team } from "./types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AddUserDialogProps {
  clientId: string;
}

export function AddUserDialog({ clientId }: AddUserDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<'client_admin' | 'manager' | 'supervisor'>('supervisor');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"existing" | "invite">("existing");
  const [clientName, setClientName] = useState<string>("");
  const queryClient = useQueryClient();

  // Fetch client name for invitation emails
  useEffect(() => {
    const getClientName = async () => {
      const { data } = await supabase
        .from('clients')
        .select('name')
        .eq('id', clientId)
        .single();
      
      if (data) {
        setClientName(data.name);
      }
    };
    
    getClientName();
  }, [clientId]);

  useEffect(() => {
    if (!isDialogOpen) {
      // Reset form when dialog closes
      setEmail("");
      setRole('supervisor');
      setSelectedGroup(null);
      setSelectedTeam(null);
      setError(null);
      setActiveTab("existing");
    }
  }, [isDialogOpen]);

  const { data: groups = [], isLoading: isLoadingGroups } = useQuery({
    queryKey: ['client_groups', clientId],
    queryFn: async () => {
      console.log('Fetching groups for client:', clientId);
      const { data, error } = await supabase
        .from('groups')
        .select(`
          id,
          name,
          description,
          is_default,
          teams (
            id,
            name,
            group_id
          )
        `)
        .eq('client_id', clientId)
        .order('name');

      if (error) {
        console.error('Error fetching groups:', error);
        throw error;
      }
      
      console.log('Fetched groups:', data);
      return (data || []).map(group => ({
        ...group,
        client_id: clientId,
        description: group.description || '',
        is_default: group.is_default || false,
        teams: group.teams || []
      })) as Group[];
    },
  });

  useEffect(() => {
    // Set first group as selected when groups are loaded
    if (groups.length > 0 && !selectedGroup) {
      console.log("Setting initial group:", groups[0].id);
      setSelectedGroup(groups[0].id);
    }
  }, [groups, selectedGroup]);

  // Get teams for the selected group
  const availableTeams = selectedGroup 
    ? groups.find(g => g.id === selectedGroup)?.teams || []
    : [];

  // Role change handler with proper type
  const handleRoleChange = (newRole: 'client_admin' | 'manager' | 'supervisor') => {
    console.log("Setting role to:", newRole);
    setRole(newRole);
  };

  // Group change handler
  const handleGroupChange = (groupId: string) => {
    console.log("Setting group to:", groupId);
    setSelectedGroup(groupId);
    setSelectedTeam(null); // Reset team when group changes
  };

  // Team change handler
  const handleTeamChange = (teamId: string | null) => {
    console.log("Setting team to:", teamId);
    setSelectedTeam(teamId);
  };

  // Add existing user mutation
  const addUserMutation = useMutation({
    mutationFn: async ({ email, role, groupId, teamId }: { 
      email: string; 
      role: 'client_admin' | 'manager' | 'supervisor';
      groupId: string | null;
      teamId: string | null;
    }) => {
      setError(null);
      console.log('Adding existing user with data:', { email, role, groupId, teamId });
      
      try {
        // Check if email exists in the system
        const { data: userData, error: userError } = await supabase.functions.invoke(
          'get-user-by-email',
          { body: { email } }
        );

        console.log('User lookup response:', userData);

        if (userError) {
          console.error('Error looking up user:', userError);
          throw new Error(`Error looking up user: ${userError.message}`);
        }

        if (!userData?.user) {
          const message = 'User not found. Please make sure the email is correct or use the "Invite" tab to invite a new user.';
          setError(message);
          throw new Error(message);
        }

        console.log('User found:', userData.user);
        const userId = userData.user.id;

        // Check if user is a superadmin
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();

        if (profileError) {
          console.error('Error checking user profile:', profileError);
          throw new Error(`Error checking user profile: ${profileError.message}`);
        }

        if (profileData?.role === 'superadmin') {
          const message = 'Superadmin users cannot be added as client users';
          setError(message);
          throw new Error(message);
        }

        // Check if user is already a member of this client
        const { data: existingUser, error: existingError } = await supabase
          .from('client_users')
          .select('*')
          .eq('client_id', clientId)
          .eq('user_id', userId)
          .maybeSingle();

        if (existingError) {
          console.error('Error checking existing user:', existingError);
          throw new Error(`Error checking existing user: ${existingError.message}`);
        }

        if (existingUser) {
          const message = 'User is already a member of this client';
          setError(message);
          throw new Error(message);
        }

        // Add the user to the client
        const { data: newClientUser, error: insertError } = await supabase
          .from('client_users')
          .insert({
            client_id: clientId,
            user_id: userId,
            role: role,
            status: 'active'
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating client user:', insertError);
          let message = insertError.message;
          
          if (message.includes('Superadmin users cannot be added as client users')) {
            message = 'This user has superadmin privileges and cannot be added as a client user';
          } else {
            message = `Failed to add user to client: ${message}`;
          }
          
          setError(message);
          throw new Error(message);
        }

        if (!newClientUser) {
          const message = 'Failed to create client user - no data returned';
          setError(message);
          throw new Error(message);
        }

        console.log('Client user created successfully:', newClientUser);

        // Assign group if provided
        if (groupId) {
          const { error: groupError } = await supabase
            .from('user_groups')
            .insert({
              user_id: userId,
              group_id: groupId
            });
          
          if (groupError) {
            console.error('Error assigning group:', groupError);
            throw new Error(`Error assigning group: ${groupError.message}`);
          }
          console.log('Group assignment created successfully');
        }

        // Assign team if provided
        if (teamId) {
          const { error: teamError } = await supabase
            .from('user_teams')
            .insert({
              user_id: userId,
              team_id: teamId
            });
          
          if (teamError) {
            console.error('Error assigning team:', teamError);
            throw new Error(`Error assigning team: ${teamError.message}`);
          }
          console.log('Team assignment created successfully');
        }

        return userId;
      } catch (error: any) {
        console.error('Error in add user mutation:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client_users', clientId] });
      setIsDialogOpen(false);
      setEmail("");
      setRole('supervisor');
      setSelectedGroup(groups[0]?.id || null);
      setSelectedTeam(null);
      setError(null);
      toast.success("User added successfully");
    },
    onError: (error: Error) => {
      console.error('Error in mutation:', error);
      toast.error(error.message);
    },
  });

  // Invite new user mutation
  const inviteUserMutation = useMutation({
    mutationFn: async ({ email, role, groupId }: {
      email: string;
      role: 'client_admin' | 'manager' | 'supervisor';
      groupId: string | null;
    }) => {
      setError(null);
      console.log('Inviting new user with data:', { email, role, groupId });
      
      try {
        // Generate a new token for the invitation
        const { data: tokenData, error: tokenError } = await supabase
          .rpc('generate_invitation_token');

        if (tokenError) {
          console.error('Error generating token:', tokenError);
          throw new Error(`Error generating invitation token: ${tokenError.message}`);
        }

        // Create an invitation record
        const { data: invitation, error: invitationError } = await supabase
          .from('invitations')
          .insert({
            client_id: clientId,
            email: email,
            token: tokenData,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days expiry
            status: 'pending'
          })
          .select()
          .single();

        if (invitationError) {
          console.error('Error creating invitation:', invitationError);
          throw new Error(`Error creating invitation: ${invitationError.message}`);
        }

        // Send invitation email
        const emailResponse = await supabase.functions.invoke('send-invitation', {
          body: {
            clientName: clientName,
            email: email,
            token: tokenData,
          },
        });

        if (emailResponse.error) {
          console.error('Error sending invitation email:', emailResponse.error);
          throw new Error(`Error sending invitation email: ${emailResponse.error.message}`);
        }

        return invitation;
      } catch (error: any) {
        console.error('Error in invite user mutation:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations', clientId] });
      setIsDialogOpen(false);
      setEmail("");
      setRole('supervisor');
      setSelectedGroup(groups[0]?.id || null);
      setSelectedTeam(null);
      setError(null);
      toast.success("Invitation sent successfully");
    },
    onError: (error: Error) => {
      console.error('Error in invitation mutation:', error);
      toast.error(error.message);
    },
  });

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email) {
      setError("Please enter an email address");
      return;
    }

    if (!selectedGroup) {
      setError("Please select a group");
      return;
    }

    try {
      await addUserMutation.mutate({ 
        email, 
        role, 
        groupId: selectedGroup,
        teamId: selectedTeam
      });
    } catch (error) {
      console.error('Error in handleAddUser:', error);
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email) {
      setError("Please enter an email address");
      return;
    }

    if (!selectedGroup) {
      setError("Please select a group");
      return;
    }

    try {
      await inviteUserMutation.mutate({
        email,
        role,
        groupId: selectedGroup
      });
    } catch (error) {
      console.error('Error in handleInviteUser:', error);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => console.log("Add User button clicked")}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add User</DialogTitle>
          <DialogDescription>
            Add an existing user or invite a new user to this client.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "existing" | "invite")}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="existing">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Existing User
            </TabsTrigger>
            <TabsTrigger value="invite">
              <Mail className="h-4 w-4 mr-2" />
              Invite New User
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="existing">
            <form onSubmit={handleAddUser} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <EmailInput 
                email={email} 
                onEmailChange={setEmail} 
                description="Enter the email of an existing user" 
              />
              <RoleSelect role={role} onRoleChange={handleRoleChange} />
              <GroupSelect 
                groups={groups} 
                selectedGroup={selectedGroup} 
                onGroupChange={handleGroupChange} 
              />
              <TeamSelect
                selectedGroup={selectedGroup}
                selectedTeam={selectedTeam}
                onTeamChange={handleTeamChange}
                availableTeams={availableTeams}
              />
              <Button type="submit" className="w-full" disabled={addUserMutation.isPending}>
                {addUserMutation.isPending ? 'Adding...' : 'Add Existing User'}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="invite">
            <form onSubmit={handleInviteUser} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <EmailInput 
                email={email} 
                onEmailChange={setEmail} 
                description="Enter the email to send an invitation" 
              />
              <RoleSelect role={role} onRoleChange={handleRoleChange} />
              <GroupSelect 
                groups={groups} 
                selectedGroup={selectedGroup} 
                onGroupChange={handleGroupChange} 
              />
              <Button type="submit" className="w-full" disabled={inviteUserMutation.isPending}>
                {inviteUserMutation.isPending ? 'Sending Invitation...' : 'Send Invitation'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}


import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
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
  const queryClient = useQueryClient();

  // Reset error when dialog opens/closes
  useEffect(() => {
    setError(null);
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
          teams (
            id,
            name
          )
        `)
        .eq('client_id', clientId)
        .order('name');

      if (error) {
        console.error('Error fetching groups:', error);
        throw error;
      }
      
      console.log('Fetched groups:', data);
      return data || [];
    },
  });

  // Set default group when groups are loaded
  useEffect(() => {
    if (groups.length > 0 && !selectedGroup) {
      setSelectedGroup(groups[0].id);
    }
  }, [groups]);

  // Get available teams for selected group
  const availableTeams = selectedGroup 
    ? groups.find(g => g.id === selectedGroup)?.teams || []
    : [];

  const addUserMutation = useMutation({
    mutationFn: async ({ email, role, groupId, teamId }: { 
      email: string; 
      role: 'client_admin' | 'manager' | 'supervisor';
      groupId: string | null;
      teamId: string | null;
    }) => {
      setError(null);
      console.log('Adding user with data:', { email, role, groupId, teamId });
      
      // First check if user exists and get their profile
      const { data: userData, error: userError } = await supabase.functions.invoke(
        'get-user-by-email',
        { body: { email } }
      );

      if (userError || !userData?.user) {
        const message = 'User not found. Please make sure the email is correct.';
        setError(message);
        throw new Error(message);
      }

      console.log('User found:', userData.user);

      // Check if user is already a member of this client
      const { data: existingUser, error: existingError } = await supabase
        .from('client_users')
        .select('*')
        .eq('client_id', clientId)
        .eq('user_id', userData.user.id)
        .maybeSingle();

      if (existingError) {
        console.error('Error checking existing user:', existingError);
        throw existingError;
      }

      if (existingUser) {
        const message = 'User is already a member of this client';
        setError(message);
        throw new Error(message);
      }

      // Check if user is a superadmin
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userData.user.id)
        .single();

      if (profileError) {
        console.error('Error checking profile:', profileError);
        throw profileError;
      }

      if (profileData?.role === 'superadmin') {
        const message = 'Superadmin users cannot be added as client users. Please use a different email address.';
        setError(message);
        throw new Error(message);
      }

      // Create client user
      const { error: insertError } = await supabase
        .from('client_users')
        .insert({
          client_id: clientId,
          user_id: userData.user.id,
          role: role,
          status: 'active'
        });

      if (insertError) {
        console.error('Error creating client user:', insertError);
        throw insertError;
      }

      console.log('Client user created successfully');

      // Insert group assignment if provided
      if (groupId) {
        const { error: groupError } = await supabase
          .from('user_groups')
          .insert({
            user_id: userData.user.id,
            group_id: groupId
          });
        
        if (groupError) {
          console.error('Error assigning group:', groupError);
          throw groupError;
        }
        console.log('Group assignment created successfully');
      }

      // Insert team assignment if provided
      if (teamId) {
        const { error: teamError } = await supabase
          .from('user_teams')
          .insert({
            user_id: userData.user.id,
            team_id: teamId
          });
        
        if (teamError) {
          console.error('Error assigning team:', teamError);
          throw teamError;
        }
        console.log('Team assignment created successfully');
      }

      return userData.user.id;
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
      // Error is already set in mutationFn
      toast.error("Failed to add user");
    },
  });

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    console.log('Form submitted with:', { email, role, selectedGroup, selectedTeam });
    
    if (!selectedGroup) {
      setError("Please select a group");
      return;
    }

    if (!email) {
      setError("Please enter an email address");
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

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add User</DialogTitle>
          <DialogDescription>
            Add a user to this client. The user must already have an account in the system.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleAddUser} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <EmailInput email={email} onEmailChange={setEmail} />
          <RoleSelect role={role} onRoleChange={(value: 'client_admin' | 'manager' | 'supervisor') => setRole(value)} />
          <GroupSelect 
            groups={groups} 
            selectedGroup={selectedGroup} 
            onGroupChange={setSelectedGroup} 
          />
          <TeamSelect
            selectedGroup={selectedGroup}
            selectedTeam={selectedTeam}
            onTeamChange={setSelectedTeam}
            availableTeams={availableTeams}
          />
          <Button type="submit" className="w-full" disabled={addUserMutation.isPending}>
            {addUserMutation.isPending ? 'Adding...' : 'Add User'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

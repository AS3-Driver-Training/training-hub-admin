
import { useState } from "react";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RoleSelect } from "./add-user/RoleSelect";
import { GroupSelect } from "./add-user/GroupSelect";
import { TeamSelect } from "./add-user/TeamSelect";
import { ClientRole, Group } from "./types";

interface AddUserDialogProps {
  clientId: string;
  clientName: string;
}

export default function AddUserDialog({
  clientId,
  clientName,
}: AddUserDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  // Fetch groups for this client
  const { data: groups = [] } = useQuery({
    queryKey: ['client_groups', clientId],
    queryFn: async () => {
      console.log('Fetching groups for client:', clientId);
      
      // Simplified query to avoid complex joins
      const { data: existingGroups, error: fetchError } = await supabase
        .from('groups')
        .select('id, name, description, is_default, teams(id, name, group_id)')
        .eq('client_id', clientId)
        .order('name');

      if (fetchError) {
        console.error('Error fetching groups:', fetchError);
        throw fetchError;
      }

      // Initialize groups with proper structure
      const formattedGroups: Group[] = (existingGroups || []).map(group => ({
        ...group,
        client_id: clientId,
        description: group.description || '',
        is_default: group.is_default || false,
        teams: group.teams || [],
        created_at: undefined,
        updated_at: undefined
      }));

      console.log('Groups fetched:', formattedGroups.length);
      return formattedGroups;
    },
    enabled: isOpen, // Only fetch when dialog is open
  });

  // Combined form state for all users
  const [userData, setUserData] = useState({
    email: "",
    role: "supervisor" as ClientRole,
    groupId: "",
    teamId: "",
  });

  // Handle adding or inviting a user
  const handleSubmitUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Call the add_user_to_client function
      const { data, error } = await supabase.rpc("add_user_to_client", {
        p_client_id: clientId,
        p_email: userData.email,
        p_role: userData.role,
      });

      if (error) throw error;

      // Safely access properties with type checking
      const responseData = data as { status: string; message: string; user_id?: string } | null;
      
      if (responseData?.status === "exists") {
        toast.info(responseData.message);
      } else if (responseData?.status === "added") {
        toast.success(responseData.message);
        
        // Add user to selected group if specified
        if (userData.groupId && responseData.user_id) {
          await addUserToGroup(responseData.user_id, userData.groupId);
          
          // Add user to selected team if specified
          if (userData.teamId) {
            await addUserToTeam(responseData.user_id, userData.teamId);
          }
        }
      } else if (responseData?.status === "invited") {
        toast.success("Invitation sent successfully");
      }

      // Invalidate and refetch queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["client_users", clientId] }),
        queryClient.invalidateQueries({ queryKey: ["invitations", clientId] })
      ]);

      setIsOpen(false);
      resetForm();
    } catch (error: any) {
      console.error("Error adding user:", error);
      toast.error(error.message || "Failed to add user");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add user to group
  const addUserToGroup = async (userId: string, groupId: string) => {
    const { error } = await supabase
      .from("user_groups")
      .insert({ user_id: userId, group_id: groupId });

    if (error) throw error;
  };

  // Add user to team
  const addUserToTeam = async (userId: string, teamId: string) => {
    const { error } = await supabase
      .from("user_teams")
      .insert({ user_id: userId, team_id: teamId });

    if (error) throw error;
  };

  const resetForm = () => {
    setUserData({
      email: "",
      role: "supervisor" as ClientRole,
      groupId: "",
      teamId: "",
    });
  };

  // Get teams for the selected group
  const getTeamsForGroup = (groupId: string) => {
    const group = groups.find((g) => g.id === groupId);
    return group ? group.teams : [];
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add User</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmitUser} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={userData.email}
              onChange={(e) =>
                setUserData((prev) => ({
                  ...prev,
                  email: e.target.value,
                }))
              }
              required
            />
          </div>

          <RoleSelect
            role={userData.role}
            onRoleChange={(value) =>
              setUserData((prev) => ({
                ...prev,
                role: value,
              }))
            }
          />

          <GroupSelect
            groups={groups}
            value={userData.groupId}
            onChange={(value) =>
              setUserData((prev) => ({
                ...prev,
                groupId: value,
                teamId: "", // Reset team when group changes
              }))
            }
          />

          {userData.groupId && (
            <TeamSelect
              availableTeams={getTeamsForGroup(userData.groupId)}
              selectedGroup={userData.groupId}
              selectedTeam={userData.teamId}
              onTeamChange={(value) =>
                setUserData((prev) => ({
                  ...prev,
                  teamId: value || "",
                }))
              }
            />
          )}

          <p className="text-sm text-muted-foreground">
            If the user doesn't exist in the system, an invitation will be sent to join.
          </p>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Add User"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

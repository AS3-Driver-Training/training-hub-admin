
import { useState } from "react";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  groups: { id: string; name: string; teams: any[] }[];
}

export default function AddUserDialog({
  clientId,
  clientName,
  groups,
}: AddUserDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

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

  // Convert groups to the proper format including missing fields
  const enhancedGroups = groups.map(group => ({
    ...group,
    description: null,  // Add missing properties
    is_default: null,
    client_id: clientId,
    // Adding optional fields to match Group type
    created_at: undefined,
    updated_at: undefined
  })) as Group[];

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
            groups={enhancedGroups}
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

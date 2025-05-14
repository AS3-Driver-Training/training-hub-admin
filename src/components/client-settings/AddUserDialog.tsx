
import { useState } from "react";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

import { EmailInput } from "./add-user/EmailInput";
import { RoleSelect } from "./add-user/RoleSelect";
import { GroupSelect } from "./add-user/GroupSelect";
import { TeamSelect } from "./add-user/TeamSelect";
import { ClientRole } from "./types";
import { AddUserToClientResponse } from "./types/rpc-responses";

interface AddUserDialogProps {
  clientId: string;
  clientName: string;
}

export default function AddUserDialog({
  clientId,
  clientName,
}: AddUserDialogProps) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<ClientRole>("supervisor");
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);

  // Reset form on close
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setEmail("");
      setRole("supervisor");
      setSelectedGroupId("");
      setSelectedTeamIds([]);
    }
  };

  const handleAddUser = async () => {
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }

    setIsLoading(true);
    console.log(`Adding user with email: ${email}, role: ${role}, to client: ${clientId}`);

    try {
      // Add user to client using database function
      const { data, error } = await supabase.rpc("add_user_to_client", {
        p_client_id: clientId,
        p_email: email,
        p_role: role,
      });

      if (error) throw error;

      // Properly type the response using two-step casting approach
      const response = (data as unknown) as AddUserToClientResponse;
      console.log("User/invitation added:", response);

      // If user needs invitation
      if (response.status === "invited" && response.invitation_id) {
        // Send invitation email
        const emailResponse = await supabase.functions.invoke(
          "send-invitation",
          {
            body: {
              email: email,
              token: response.token,
              clientName: clientName,
            },
          }
        );

        if (emailResponse.error) {
          throw emailResponse.error;
        }

        toast.success(`Invitation sent to ${email}`);
      } else if (response.status === "added") {
        toast.success(`User ${email} added to ${clientName}`);
      } else if (response.status === "exists") {
        toast.info(response.message);
      }

      // Add user to selected group if one is selected
      if (selectedGroupId && response.status === "added" && response.user_id) {
        const userId = response.user_id;
        await addUserToGroup(userId, selectedGroupId);
        
        // Add user to selected teams if any
        if (selectedTeamIds.length > 0) {
          await addUserToTeams(userId, selectedTeamIds);
        }
      }

      // Close dialog and refresh user list
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ['client_users', clientId] });
    } catch (err: any) {
      console.error("Error adding user:", err);
      toast.error(err.message || "Failed to add user");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to add user to group
  const addUserToGroup = async (userId: string, groupId: string) => {
    try {
      const { error } = await supabase
        .from('user_groups')
        .insert({ user_id: userId, group_id: groupId });
      
      if (error) throw error;
    } catch (err: any) {
      console.error("Error adding user to group:", err);
      toast.error("Added user but failed to assign group");
    }
  };

  // Helper function to add user to teams
  const addUserToTeams = async (userId: string, teamIds: string[]) => {
    try {
      const teamRecords = teamIds.map(teamId => ({
        user_id: userId,
        team_id: teamId
      }));
      
      const { error } = await supabase
        .from('user_teams')
        .insert(teamRecords);
      
      if (error) throw error;
    } catch (err: any) {
      console.error("Error adding user to teams:", err);
      toast.error("Added user but failed to assign teams");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
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
            Add a new user to {clientName}. If they don't have an account yet,
            they'll receive an invitation email.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <EmailInput
            email={email}
            onEmailChange={setEmail}
            disabled={isLoading}
          />
          <RoleSelect
            role={role}
            onRoleChange={setRole}
            value={role}
            onChange={setRole}
          />
          <GroupSelect
            clientId={clientId}
            selectedGroupId={selectedGroupId}
            onGroupChange={setSelectedGroupId}
            disabled={isLoading}
          />
          {selectedGroupId && (
            <TeamSelect
              groupId={selectedGroupId}
              selectedTeamIds={selectedTeamIds}
              onTeamsChange={setSelectedTeamIds}
              disabled={isLoading}
            />
          )}
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleAddUser} disabled={isLoading}>
            {isLoading ? "Adding..." : "Add User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

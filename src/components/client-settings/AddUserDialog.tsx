
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RoleSelect } from "./add-user/RoleSelect";
import { GroupSelect } from "./add-user/GroupSelect";
import { TeamSelect } from "./add-user/TeamSelect";

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
  const [activeTab, setActiveTab] = useState("existing");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  // Form state for adding an existing user
  const [existingUserData, setExistingUserData] = useState({
    email: "",
    role: "supervisor",
    groupId: "",
    teamId: "",
  });

  // Form state for inviting a new user
  const [newUserData, setNewUserData] = useState({
    email: "",
    role: "supervisor",
    groupId: "",
    teamId: "",
  });

  // Get teams for the selected group
  const getTeamsForGroup = (groupId: string) => {
    const group = groups.find((g) => g.id === groupId);
    return group ? group.teams : [];
  };

  // Handle adding an existing user
  const handleAddExistingUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Call the add_user_to_client function
      const { data, error } = await supabase.rpc("add_user_to_client", {
        p_client_id: clientId,
        p_email: existingUserData.email,
        p_role: existingUserData.role,
      });

      if (error) throw error;

      if (data.status === "exists") {
        toast.info(data.message);
      } else if (data.status === "added") {
        toast.success(data.message);
        
        // Add user to selected group if specified
        if (existingUserData.groupId) {
          await addUserToGroup(data.user_id || "", existingUserData.groupId);
          
          // Add user to selected team if specified
          if (existingUserData.teamId) {
            await addUserToTeam(data.user_id || "", existingUserData.teamId);
          }
        }
      } else if (data.status === "invited") {
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

  // Handle inviting a new user
  const handleInviteNewUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Generate invitation token
      const { data: tokenData, error: tokenError } = await supabase.rpc("generate_invitation_token");
      if (tokenError) throw tokenError;

      // Create invitation record
      const { error: invitationError } = await supabase
        .from("invitations")
        .insert({
          client_id: clientId,
          email: newUserData.email,
          token: tokenData,
          status: "pending",
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        });

      if (invitationError) throw invitationError;

      // Send invitation email
      const emailResponse = await supabase.functions.invoke("send-invitation", {
        body: {
          clientName,
          email: newUserData.email,
          token: tokenData,
        },
      });

      if (emailResponse.error) throw emailResponse.error;

      toast.success("Invitation sent successfully");

      // Invalidate and refetch invitations query
      await queryClient.invalidateQueries({ queryKey: ["invitations", clientId] });

      setIsOpen(false);
      resetForm();
    } catch (error: any) {
      console.error("Error inviting user:", error);
      toast.error(error.message || "Failed to invite user");
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
    setExistingUserData({
      email: "",
      role: "supervisor",
      groupId: "",
      teamId: "",
    });
    setNewUserData({
      email: "",
      role: "supervisor",
      groupId: "",
      teamId: "",
    });
    setActiveTab("existing");
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="existing">Add Existing User</TabsTrigger>
            <TabsTrigger value="invite">Invite New User</TabsTrigger>
          </TabsList>

          <TabsContent value="existing" className="mt-4">
            <form onSubmit={handleAddExistingUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="existing-email">Email</Label>
                <Input
                  id="existing-email"
                  type="email"
                  placeholder="user@example.com"
                  value={existingUserData.email}
                  onChange={(e) =>
                    setExistingUserData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <RoleSelect
                value={existingUserData.role}
                onChange={(value) =>
                  setExistingUserData((prev) => ({
                    ...prev,
                    role: value,
                  }))
                }
              />

              <GroupSelect
                groups={groups}
                value={existingUserData.groupId}
                onChange={(value) =>
                  setExistingUserData((prev) => ({
                    ...prev,
                    groupId: value,
                    teamId: "", // Reset team when group changes
                  }))
                }
              />

              {existingUserData.groupId && (
                <TeamSelect
                  teams={getTeamsForGroup(existingUserData.groupId)}
                  value={existingUserData.teamId}
                  onChange={(value) =>
                    setExistingUserData((prev) => ({
                      ...prev,
                      teamId: value,
                    }))
                  }
                />
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Adding..." : "Add User"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="invite" className="mt-4">
            <form onSubmit={handleInviteNewUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-email">Email</Label>
                <Input
                  id="new-email"
                  type="email"
                  placeholder="newuser@example.com"
                  value={newUserData.email}
                  onChange={(e) =>
                    setNewUserData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <RoleSelect
                value={newUserData.role}
                onChange={(value) =>
                  setNewUserData((prev) => ({
                    ...prev,
                    role: value,
                  }))
                }
              />

              <p className="text-sm text-muted-foreground">
                An invitation will be sent to the email address. The user will be
                able to join the client after accepting the invitation.
              </p>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Invitation"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

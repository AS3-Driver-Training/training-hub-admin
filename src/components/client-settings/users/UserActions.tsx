
import { toast } from "sonner";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Mail, Trash2, UserCog } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { UserData } from "./types";

interface UserActionsProps {
  user: UserData;
  clientId: string;
  onManageUser: (user: UserData) => void;
}

export function UserActions({ user, clientId, onManageUser }: UserActionsProps) {
  const queryClient = useQueryClient();

  const handleResendInvitation = async () => {
    try {
      const { data: tokenData, error: tokenError } = await supabase
        .rpc('generate_invitation_token');

      if (tokenError) throw tokenError;

      const { error: inviteError } = await supabase
        .from('invitations')
        .insert({
          client_id: clientId,
          email: user.email,
          token: tokenData,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        });

      if (inviteError) throw inviteError;

      const emailResponse = await supabase.functions.invoke('send-invitation', {
        body: {
          email: user.email,
          token: tokenData,
        },
      });

      if (emailResponse.error) throw emailResponse.error;

      toast.success("Invitation resent successfully");
    } catch (error: any) {
      console.error("Error resending invitation:", error);
      toast.error(error.message || "Failed to resend invitation");
    }
  };

  const handleDeleteUser = async () => {
    if (!confirm("Are you sure you want to remove this user?")) return;

    try {
      const { error } = await supabase
        .from('client_users')
        .delete()
        .eq('id', user.id);

      if (error) throw error;

      toast.success("User removed successfully");
      queryClient.invalidateQueries({ queryKey: ['client_users', clientId] });
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error(error.message || "Failed to delete user");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onManageUser(user)}>
          <UserCog className="mr-2 h-4 w-4" />
          Manage Groups & Teams
        </DropdownMenuItem>
        {user.status === "pending" && (
          <DropdownMenuItem onClick={handleResendInvitation}>
            <Mail className="mr-2 h-4 w-4" />
            Resend Invitation
          </DropdownMenuItem>
        )}
        <DropdownMenuItem 
          onClick={handleDeleteUser}
          className="text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Remove User
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

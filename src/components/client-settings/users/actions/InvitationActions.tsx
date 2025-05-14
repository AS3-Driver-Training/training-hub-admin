
import { toast } from "sonner";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Mail, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { UserData } from "../../types/index";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";

interface InvitationActionsProps {
  user: UserData;
  clientId: string;
  onManageUser: (user: UserData) => void;
}

export function InvitationActions({ user, clientId, onManageUser }: InvitationActionsProps) {
  const queryClient = useQueryClient();
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleResendInvitation = async () => {
    setIsLoading(true);
    try {
      // Generate a new token
      const { data: tokenData, error: tokenError } = await supabase
        .rpc('generate_invitation_token');

      if (tokenError) throw tokenError;

      // Update existing invitation with new token, preserving the role
      const { error: updateError } = await supabase
        .from('invitations')
        .update({
          token: tokenData,
          status: 'pending',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          // Preserve the existing role from the user object
          role: user.role
        })
        .eq('id', user.invitationId);

      if (updateError) throw updateError;

      // Send invitation email
      const emailResponse = await supabase.functions.invoke('send-invitation', {
        body: {
          clientId,
          email: user.email,
          token: tokenData,
          clientName: user.clientName || '',
        },
      });

      if (emailResponse.error) throw emailResponse.error;

      toast.success("Invitation resent successfully to " + user.email);
      
      // Properly invalidate the query to refresh the table
      await queryClient.invalidateQueries({ queryKey: ['client_users', clientId] });
    } catch (error: any) {
      console.error("Error resending invitation:", error);
      toast.error(error.message || "Failed to resend invitation");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeInvitation = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('invitations')
        .delete()
        .eq('id', user.invitationId);

      if (error) throw error;

      toast.success("Invitation deleted successfully");
      
      // Properly invalidate the query to refresh the table
      await queryClient.invalidateQueries({ queryKey: ['client_users', clientId] });
    } catch (error: any) {
      console.error("Error deleting invitation:", error);
      toast.error(error.message || "Failed to delete invitation");
    } finally {
      setIsLoading(false);
      setIsConfirmDeleteOpen(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={isLoading}>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleResendInvitation} disabled={isLoading}>
            <Mail className="mr-2 h-4 w-4" />
            Resend Invitation
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setIsConfirmDeleteOpen(true)}
            className="text-destructive"
            disabled={isLoading}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Revoke Invitation
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Revoke Invitation Confirmation */}
      <AlertDialog 
        open={isConfirmDeleteOpen} 
        onOpenChange={setIsConfirmDeleteOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Invitation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke the invitation sent to {user.email}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRevokeInvitation}
              className="bg-destructive text-destructive-foreground"
              disabled={isLoading}
            >
              {isLoading ? "Revoking..." : "Revoke Invitation"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

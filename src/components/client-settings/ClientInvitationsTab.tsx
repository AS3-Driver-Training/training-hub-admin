import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mail, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ClientInvitationsTabProps {
  clientId: string;
  clientName: string;
}

export function ClientInvitationsTab({ clientId, clientName }: ClientInvitationsTabProps) {
  const { data: invitations, isLoading, refetch } = useQuery({
    queryKey: ['invitations', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleResendInvitation = async (invitationId: string, email: string) => {
    try {
      // Generate a new token
      const { data: tokenData, error: tokenError } = await supabase
        .rpc('generate_invitation_token');

      if (tokenError) throw tokenError;

      // Update existing invitation with new token
      const { error: updateError } = await supabase
        .from('invitations')
        .update({
          token: tokenData,
          status: 'pending',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq('id', invitationId);

      if (updateError) throw updateError;

      // Send invitation email
      const emailResponse = await supabase.functions.invoke('send-invitation', {
        body: {
          clientName: clientName,
          email: email,
          token: tokenData,
        },
      });

      if (emailResponse.error) throw emailResponse.error;

      toast.success("Invitation resent successfully");
      refetch();
    } catch (error: any) {
      console.error("Error resending invitation:", error);
      toast.error(error.message || "Failed to resend invitation");
    }
  };

  const handleRevokeInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;

      toast.success("Invitation deleted successfully");
      refetch();
    } catch (error: any) {
      console.error("Error deleting invitation:", error);
      toast.error(error.message || "Failed to delete invitation");
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold">Pending Invitations</h3>
          <p className="text-sm text-muted-foreground">
            Manage and track pending invitations
          </p>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sent At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitations?.map((invitation) => (
              <TableRow key={invitation.id}>
                <TableCell>{invitation.email}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      invitation.status === "pending"
                        ? "secondary"
                        : "default"
                    }
                  >
                    {invitation.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(invitation.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleResendInvitation(
                          invitation.id,
                          invitation.email
                        )
                      }
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleRevokeInvitation(invitation.id)
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
import { DashboardLayout } from "@/components/DashboardLayout";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus, Mail, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface CreateClientResponse {
  client_id: string;
  invitation_id: string;
  token: string;
}

export default function ClientSettings() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("users");

  const { data: client, isLoading: isLoadingClient } = useQuery({
    queryKey: ['client', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['client_users', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_users')
        .select(`
          *,
          user:user_id(
            email,
            id
          )
        `)
        .eq('client_id', clientId);

      if (error) throw error;
      return data;
    },
  });

  const { data: invitations, isLoading: isLoadingInvitations } = useQuery({
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

  if (isLoadingClient || isLoadingUsers || isLoadingInvitations) {
    return <div>Loading...</div>;
  }

  if (!client) {
    return <div>Client not found</div>;
  }

  const handleResendInvitation = async (invitationId: string, email: string) => {
    try {
      // Generate new token
      const { data, error } = await supabase.rpc('create_client_with_invitation', {
        client_name: client.name,
        contact_email: email,
      });

      if (error) throw error;

      // Type assertion to match the CreateClientResponse interface
      const response = data as unknown as CreateClientResponse;

      // Send invitation email
      const emailResponse = await supabase.functions.invoke('send-invitation', {
        body: {
          clientName: client.name,
          email: email,
          token: response.token,
        },
      });

      if (emailResponse.error) throw emailResponse.error;

      toast.success("Invitation resent successfully");
    } catch (error: any) {
      console.error("Error resending invitation:", error);
      toast.error(error.message || "Failed to resend invitation");
    }
  };

  const handleRevokeInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('invitations')
        .update({ status: 'revoked' })
        .eq('id', invitationId);

      if (error) throw error;

      toast.success("Invitation revoked successfully");
    } catch (error: any) {
      console.error("Error revoking invitation:", error);
      toast.error(error.message || "Failed to revoke invitation");
    }
  };

  const handleRemoveUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('client_users')
        .delete()
        .eq('client_id', clientId)
        .eq('user_id', userId);

      if (error) throw error;

      toast.success("User removed successfully");
    } catch (error: any) {
      console.error("Error removing user:", error);
      toast.error(error.message || "Failed to remove user");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{client.name}</h1>
            <p className="text-muted-foreground">
              Manage client settings, users, and invitations
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="invitations">Invitations</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-semibold">Client Users</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage users who have access to this client
                  </p>
                </div>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add User
                </Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.user.email}</TableCell>
                        <TableCell>
                          <Badge>{user.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveUser(user.user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="invitations" className="space-y-4">
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
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold">Client Settings</h3>
                <p className="text-sm text-muted-foreground">
                  Manage client preferences and settings
                </p>
              </div>
              {/* Add settings form here */}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
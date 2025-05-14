
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import AddUserDialog from "./AddUserDialog";
import { UsersTable } from "./UsersTable";
import { toast } from "sonner";
import { UserData, ClientRole } from "./types";
import { useQueryClient } from "@tanstack/react-query";

interface ClientUsersTabProps {
  clientId: string;
  clientName: string;
}

export function ClientUsersTab({ clientId, clientName }: ClientUsersTabProps) {
  const queryClient = useQueryClient();

  // Replace the useEffect with useQuery for proper query invalidation
  const { 
    data: usersData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['client_users', clientId],
    queryFn: async () => {
      try {
        console.log("Fetching users for client:", clientId);
        
        // Get client users with profile data
        const { data: userData, error: userError } = await supabase
          .from('client_users')
          .select(`
            id,
            user_id,
            client_id,
            role,
            status,
            created_at,
            updated_at,
            profiles:user_id (
              email,
              first_name,
              last_name
            )
          `)
          .eq('client_id', clientId);

        if (userError) {
          console.error("Error fetching users:", userError);
          toast.error("Failed to load users");
          throw userError;
        }

        // Get pending invitations - now including the role field
        const { data: invitationsData, error: invitationsError } = await supabase
          .from('invitations')
          .select('id, client_id, email, status, created_at, updated_at, role')
          .eq('client_id', clientId)
          .eq('status', 'pending');

        if (invitationsError) {
          console.error("Error fetching invitations:", invitationsError);
          toast.error("Failed to load invitations");
          throw invitationsError;
        }

        console.log("Fetched invitations with roles:", invitationsData);

        // Transform user data to match UserData interface
        const transformedUsers: UserData[] = (userData || []).map(user => ({
          id: user.id,
          user_id: user.user_id,
          client_id: user.client_id,
          role: user.role,
          status: user.status,
          created_at: user.created_at,
          updated_at: user.updated_at,
          email: user.profiles?.email || '',
          profiles: {
            first_name: user.profiles?.first_name || null,
            last_name: user.profiles?.last_name || null
          },
          // Groups and teams will be populated by UsersTable component
          groups: [],
          teams: []
        }));

        // Transform invitations to match UserData interface - using the role from the invitation
        const transformedInvitations: UserData[] = (invitationsData || []).map(invitation => ({
          id: invitation.id,
          invitationId: invitation.id, // Store the invitation ID for reference
          user_id: null, // No user ID for pending invitations
          client_id: invitation.client_id,
          role: invitation.role || 'supervisor', // Use the role stored in the invitation
          status: 'pending',
          created_at: invitation.created_at,
          updated_at: invitation.updated_at,
          email: invitation.email,
          is_invitation: true, // Flag to identify this as an invitation
          profiles: {
            first_name: 'Invited',
            last_name: 'User'
          },
          groups: [],
          teams: []
        }));
        
        // Combine users and invitations
        return [...transformedUsers, ...transformedInvitations];
      } catch (err: any) {
        console.error("Error in users fetch process:", err);
        throw err;
      }
    },
  });

  // Handle displaying error state
  const errorMessage = error ? (error as Error).message || "Failed to load users" : null;

  if (errorMessage) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center h-32 gap-4">
          <p className="text-destructive">{errorMessage}</p>
          <button 
            className="text-sm text-primary hover:underline" 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['client_users', clientId] })}
          >
            Try again
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold">Users</h3>
          <p className="text-sm text-muted-foreground">
            Manage {clientName} users and their permissions
          </p>
        </div>
        <AddUserDialog clientId={clientId} clientName={clientName} />
      </div>
      
      <UsersTable 
        users={usersData || []} 
        clientId={clientId}
        isLoading={isLoading}
      />
    </Card>
  );
}

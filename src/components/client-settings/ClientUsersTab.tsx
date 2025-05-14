import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import AddUserDialog from "./AddUserDialog";
import { UsersTable } from "./UsersTable";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { UserData } from "./types";
import { useQueryClient } from "@tanstack/react-query";

interface ClientUsersTabProps {
  clientId: string;
  clientName: string;
}

export function ClientUsersTab({ clientId, clientName }: ClientUsersTabProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [usersData, setUsersData] = useState<UserData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch users and invitations data from Supabase
  useEffect(() => {
    async function fetchUsersAndInvitations() {
      try {
        setIsLoading(true);
        setError(null);
        
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
          setError(userError.message || "Failed to load users");
          setIsLoading(false);
          toast.error("Failed to load users");
          return;
        }

        // Get pending invitations
        const { data: invitationsData, error: invitationsError } = await supabase
          .from('invitations')
          .select('*')
          .eq('client_id', clientId)
          .eq('status', 'pending');

        if (invitationsError) {
          console.error("Error fetching invitations:", invitationsError);
          setError(invitationsError.message || "Failed to load invitations");
          setIsLoading(false);
          toast.error("Failed to load invitations");
          return;
        }

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

        // Transform invitations to match UserData interface
        const transformedInvitations: UserData[] = (invitationsData || []).map(invitation => ({
          id: invitation.id,
          invitationId: invitation.id, // Store the invitation ID for reference
          user_id: null, // No user ID for pending invitations
          client_id: invitation.client_id,
          role: 'supervisor', // Default role for invitations since it's not stored in the invitations table
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
        setUsersData([...transformedUsers, ...transformedInvitations]);
        setIsLoading(false);
        console.log("Users and invitations fetched successfully:", {
          users: transformedUsers.length,
          invitations: transformedInvitations.length
        });
        
      } catch (err: any) {
        console.error("Error in users fetch process:", err);
        setError(err.message || "Failed to load users");
        setIsLoading(false);
        toast.error("Failed to load users");
      }
    }
    
    fetchUsersAndInvitations();
    
    // Setup a subscription to refresh data when the query is invalidated
    const unsubscribe = queryClient.getQueryCache().subscribe(() => {
      const queryKey = ['client_users', clientId];
      if (queryClient.getQueryState(queryKey)?.isInvalidated) {
        console.log("Query invalidated, refetching data");
        fetchUsersAndInvitations();
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, [clientId, queryClient]);

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center h-32 gap-4">
          <p className="text-destructive">{error}</p>
          <button 
            className="text-sm text-primary hover:underline" 
            onClick={() => window.location.reload()}
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
        users={usersData} 
        clientId={clientId}
        isLoading={isLoading}
      />
    </Card>
  );
}

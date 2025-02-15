
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { AddUserDialog } from "./AddUserDialog";
import { UsersTable } from "./UsersTable";

interface ClientUsersTabProps {
  clientId: string;
  clientName: string;
}

export function ClientUsersTab({ clientId, clientName }: ClientUsersTabProps) {
  const { data: users, isLoading } = useQuery({
    queryKey: ['client_users', clientId],
    queryFn: async () => {
      try {
        // Get all client users with their profile information and groups/teams
        const { data: clientUsers, error: clientUsersError } = await supabase
          .from('client_users')
          .select(`
            id,
            role,
            status,
            user_id,
            client_id,
            created_at,
            updated_at,
            profiles!client_users_user_id_fkey (
              first_name,
              last_name
            ),
            groups:user_groups(
              id,
              group:groups(
                id,
                name
              )
            ),
            teams:user_teams(
              id,
              team:teams(
                id,
                name
              )
            )
          `)
          .eq('client_id', clientId);

        if (clientUsersError) {
          console.error('Error fetching client users:', clientUsersError);
          throw clientUsersError;
        }

        // Then fetch email addresses for each user
        const usersWithDetails = await Promise.all(
          (clientUsers || []).map(async (user) => {
            try {
              // Get user email from auth
              const { data: userData, error: userError } = await supabase.functions.invoke(
                'get-user-by-id',
                { 
                  body: { 
                    userId: user.user_id,
                    debug: true
                  } 
                }
              );

              if (userError) {
                console.error('Error fetching user:', userError);
                throw userError;
              }

              return {
                ...user,
                email: userData?.user?.email || 'No email found',
                groups: user.groups
                  .map(g => g.group)
                  .filter(Boolean) || [],
                teams: user.teams
                  .map(t => t.team)
                  .filter(Boolean) || []
              };
            } catch (error) {
              console.error('Error processing user:', user.user_id, error);
              return {
                ...user,
                email: 'Error loading email',
                groups: [],
                teams: []
              };
            }
          })
        );

        console.log('Fetched users with details:', usersWithDetails);
        return usersWithDetails;
      } catch (error) {
        console.error('Error in queryFn:', error);
        throw error;
      }
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold">Users</h3>
          <p className="text-sm text-muted-foreground">
            Manage client users and their permissions
          </p>
        </div>
        <AddUserDialog clientId={clientId} />
      </div>
      <UsersTable users={users} clientId={clientId} />
    </Card>
  );
}

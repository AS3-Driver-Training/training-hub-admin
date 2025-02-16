
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
        console.log('Fetching client users for client:', clientId);
        
        // Get all client users with their profile information and exact client match
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
            )
          `)
          .eq('client_id', clientId)
          .eq('status', 'active'); // Only get active users

        if (clientUsersError) {
          console.error('Error fetching client users:', clientUsersError);
          throw clientUsersError;
        }

        console.log('Successfully fetched client users:', clientUsers);

        // Fetch user details, groups, and teams in parallel for each user
        const usersWithDetails = await Promise.all(
          (clientUsers || []).map(async (user) => {
            try {
              console.log('Processing user:', user.user_id);
              
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

              // First get user's groups
              const { data: userGroups, error: groupsError } = await supabase
                .from('user_groups')
                .select(`
                  groups (
                    id,
                    name
                  )
                `)
                .eq('user_id', user.user_id)
                .eq('groups.client_id', clientId); // Filter groups by client

              if (groupsError) {
                console.error('Error fetching user groups:', groupsError);
                throw groupsError;
              }

              // Get group IDs for team filtering
              const groupIds = userGroups?.map(ug => ug.groups?.id).filter(Boolean) || [];

              // Then get teams for those groups
              const { data: userTeams, error: teamsError } = await supabase
                .from('user_teams')
                .select(`
                  teams (
                    id,
                    name
                  )
                `)
                .eq('user_id', user.user_id)
                .in('teams.group_id', groupIds);

              if (teamsError) {
                console.error('Error fetching user teams:', teamsError);
                throw teamsError;
              }

              if (userError) {
                console.error('Error fetching user data:', userError);
                throw userError;
              }

              const processedUser = {
                ...user,
                email: userData?.user?.email || 'No email found',
                groups: (userGroups || [])
                  .map(g => g.groups)
                  .filter(Boolean),
                teams: (userTeams || [])
                  .map(t => t.teams)
                  .filter(Boolean)
              };

              console.log('Processed user details:', processedUser);
              return processedUser;
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

        console.log('Final users with details:', usersWithDetails);
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

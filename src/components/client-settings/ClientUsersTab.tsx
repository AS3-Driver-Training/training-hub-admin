
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { AddUserDialog } from "./AddUserDialog";
import { UsersTable } from "./UsersTable";
import { toast } from "sonner";

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
        
        // First get the client users
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
          .eq('status', 'active');

        if (clientUsersError) {
          console.error('Error fetching client users:', clientUsersError);
          throw clientUsersError;
        }

        if (!clientUsers?.length) {
          return [];
        }

        console.log('Successfully fetched client users:', clientUsers);

        // Get all user details in parallel
        const usersWithDetails = await Promise.all(
          clientUsers.map(async (user) => {
            try {
              // Get user email
              const { data: userData, error: userError } = await supabase.functions.invoke(
                'get-user-by-id',
                { body: { userId: user.user_id } }
              );

              if (userError) {
                throw userError;
              }

              // Get user's groups in this client
              const { data: userGroups } = await supabase
                .from('user_groups')
                .select(`
                  group_id,
                  groups!inner (
                    id,
                    name,
                    description,
                    is_default
                  )
                `)
                .eq('user_id', user.user_id);

              const groups = (userGroups || []).map(ug => ug.groups);
              const groupIds = groups.map(g => g.id);

              // Get user's teams in those groups
              const { data: userTeams } = await supabase
                .from('user_teams')
                .select(`
                  team_id,
                  teams!inner (
                    id,
                    name,
                    group_id
                  )
                `)
                .eq('user_id', user.user_id)
                .in('teams.group_id', groupIds.length ? groupIds : ['00000000-0000-0000-0000-000000000000']);

              const teams = (userTeams || [])
                .map(ut => ({
                  ...ut.teams,
                  group: groups.find(g => g.id === ut.teams.group_id)
                }));

              return {
                ...user,
                email: userData?.user?.email || 'No email found',
                groups,
                teams
              };
            } catch (error) {
              console.error('Error processing user:', user.user_id, error);
              toast.error(`Error loading data for user ${user.profiles?.first_name || 'Unknown'}`);
              return {
                ...user,
                email: 'Error loading email',
                groups: [],
                teams: []
              };
            }
          })
        );

        return usersWithDetails;
      } catch (error) {
        console.error('Error in queryFn:', error);
        toast.error('Error loading users');
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

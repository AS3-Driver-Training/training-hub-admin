
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
      // Get all client users with their profile information
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
          user:user_id (
            email
          ),
          profile:user_id (
            first_name,
            last_name
          )
        `)
        .eq('client_id', clientId);

      if (clientUsersError) {
        console.error('Error fetching client users:', clientUsersError);
        throw clientUsersError;
      }

      // Then fetch email addresses for each user since we can't get them directly
      const usersWithDetails = await Promise.all(
        clientUsers.map(async (user) => {
          // Get user email from auth
          const { data: userData, error: userError } = await supabase.functions.invoke(
            'get-user-by-id',
            { 
              body: { 
                userId: user.user_id 
              } 
            }
          );

          if (userError) {
            console.error('Error fetching user:', userError);
          }

          // Get group count
          const { count: groupCount, error: groupError } = await supabase
            .from('user_groups')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.user_id);

          if (groupError) {
            console.error('Error counting groups:', groupError);
          }

          // Get team count
          const { count: teamCount, error: teamError } = await supabase
            .from('user_teams')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.user_id);

          if (teamError) {
            console.error('Error counting teams:', teamError);
          }

          return {
            ...user,
            profiles: user.profile || { first_name: 'Unknown', last_name: 'User' },
            email: userData?.user?.email || user.user?.email || 'No email found',
            groups: Array(groupCount || 0),
            teams: Array(teamCount || 0)
          };
        })
      );

      console.log('Fetched users:', usersWithDetails);
      return usersWithDetails;
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


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
      const { data: clientUsers, error: clientUsersError } = await supabase
        .from('client_users')
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name
          )
        `)
        .eq('client_id', clientId);

      if (clientUsersError) throw clientUsersError;

      const usersWithDetails = await Promise.all(
        clientUsers.map(async (user) => {
          const { data: userGroups, error: groupsError } = await supabase
            .from('user_groups')
            .select('groups (name)')
            .eq('user_id', user.user_id);

          if (groupsError) console.error('Error fetching groups:', groupsError);

          const { data: userTeams, error: teamsError } = await supabase
            .from('user_teams')
            .select('teams (name)')
            .eq('user_id', user.user_id);

          if (teamsError) console.error('Error fetching teams:', teamsError);

          const { data: userData, error: userError } = await supabase.functions.invoke(
            'get-user-by-id',
            { 
              body: { 
                userId: user.user_id 
              } 
            }
          );

          if (userError) console.error('Error fetching user:', userError);

          return {
            ...user,
            email: userData?.user?.email || '',
            groups: userGroups?.map(g => g.groups) || [],
            teams: userTeams?.map(t => t.teams) || []
          };
        })
      );

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

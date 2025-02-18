
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

        // Get the client users with their profiles in a single query
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
            profiles (
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

        // Process each user sequentially to avoid overloading
        const usersWithDetails = [];
        for (const user of clientUsers) {
          try {
            // Get user email
            const { data: userData, error: userError } = await supabase.functions.invoke(
              'get-user-by-id',
              { body: { userId: user.user_id } }
            );

            if (userError) throw userError;

            // Get user's groups in a single query
            const { data: groups, error: groupsError } = await supabase
              .from('groups')
              .select(`
                id,
                name,
                description,
                is_default
              `)
              .eq('client_id', clientId);

            if (groupsError) throw groupsError;

            // Get user's teams in a single query
            const { data: teams, error: teamsError } = await supabase
              .from('teams')
              .select(`
                id,
                name,
                group_id
              `)
              .in('group_id', groups.map(g => g.id));

            if (teamsError) throw teamsError;

            // Map teams to include their group information
            const processedTeams = teams.map(team => ({
              ...team,
              group: groups.find(g => g.id === team.group_id)
            }));

            usersWithDetails.push({
              ...user,
              email: userData?.user?.email || 'No email found',
              groups: groups || [],
              teams: processedTeams || []
            });
          } catch (error) {
            console.error('Error processing user:', user.user_id, error);
            toast.error(`Error loading data for user ${user.profiles?.first_name || 'Unknown'}`);
            usersWithDetails.push({
              ...user,
              email: 'Error loading email',
              groups: [],
              teams: []
            });
          }
        }

        return usersWithDetails;
      } catch (error: any) {
        console.error('Error in queryFn:', error);
        toast.error(`Error loading users: ${error.message || 'Unknown error'}`);
        throw error;
      }
    },
    retry: 1
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


import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { AddUserDialog } from "./AddUserDialog";
import { UsersTable } from "./UsersTable";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ClientUsersTabProps {
  clientId: string;
  clientName: string;
}

export function ClientUsersTab({ clientId, clientName }: ClientUsersTabProps) {
  const { data: users, isLoading } = useQuery({
    queryKey: ['client_users', clientId],
    queryFn: async () => {
      try {
        // Step 1: Get client users
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
            profiles:user_id (
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

        const userIds = clientUsers.map(user => user.user_id);

        // Step 2: Fetch all required data before mapping
        // Get user emails
        const { data: usersData, error: usersError } = await supabase.functions.invoke(
          'get-user-by-id',
          { 
            body: { 
              userIds: userIds 
            } 
          }
        );

        if (usersError) throw usersError;

        // Get groups
        const { data: groups, error: groupsError } = await supabase
          .from('groups')
          .select(`
            id,
            name,
            description,
            is_default,
            teams (
              id,
              name,
              group_id
            )
          `)
          .eq('client_id', clientId);

        if (groupsError) throw groupsError;

        // Get user group assignments
        const { data: userGroups, error: userGroupsError } = await supabase
          .from('user_groups')
          .select('*')
          .in('user_id', userIds);

        if (userGroupsError) throw userGroupsError;

        // Get user team assignments
        const { data: userTeams, error: userTeamsError } = await supabase
          .from('user_teams')
          .select('*')
          .in('user_id', userIds);

        if (userTeamsError) throw userTeamsError;

        // Step 3: Now map the data with all variables properly declared
        return clientUsers.map(user => {
          const userEmail = usersData?.users?.find(u => u.id === user.user_id)?.email || 'No email found';
          
          // Use the now-declared userGroups and userTeams
          const userGroupIds = (userGroups || [])
            .filter(ug => ug.user_id === user.user_id)
            .map(ug => ug.group_id);

          const userTeamIds = (userTeams || [])
            .filter(ut => ut.user_id === user.user_id)
            .map(ut => ut.team_id);

          const userGroups = (groups || []).filter(group => 
            userGroupIds.includes(group.id) || 
            (group.is_default && userGroupIds.length === 0)
          );

          const userTeams = userGroups.flatMap(group => 
            group.teams?.filter(team => userTeamIds.includes(team.id)) || []
          );

          return {
            ...user,
            email: userEmail,
            groups: userGroups,
            teams: userTeams.map(team => ({
              ...team,
              group: userGroups.find(g => g.id === team.group_id)
            }))
          };
        });
      } catch (error: any) {
        console.error('Error in queryFn:', error);
        toast.error(`Error loading users: ${error.message || 'Unknown error'}`);
        throw error;
      }
    },
    retry: 1
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
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
            Manage client users and their permissions
          </p>
        </div>
        <AddUserDialog clientId={clientId} />
      </div>
      <UsersTable users={users} clientId={clientId} />
    </Card>
  );
}

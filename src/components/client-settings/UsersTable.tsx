
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { UserData } from "./types";
import { EditUserDialog } from "./users/EditUserDialog";
import { UserRow } from "./users/UserRow";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

interface UsersTableProps {
  users: UserData[] | undefined;
  clientId: string;
  isLoading?: boolean;
}

export function UsersTable({ users, clientId, isLoading }: UsersTableProps) {
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isManageGroupsOpen, setIsManageGroupsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  // Fetch real groups and teams data from Supabase
  const { data: groups = [], isLoading: isGroupsLoading } = useQuery({
    queryKey: ['client_groups', clientId],
    queryFn: async () => {
      console.log('Fetching real groups for client:', clientId);
      
      const { data: groupsData, error: groupsError } = await supabase
        .from('groups')
        .select('id, name, description, is_default')
        .eq('client_id', clientId)
        .order('is_default', { ascending: false })
        .order('name');

      if (groupsError) {
        console.error('Error fetching groups:', groupsError);
        throw groupsError;
      }

      // Enhanced groups with teams
      const enhancedGroups = [];
      
      for (const group of groupsData || []) {
        // Fetch teams for this group
        const { data: teamsData, error: teamsError } = await supabase
          .from('teams')
          .select('id, name, group_id')
          .eq('group_id', group.id);

        if (teamsError) {
          console.error('Error fetching teams for group:', teamsError);
          throw teamsError;
        }

        enhancedGroups.push({
          ...group,
          client_id: clientId,
          teams: teamsData || []
        });
      }

      console.log('Fetched real groups and teams:', enhancedGroups);
      return enhancedGroups;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch user group and team assignments
  const { data: userGroupAssignments = {}, isLoading: isUserGroupsLoading } = useQuery({
    queryKey: ['user_groups_assignments', clientId, users?.map(u => u.id).join(',')],
    queryFn: async () => {
      if (!users?.length) return {};
      
      const userIds = users.map(u => u.user_id);
      console.log('Fetching user group assignments for users:', userIds);
      
      // Get user-group assignments
      const { data: userGroups, error: userGroupsError } = await supabase
        .from('user_groups')
        .select('user_id, group_id')
        .in('user_id', userIds);

      if (userGroupsError) {
        console.error('Error fetching user groups:', userGroupsError);
        throw userGroupsError;
      }

      // Get user-team assignments
      const { data: userTeams, error: userTeamsError } = await supabase
        .from('user_teams')
        .select('user_id, team_id')
        .in('user_id', userIds);

      if (userTeamsError) {
        console.error('Error fetching user teams:', userTeamsError);
        throw userTeamsError;
      }

      // Create a map of user_id to their groups and teams
      const userAssignments: Record<string, { groupIds: string[], teamIds: string[] }> = {};
      
      for (const userId of userIds) {
        userAssignments[userId] = { 
          groupIds: userGroups?.filter(ug => ug.user_id === userId).map(ug => ug.group_id) || [],
          teamIds: userTeams?.filter(ut => ut.user_id === userId).map(ut => ut.team_id) || []
        };
      }

      console.log('Fetched user assignments:', userAssignments);
      return userAssignments;
    },
    enabled: !!users?.length,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleEditUser = (user: UserData) => {
    setSelectedUser(user);
    setIsEditUserOpen(true);
  };

  const handleManageGroupsTeams = (user: UserData) => {
    setSelectedUser(user);
    setIsManageGroupsOpen(true);
  };

  // Enrich users with their real groups and teams
  const processedUsers = users?.map(user => {
    const userAssignments = userGroupAssignments[user.user_id] || { groupIds: [], teamIds: [] };
    
    // Find user's groups based on group_ids
    const userGroups = groups.filter(group => 
      userAssignments.groupIds.includes(group.id)
    );
    
    // If user has no groups and there's a default group, assign them to it
    let assignedGroups = userGroups;
    if (userGroups.length === 0) {
      const defaultGroup = groups.find(g => g.is_default);
      if (defaultGroup) {
        assignedGroups = [defaultGroup];
      }
    }

    // Find user's teams
    const userTeams = [];
    for (const group of groups) {
      for (const team of (group.teams || [])) {
        if (userAssignments.teamIds.includes(team.id)) {
          userTeams.push({
            ...team,
            group: {
              id: group.id,
              name: group.name,
              description: group.description,
              is_default: group.is_default
            }
          });
        }
      }
    }

    return {
      ...user,
      groups: assignedGroups,
      teams: userTeams
    };
  });

  if (isLoading || isGroupsLoading || isUserGroupsLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-4 border rounded-md space-y-2">
            <div className="flex items-start gap-3">
              <Skeleton className="h-5 w-5 rounded" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50%]">User</TableHead>
            <TableHead className="w-[20%]">Access Level</TableHead>
            <TableHead className="w-[15%]">Status</TableHead>
            <TableHead className="w-[15%] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {processedUsers && processedUsers.length > 0 ? (
            processedUsers.map((user) => (
              <UserRow 
                key={user.id} 
                user={user} 
                clientId={clientId} 
                onEdit={handleEditUser}
                onManageGroupsTeams={handleManageGroupsTeams}
              />
            ))
          ) : (
            <TableRow>
              <TableCell 
                colSpan={4} 
                className="h-24 text-center text-muted-foreground"
              >
                No users found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <EditUserDialog
        isOpen={isEditUserOpen}
        onOpenChange={setIsEditUserOpen}
        user={selectedUser}
        clientId={clientId}
        groups={groups}
      />

      <EditUserDialog
        isOpen={isManageGroupsOpen}
        onOpenChange={setIsManageGroupsOpen}
        user={selectedUser}
        clientId={clientId}
        groups={groups}
        initialTab="access"
      />
    </div>
  );
}

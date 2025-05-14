
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

interface UsersTableProps {
  users: UserData[] | undefined;
  clientId: string;
  isLoading?: boolean;
}

export function UsersTable({ users, clientId, isLoading }: UsersTableProps) {
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isManageGroupsOpen, setIsManageGroupsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  // Fetch groups for the edit dialog
  const { data: groups = [] } = useQuery({
    queryKey: ['client_groups', clientId],
    queryFn: async () => {
      // In a real app, this would fetch from Supabase
      // For now we'll return the hardcoded groups
      return [
        {
          id: "marketing-group-id",
          name: "Marketing",
          description: "Marketing department",
          is_default: false,
          client_id: clientId,
          teams: [
            {
              id: "social-team-id",
              name: "Social Media",
              group_id: "marketing-group-id"
            },
            {
              id: "content-team-id",
              name: "Content",
              group_id: "marketing-group-id"
            }
          ]
        },
        {
          id: "sales-group-id",
          name: "Sales",
          description: "Sales department",
          is_default: true,
          client_id: clientId,
          teams: [
            {
              id: "direct-sales-team-id",
              name: "Direct Sales",
              group_id: "sales-group-id"
            },
            {
              id: "partners-team-id",
              name: "Partners",
              group_id: "sales-group-id"
            }
          ]
        }
      ];
    },
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

  // Ensure all users belong to the default group
  const processedUsers = users?.map(user => {
    // If user has no groups, assign them to the default group
    if (user.groups.length === 0) {
      const defaultGroup = groups.find(g => g.is_default);
      if (defaultGroup) {
        return {
          ...user,
          groups: [defaultGroup]
        };
      }
    }
    return user;
  });

  if (isLoading) {
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

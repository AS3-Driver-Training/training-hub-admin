
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-4 border rounded-md space-y-2">
            <div className="flex items-start gap-3">
              <Skeleton className="h-5 w-5 rounded" />
              <div className="space-y-2">
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
    <div className="relative rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead colSpan={2}>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users && users.length > 0 ? (
            users.map((user) => (
              <UserRow 
                key={user.id} 
                user={user} 
                clientId={clientId} 
                onEdit={handleEditUser}
              />
            ))
          ) : (
            <TableRow>
              <TableCell 
                colSpan={5} 
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
    </div>
  );
}


import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { UserActions } from "./users/UserActions";
import { ManageUserDialog } from "./users/ManageUserDialog";
import { UserData } from "./types";

interface UsersTableProps {
  users: UserData[] | undefined;
  clientId: string;
}

export function UsersTable({ users, clientId }: UsersTableProps) {
  const [isManageUserOpen, setIsManageUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  const { data: groups = [], isLoading: isLoadingGroups } = useQuery({
    queryKey: ['client_groups', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('groups')
        .select(`
          id,
          name,
          teams (
            id,
            name
          )
        `)
        .eq('client_id', clientId)
        .order('name');

      if (error) throw error;
      return data || [];
    },
    initialData: [],
  });

  const handleManageUser = (user: UserData) => {
    setSelectedUser(user);
    setIsManageUserOpen(true);
  };

  if (isLoadingGroups) {
    return <div>Loading groups...</div>;
  }

  return (
    <div className="relative rounded-md border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Name</TableHead>
              <TableHead className="w-[200px]">Email</TableHead>
              <TableHead className="w-[100px]">Role</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[100px] text-center">Groups</TableHead>
              <TableHead className="w-[100px] text-center">Teams</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  {user.profiles.first_name} {user.profiles.last_name}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {user.email}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{user.role}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.status === "pending" ? "secondary" : "default"}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  {user.groups.length > 0 ? (
                    <Badge variant="outline">{user.groups.length}</Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {user.teams.length > 0 ? (
                    <Badge variant="outline">{user.teams.length}</Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <UserActions
                    user={user}
                    clientId={clientId}
                    onManageUser={handleManageUser}
                  />
                </TableCell>
              </TableRow>
            ))}
            {!users?.length && (
              <TableRow>
                <TableCell 
                  colSpan={7} 
                  className="h-24 text-center text-muted-foreground"
                >
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ManageUserDialog
        isOpen={isManageUserOpen}
        onOpenChange={setIsManageUserOpen}
        user={selectedUser}
        clientId={clientId}
        groups={groups}
      />
    </div>
  );
}


import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClientUserRow } from "./ClientUserRow";

interface UserData {
  id: string;
  role: string;
  status: string;
  user_id: string;
  client_id: string;
  created_at: string;
  updated_at: string;
  email: string;
  profiles: {
    first_name: string;
    last_name: string;
  };
  groups: { name: string }[];
  teams: { name: string }[];
}

interface UsersTableProps {
  users: UserData[] | undefined;
  clientId: string;
}

export function UsersTable({ users, clientId }: UsersTableProps) {
  return (
    <div className="border rounded-md">
      <div className="w-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[250px]">User</TableHead>
              <TableHead className="w-[150px]">Email</TableHead>
              <TableHead className="w-[100px]">Role</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[100px] text-center">Groups</TableHead>
              <TableHead className="w-[100px] text-center">Teams</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user: UserData) => (
              <ClientUserRow key={user.id} user={user} clientId={clientId} />
            ))}
            {!users?.length && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserPlus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ClientUsersTabProps {
  clientId: string;
}

export function ClientUsersTab({ clientId }: ClientUsersTabProps) {
  const { data: users, isLoading } = useQuery({
    queryKey: ['client_users', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_users')
        .select(`
          *,
          profiles (
            id,
            first_name,
            last_name
          )
        `)
        .eq('client_id', clientId);

      if (error) throw error;
      return data;
    },
  });

  const handleRemoveUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('client_users')
        .delete()
        .eq('client_id', clientId)
        .eq('user_id', userId);

      if (error) throw error;

      toast.success("User removed successfully");
    } catch (error: any) {
      console.error("Error removing user:", error);
      toast.error(error.message || "Failed to remove user");
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold">Client Users</h3>
          <p className="text-sm text-muted-foreground">
            Manage users who have access to this client
          </p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user: any) => (
              <TableRow key={user.id}>
                <TableCell>
                  {user.profiles.first_name} {user.profiles.last_name}
                </TableCell>
                <TableCell>
                  <Badge>{user.role}</Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveUser(user.user_id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
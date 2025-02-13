
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface ClientUsersTabProps {
  clientId: string;
  clientName: string;
}

interface UserData {
  id: string;
  role: string;
  status: string;
  user_id: string;
  profiles: {
    first_name: string;
    last_name: string;
  };
  groups?: { name: string }[];
  teams?: { name: string }[];
}

export function ClientUsersTab({ clientId, clientName }: ClientUsersTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("employee");
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['client_users', clientId],
    queryFn: async () => {
      // First, get the client users with their profiles
      const { data: clientUsers, error: clientUsersError } = await supabase
        .from('client_users')
        .select(`
          *,
          profiles:user_id (
            id,
            first_name,
            last_name
          )
        `)
        .eq('client_id', clientId);

      if (clientUsersError) throw clientUsersError;

      // For each user, fetch their groups and teams
      const usersWithDetails = await Promise.all(
        clientUsers.map(async (user) => {
          // Fetch user's groups
          const { data: userGroups } = await supabase
            .from('user_groups')
            .select(`
              groups (
                name
              )
            `)
            .eq('user_id', user.user_id);

          // Fetch user's teams
          const { data: userTeams } = await supabase
            .from('user_teams')
            .select(`
              teams (
                name
              )
            `)
            .eq('user_id', user.user_id);

          return {
            ...user,
            groups: userGroups?.map(g => g.groups) || [],
            teams: userTeams?.map(t => t.teams) || []
          };
        })
      );

      return usersWithDetails;
    },
  });

  const addUserMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      // Get user ID from email using edge function
      const { data: userData, error: userError } = await supabase.functions.invoke(
        'get-user-by-email',
        { body: { email } }
      );

      if (userError || !userData?.user) {
        throw new Error('User not found');
      }

      const { error: insertError } = await supabase
        .from('client_users')
        .insert({
          client_id: clientId,
          user_id: userData.user.id,
          role: role,
          status: 'pending'
        });

      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client_users', clientId] });
      setIsDialogOpen(false);
      setEmail("");
      setRole("employee");
      toast.success("User added successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    addUserMutation.mutate({ email, role });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold">Users</h3>
          <p className="text-sm text-muted-foreground">
            Manage users, their roles, and assignments
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="employee">Employee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">
                Add User
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Groups</TableHead>
              <TableHead>Teams</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user: UserData) => (
              <TableRow key={user.id}>
                <TableCell>
                  {user.profiles.first_name} {user.profiles.last_name}
                </TableCell>
                <TableCell>
                  <Badge>{user.role}</Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={user.status === "pending" ? "secondary" : "default"}
                  >
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.groups?.map((group, index) => (
                    <Badge key={index} variant="outline" className="mr-1">
                      {group.name}
                    </Badge>
                  ))}
                </TableCell>
                <TableCell>
                  {user.teams?.map((team, index) => (
                    <Badge key={index} variant="outline" className="mr-1">
                      {team.name}
                    </Badge>
                  ))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

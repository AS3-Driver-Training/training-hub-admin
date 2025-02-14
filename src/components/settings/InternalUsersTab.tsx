import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserPlus, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AppRole = 'superadmin' | 'admin' | 'staff';

interface InternalUser {
  id: string;
  email: string;
  role: AppRole;
  status: string;
  first_name: string;
  last_name: string;
  title: string;
  created_at: string;
}

interface EditUserFormData {
  first_name: string;
  last_name: string;
  title: string;
  role: AppRole;
}

export function InternalUsersTab() {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<InternalUser | null>(null);
  const [formData, setFormData] = useState<EditUserFormData>({
    first_name: '',
    last_name: '',
    title: '',
    role: 'staff',
  });

  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['internal_users'],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['superadmin', 'admin', 'staff'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      const usersWithEmails = await Promise.all(
        profiles.map(async (profile) => {
          try {
            const { data: userData, error: userError } = await supabase.functions.invoke(
              'get-user-by-id',
              { 
                body: { 
                  userId: profile.id 
                } 
              }
            );

            if (userError) throw userError;

            return {
              ...profile,
              email: userData?.user?.email || 'No email found',
            };
          } catch (error) {
            console.error('Error fetching user email:', error);
            return {
              ...profile,
              email: 'Error loading email',
            };
          }
        })
      );

      return usersWithEmails;
    },
  });

  const handleEdit = (user: InternalUser) => {
    setSelectedUser(user);
    setFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      title: user.title || '',
      role: user.role,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (user: InternalUser) => {
    if (!confirm(`Are you sure you want to delete ${user.first_name} ${user.last_name}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'inactive' })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('User deactivated successfully');
      refetch();
    } catch (error) {
      console.error('Error deactivating user:', error);
      toast.error('Failed to deactivate user');
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          title: formData.title,
          role: formData.role,
        })
        .eq('id', selectedUser.id);

      if (error) throw error;

      toast.success('User updated successfully');
      setIsEditDialogOpen(false);
      refetch();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold">Internal Users</h3>
          <p className="text-sm text-muted-foreground">
            Manage system administrators and staff accounts
          </p>
        </div>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users?.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                {user.first_name} {user.last_name}
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant={user.role === 'superadmin' ? 'destructive' : user.role === 'admin' ? 'default' : 'secondary'}>
                  {user.role}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                  {user.status}
                </Badge>
              </TableCell>
              <TableCell>{user.title || '-'}</TableCell>
              <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(user)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit User
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDelete(user)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-4 grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value: AppRole) => setFormData(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="superadmin">Superadmin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

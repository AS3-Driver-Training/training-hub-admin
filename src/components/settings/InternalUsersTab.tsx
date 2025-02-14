
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  last_login: string | null;
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

      // Use Promise.all to wait for all email fetching operations
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

            // Make sure we have the user data before proceeding
            if (!userData?.user) {
              console.error('No user data found for profile:', profile.id);
              throw new Error('User data not found');
            }

            return {
              ...profile,
              email: userData.user.email,
            };
          } catch (error) {
            console.error('Error fetching user email:', error);
            // Instead of returning a placeholder, throw the error
            throw new Error(`Failed to fetch email for user ${profile.id}`);
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
    if (!confirm(`Are you sure you want to deactivate ${user.first_name} ${user.last_name}? This action cannot be undone.`)) {
      return;
    }

    try {
      // First verify we can get the user's email
      const { data: userData, error: userError } = await supabase.functions.invoke(
        'get-user-by-id',
        { 
          body: { 
            userId: user.id 
          } 
        }
      );

      if (userError || !userData?.user?.email) {
        throw new Error('Could not verify user email before deactivation');
      }

      // Proceed with deactivation
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'inactive' })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('User deactivated successfully');
      refetch();
    } catch (error: any) {
      console.error('Error deactivating user:', error);
      toast.error(error.message || 'Failed to deactivate user');
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
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error(error.message || 'Failed to update user');
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

      <div className="space-y-4">
        {users?.map((user) => (
          <Card key={user.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium">
                      {user.first_name} {user.last_name}
                    </h4>
                    <Badge variant={user.role === 'superadmin' ? 'destructive' : user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                    <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                      {user.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{user.email}</span>
                    {user.title && (
                      <>
                        <span>•</span>
                        <span>{user.title}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-sm text-muted-foreground">
                  Last login: {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                </div>
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
                      Deactivate User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </Card>
        ))}
      </div>

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

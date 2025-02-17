
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { AddInternalUserDialog } from "./AddInternalUserDialog";
import { EditUserDialog } from "./EditUserDialog";
import { UserListItem } from "./UserListItem";
import { InternalUser } from "./types";

export function InternalUsersTab() {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<InternalUser | null>(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ['internal_users'],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          role,
          status,
          first_name,
          last_name,
          title,
          created_at
        `)
        .in('role', ['superadmin', 'admin', 'staff'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching profiles:', error);
        throw error;
      }

      console.log('Fetched profiles:', profiles);

      const usersWithLoginInfo = await Promise.all(
        profiles.map(async (profile) => {
          if (!profile.email) {
            console.log('No email for profile:', profile.id);
            return {
              ...profile,
              last_login: null
            };
          }

          try {
            console.log('Fetching login info for email:', profile.email);
            const { data: userData, error: userError } = await supabase.functions.invoke(
              'get-user-by-email',
              { 
                body: { 
                  email: profile.email 
                } 
              }
            );

            if (userError) {
              console.error('Error fetching user data:', userError);
              return {
                ...profile,
                last_login: null
              };
            }

            console.log('User data received:', userData);
            return {
              ...profile,
              last_login: userData?.user?.last_sign_in_at || null
            };
          } catch (error) {
            console.error('Error processing user:', profile.id, error);
            return {
              ...profile,
              last_login: null
            };
          }
        })
      );

      console.log('Final users data:', usersWithLoginInfo);
      return usersWithLoginInfo;
    },
  });

  const handleEdit = (user: InternalUser) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (user: InternalUser) => {
    if (!confirm(`Are you sure you want to deactivate ${user.first_name} ${user.last_name}? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'inactive' })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('User deactivated successfully');
      window.location.reload();
    } catch (error: any) {
      console.error('Error deactivating user:', error);
      toast.error(error.message || 'Failed to deactivate user');
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
        <AddInternalUserDialog />
      </div>

      <div className="space-y-4">
        {users?.map((user) => (
          <UserListItem
            key={user.id}
            user={user}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
        {!users?.length && (
          <Card className="p-6">
            <p className="text-center text-muted-foreground">No users found</p>
          </Card>
        )}
      </div>

      <EditUserDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        user={selectedUser}
      />
    </Card>
  );
}

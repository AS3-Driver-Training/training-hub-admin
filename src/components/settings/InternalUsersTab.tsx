
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserPlus } from "lucide-react";

interface InternalUser {
  id: string;
  email: string;
  role: string;
  status: string;
  first_name: string;
  last_name: string;
  title: string;
  created_at: string;
}

export function InternalUsersTab() {
  const { data: users, isLoading } = useQuery({
    queryKey: ['internal_users'],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['superadmin', 'admin', 'staff'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch email addresses for each user
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
                <Badge variant={user.status === 'active' ? 'success' : 'warning'}>
                  {user.status}
                </Badge>
              </TableCell>
              <TableCell>{user.title || '-'}</TableCell>
              <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

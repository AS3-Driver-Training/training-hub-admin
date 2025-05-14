
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { UserActions } from "./users/UserActions";
import { ManageUserDialog } from "./users/ManageUserDialog";
import { UserData, GroupData } from "./types";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface UsersTableProps {
  users: UserData[] | undefined;
  clientId: string;
}

type UserRole = 'client_admin' | 'manager' | 'supervisor';
type UserStatus = 'active' | 'pending' | 'invited' | 'inactive' | 'suspended';

export function UsersTable({ users, clientId }: UsersTableProps) {
  const [isManageUserOpen, setIsManageUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const queryClient = useQueryClient();

  const { data: groups = [], isLoading: isLoadingGroups } = useQuery({
    queryKey: ['client_groups', clientId],
    queryFn: async () => {
      console.log('Fetching groups for client:', clientId);
      
      // Return hardcoded groups instead of fetching from database
      const hardcodedGroups: GroupData[] = [
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
      
      return hardcodedGroups;
    },
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string, role: UserRole }) => {
      console.log(`Updating user ${userId} role to ${role}`);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In a real app, this would be an actual API call:
      // const { error } = await supabase
      //   .from('client_users')
      //   .update({ role })
      //   .eq('id', userId);
      // if (error) throw error;
      
      return { userId, role };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['client_users', clientId], (oldData: any) => {
        if (!oldData) return oldData;
        
        return oldData.map((user: UserData) => 
          user.id === data.userId ? { ...user, role: data.role } : user
        );
      });
      
      toast.success(`User role updated to ${data.role}`);
    },
    onError: (error) => {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  });

  const updateUserStatusMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: string, status: UserStatus }) => {
      console.log(`Updating user ${userId} status to ${status}`);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In a real app, this would be an actual API call:
      // const { error } = await supabase
      //   .from('client_users')
      //   .update({ status })
      //   .eq('id', userId);
      // if (error) throw error;
      
      return { userId, status };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['client_users', clientId], (oldData: any) => {
        if (!oldData) return oldData;
        
        return oldData.map((user: UserData) => 
          user.id === data.userId ? { ...user, status: data.status } : user
        );
      });
      
      toast.success(`User status updated to ${data.status}`);
    },
    onError: (error) => {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  });

  const handleManageUser = (user: UserData) => {
    setSelectedUser(user);
    setIsManageUserOpen(true);
  };

  const handleRoleChange = (userId: string, role: UserRole) => {
    updateUserRoleMutation.mutate({ userId, role });
  };

  const handleStatusChange = (userId: string, status: UserStatus) => {
    // Consider adding confirmation for potentially destructive status changes
    if (status === 'suspended' || status === 'inactive') {
      if (!confirm(`Are you sure you want to change this user's status to ${status}?`)) {
        return;
      }
    }
    
    updateUserStatusMutation.mutate({ userId, status });
  };

  // Function to determine badge variant based on status
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'pending':
      case 'invited':
        return 'secondary';
      case 'inactive':
      case 'suspended':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (isLoadingGroups) {
    return (
      <div className="flex items-center justify-center h-24">
        <p className="text-muted-foreground">Loading groups...</p>
      </div>
    );
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
              <TableRow 
                key={user.id} 
                className="hover:bg-muted/50 cursor-pointer"
                onClick={(e) => {
                  // Don't trigger if clicking on dropdowns or the actions menu
                  if (!(e.target as HTMLElement).closest('.actions-menu') && 
                      !(e.target as HTMLElement).closest('.role-dropdown') &&
                      !(e.target as HTMLElement).closest('.status-dropdown')) {
                    handleManageUser(user);
                  }
                }}
              >
                <TableCell className="font-medium">
                  {user.profiles.first_name} {user.profiles.last_name}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {user.email}
                </TableCell>
                <TableCell>
                  <div className="role-dropdown" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Badge 
                          variant="outline"
                          className="cursor-pointer flex items-center gap-1 hover:bg-muted"
                        >
                          {user.role}
                          <ChevronDown className="h-3 w-3 opacity-50" />
                        </Badge>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-32">
                        {['client_admin', 'manager', 'supervisor'].map((role) => (
                          <DropdownMenuItem 
                            key={role}
                            className="flex items-center justify-between"
                            onClick={() => handleRoleChange(user.id, role as UserRole)}
                          >
                            {role}
                            {user.role === role && <Check className="h-4 w-4" />}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="status-dropdown" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Badge 
                          variant={getStatusBadgeVariant(user.status)}
                          className="cursor-pointer flex items-center gap-1"
                        >
                          {user.status}
                          <ChevronDown className="h-3 w-3 opacity-50" />
                        </Badge>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-32">
                        {['active', 'pending', 'invited', 'inactive', 'suspended'].map((status) => (
                          <DropdownMenuItem 
                            key={status}
                            className={cn(
                              "flex items-center justify-between",
                              (status === 'inactive' || status === 'suspended') && "text-destructive"
                            )}
                            onClick={() => handleStatusChange(user.id, status as UserStatus)}
                          >
                            {status}
                            {user.status === status && <Check className="h-4 w-4" />}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
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
                  <div className="actions-menu">
                    <UserActions
                      user={user}
                      clientId={clientId}
                      onManageUser={handleManageUser}
                    />
                  </div>
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


import { useState } from "react";
import { UserData } from "../../types/index";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  MoreHorizontal, 
  UserCog, 
  UserX, 
  UserCheck,
  Trash2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { 
  DeleteUserDialog, 
  DeactivateUserDialog, 
  ActivateUserDialog 
} from "./ConfirmationDialogs";

interface RegularUserActionsProps {
  user: UserData;
  onManageUser: (user: UserData) => void;
}

export function RegularUserActions({ user, onManageUser }: RegularUserActionsProps) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [showActivateDialog, setShowActivateDialog] = useState(false);

  const isActive = user.status === 'active';

  const handleDelete = async () => {
    setIsLoading(true);

    try {
      console.log("Deleting user:", user.id);
      const { error } = await supabase
        .from('client_users')
        .delete()
        .eq('id', user.id);

      if (error) throw error;

      toast.success("User deleted successfully");
      queryClient.invalidateQueries({ queryKey: ['client_users', user.client_id] });
      setShowDeleteDialog(false);
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error(error.message || "Failed to delete user");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: 'active' | 'inactive') => {
    setIsLoading(true);

    try {
      console.log(`Changing user status to ${newStatus}:`, user.id);
      const { error } = await supabase
        .from('client_users')
        .update({ status: newStatus })
        .eq('id', user.id);

      if (error) throw error;

      toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
      queryClient.invalidateQueries({ queryKey: ['client_users', user.client_id] });
      setShowDeactivateDialog(false);
      setShowActivateDialog(false);
    } catch (error: any) {
      console.error(`Error ${newStatus} user:`, error);
      toast.error(error.message || `Failed to ${newStatus} user`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onManageUser(user)}>
            <UserCog className="mr-2 h-4 w-4" />
            Edit User
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {isActive ? (
            <DropdownMenuItem onClick={() => setShowDeactivateDialog(true)}>
              <UserX className="mr-2 h-4 w-4" />
              Deactivate
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => setShowActivateDialog(true)}>
              <UserCheck className="mr-2 h-4 w-4" />
              Activate
            </DropdownMenuItem>
          )}
          <DropdownMenuItem 
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteUserDialog
        isOpen={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        user={user}
        onConfirm={handleDelete}
        isLoading={isLoading}
      />

      <DeactivateUserDialog
        isOpen={showDeactivateDialog}
        onOpenChange={setShowDeactivateDialog}
        user={user}
        onConfirm={() => handleStatusChange('inactive')}
        isLoading={isLoading}
      />

      <ActivateUserDialog
        isOpen={showActivateDialog}
        onOpenChange={setShowActivateDialog}
        user={user}
        onConfirm={() => handleStatusChange('active')}
        isLoading={isLoading}
      />
    </>
  );
}

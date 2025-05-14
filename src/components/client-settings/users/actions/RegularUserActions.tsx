
import { toast } from "sonner";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  MoreVertical, 
  Mail, 
  Trash2, 
  UserCog, 
  Edit, 
  Lock, 
  UserX,
  ShieldCheck 
} from "lucide-react";
import { UserData } from "../../types/index";
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
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isConfirmDeactivateOpen, setIsConfirmDeactivateOpen] = useState(false);
  const [isConfirmActivateOpen, setIsConfirmActivateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordReset = async () => {
    try {
      // Simulate password reset email
      toast.success("Password reset link sent to " + user.email);
    } catch (error: any) {
      console.error("Error resetting password:", error);
      toast.error(error.message || "Failed to send password reset");
    }
  };

  const handleEditProfile = () => {
    // Show edit profile dialog
    onManageUser(user);
  };

  const handleActivateUser = async () => {
    try {
      setIsLoading(true);
      // Simulate user activation
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      toast.success(user.profiles.first_name + " " + user.profiles.last_name + " activated successfully");
      setIsConfirmActivateOpen(false);
      // In a real app, you would update the database and invalidate queries
    } catch (error: any) {
      console.error("Error activating user:", error);
      toast.error(error.message || "Failed to activate user");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivateUser = async () => {
    try {
      setIsLoading(true);
      // Simulate user deactivation
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      toast.success(user.profiles.first_name + " " + user.profiles.last_name + " deactivated successfully");
      setIsConfirmDeactivateOpen(false);
      // In a real app, you would update the database and invalidate queries
    } catch (error: any) {
      console.error("Error deactivating user:", error);
      toast.error(error.message || "Failed to deactivate user");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      setIsLoading(true);
      // Simulate user deletion
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      toast.success(user.profiles.first_name + " " + user.profiles.last_name + " removed successfully");
      setIsConfirmDeleteOpen(false);
      // In a real app, you would update the database and invalidate queries
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error(error.message || "Failed to delete user");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle resending invitation (for pending/invited users)
  const handleResendInvitation = async () => {
    try {
      toast.success("Invitation resent to " + user.email);
    } catch (error: any) {
      console.error("Error resending invitation:", error);
      toast.error(error.message || "Failed to resend invitation");
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onManageUser(user)}>
            <UserCog className="mr-2 h-4 w-4" />
            Manage Groups & Teams
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleEditProfile}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handlePasswordReset}>
            <Lock className="mr-2 h-4 w-4" />
            Reset Password
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          
          {/* Show different options based on user status */}
          {user.status === "pending" || user.status === "invited" ? (
            <DropdownMenuItem onClick={handleResendInvitation}>
              <Mail className="mr-2 h-4 w-4" />
              Resend Invitation
            </DropdownMenuItem>
          ) : null}
          
          {user.status === "inactive" || user.status === "suspended" ? (
            <DropdownMenuItem onClick={() => setIsConfirmActivateOpen(true)}>
              <ShieldCheck className="mr-2 h-4 w-4" />
              Activate User
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => setIsConfirmDeactivateOpen(true)}>
              <UserX className="mr-2 h-4 w-4" />
              Deactivate User
            </DropdownMenuItem>
          )}
          
          <DropdownMenuItem 
            onClick={() => setIsConfirmDeleteOpen(true)}
            className="text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Remove User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Confirmation Dialogs */}
      <DeleteUserDialog 
        isOpen={isConfirmDeleteOpen} 
        onOpenChange={setIsConfirmDeleteOpen}
        user={user}
        onConfirm={handleDeleteUser}
        isLoading={isLoading}
      />

      <DeactivateUserDialog 
        isOpen={isConfirmDeactivateOpen} 
        onOpenChange={setIsConfirmDeactivateOpen}
        user={user}
        onConfirm={handleDeactivateUser}
        isLoading={isLoading}
      />

      <ActivateUserDialog 
        isOpen={isConfirmActivateOpen} 
        onOpenChange={setIsConfirmActivateOpen}
        user={user}
        onConfirm={handleActivateUser}
        isLoading={isLoading}
      />
    </>
  );
}

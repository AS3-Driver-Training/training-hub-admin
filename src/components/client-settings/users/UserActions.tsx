
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
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { UserData } from "../types";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface UserActionsProps {
  user: UserData;
  clientId: string;
  onManageUser: (user: UserData) => void;
}

export function UserActions({ user, clientId, onManageUser }: UserActionsProps) {
  const queryClient = useQueryClient();
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isConfirmDeactivateOpen, setIsConfirmDeactivateOpen] = useState(false);
  const [isConfirmActivateOpen, setIsConfirmActivateOpen] = useState(false);

  const handleResendInvitation = async () => {
    try {
      // Simulating invitation resend
      toast.success("Invitation resent successfully to " + user.email);
    } catch (error: any) {
      console.error("Error resending invitation:", error);
      toast.error(error.message || "Failed to resend invitation");
    }
  };

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
    toast.success("Edit profile for " + user.profiles.first_name + " " + user.profiles.last_name);
  };

  const handleActivateUser = async () => {
    try {
      // Simulate user activation
      toast.success(user.profiles.first_name + " " + user.profiles.last_name + " activated successfully");
      setIsConfirmActivateOpen(false);
      // In a real app, you would update the database and invalidate queries
    } catch (error: any) {
      console.error("Error activating user:", error);
      toast.error(error.message || "Failed to activate user");
    }
  };

  const handleDeactivateUser = async () => {
    try {
      // Simulate user deactivation
      toast.success(user.profiles.first_name + " " + user.profiles.last_name + " deactivated successfully");
      setIsConfirmDeactivateOpen(false);
      // In a real app, you would update the database and invalidate queries
    } catch (error: any) {
      console.error("Error deactivating user:", error);
      toast.error(error.message || "Failed to deactivate user");
    }
  };

  const handleDeleteUser = async () => {
    try {
      // Simulate user deletion
      toast.success(user.profiles.first_name + " " + user.profiles.last_name + " removed successfully");
      setIsConfirmDeleteOpen(false);
      // In a real app, you would update the database and invalidate queries
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error(error.message || "Failed to delete user");
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

      {/* Delete User Confirmation Dialog */}
      <AlertDialog 
        open={isConfirmDeleteOpen} 
        onOpenChange={setIsConfirmDeleteOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {user.profiles.first_name} {user.profiles.last_name}? 
              This will permanently delete their access to this client.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Deactivate User Confirmation Dialog */}
      <AlertDialog 
        open={isConfirmDeactivateOpen} 
        onOpenChange={setIsConfirmDeactivateOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate {user.profiles.first_name} {user.profiles.last_name}? 
              They will no longer be able to access this client until reactivated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeactivateUser}>
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Activate User Confirmation Dialog */}
      <AlertDialog 
        open={isConfirmActivateOpen} 
        onOpenChange={setIsConfirmActivateOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Activate User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to activate {user.profiles.first_name} {user.profiles.last_name}? 
              This will restore their access to this client.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleActivateUser}>
              Activate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}


import { UserData } from "../../types/index";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";

interface DeleteUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserData;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeleteUserDialog({ 
  isOpen, 
  onOpenChange, 
  user, 
  onConfirm, 
  isLoading 
}: DeleteUserDialogProps) {
  const fullName = `${user.profiles.first_name} ${user.profiles.last_name}`;
  
  return (
    <AlertDialog 
      open={isOpen} 
      onOpenChange={onOpenChange}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove User</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove {fullName}? 
            This will permanently delete their access to this client.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm} 
            className="bg-destructive text-destructive-foreground"
            disabled={isLoading}
          >
            {isLoading ? "Removing..." : "Remove"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function DeactivateUserDialog({ 
  isOpen, 
  onOpenChange, 
  user, 
  onConfirm,
  isLoading 
}: DeleteUserDialogProps) {
  const fullName = `${user.profiles.first_name} ${user.profiles.last_name}`;
  
  return (
    <AlertDialog 
      open={isOpen} 
      onOpenChange={onOpenChange}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Deactivate User</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to deactivate {fullName}? 
            They will no longer be able to access this client until reactivated.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Deactivating..." : "Deactivate"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function ActivateUserDialog({ 
  isOpen, 
  onOpenChange, 
  user, 
  onConfirm,
  isLoading 
}: DeleteUserDialogProps) {
  const fullName = `${user.profiles.first_name} ${user.profiles.last_name}`;
  
  return (
    <AlertDialog 
      open={isOpen} 
      onOpenChange={onOpenChange}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Activate User</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to activate {fullName}? 
            This will restore their access to this client.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Activating..." : "Activate"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

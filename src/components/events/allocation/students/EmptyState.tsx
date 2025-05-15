
import { UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onAddNew?: () => void;
  availableSeats: number;
  isCompleted?: boolean;
  hasAdminPrivileges?: boolean;
}

export function EmptyState({ 
  onAddNew, 
  availableSeats, 
  isCompleted = false,
  hasAdminPrivileges = false
}: EmptyStateProps) {
  // Show add button if:
  // 1. Not completed OR admin with privileges for completed courses
  // 2. Has callback function
  // 3. Has available seats
  const showAddButton = onAddNew && 
                         availableSeats > 0 && 
                         (!isCompleted || (isCompleted && hasAdminPrivileges));
  
  return (
    <div className="text-center py-8 border rounded-md bg-slate-50">
      <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
      <h3 className="text-base font-medium mb-1">No Students {isCompleted ? 'Attended' : 'Enrolled'}</h3>
      <p className="text-sm text-muted-foreground mb-4">
        {isCompleted 
          ? 'No students attended this course.'
          : 'There are no students enrolled in this course yet.'
        }
      </p>
      {showAddButton && (
        <Button 
          onClick={onAddNew}
          className="mt-2"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Add Students
        </Button>
      )}
    </div>
  );
}

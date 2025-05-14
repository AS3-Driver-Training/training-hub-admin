
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onAddNew: () => void;
  availableSeats: number;
}

export function EmptyState({ onAddNew, availableSeats }: EmptyStateProps) {
  return (
    <div className="text-center py-12 border rounded-md bg-slate-50">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
        <UserPlus className="h-6 w-6 text-slate-600" />
      </div>
      <h3 className="mt-3 text-base font-semibold">No students enrolled</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Get started by adding students to this course.
      </p>
      <div className="mt-6">
        <Button 
          onClick={onAddNew}
          disabled={availableSeats <= 0}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Add New Student
        </Button>
      </div>
      {availableSeats <= 0 && (
        <p className="mt-2 text-sm text-destructive">
          No seats available. Cannot add more students.
        </p>
      )}
    </div>
  );
}

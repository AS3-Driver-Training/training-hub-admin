
import { Button } from "@/components/ui/button";

interface SubmitButtonProps {
  isSubmitting: boolean;
  isEditing: boolean;
}

export function SubmitButton({ isSubmitting, isEditing }: SubmitButtonProps) {
  return (
    <div className="flex justify-end space-x-2 pt-4">
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : isEditing ? "Update Venue" : "Create Venue"}
      </Button>
    </div>
  );
}

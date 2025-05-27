
import { Button } from "@/components/ui/button";

interface SubmitButtonProps {
  isSubmitting: boolean;
  isEditing: boolean;
}

// This component is deprecated - buttons are now handled in the dialog footer
export function SubmitButton({ isSubmitting, isEditing }: SubmitButtonProps) {
  return null;
}

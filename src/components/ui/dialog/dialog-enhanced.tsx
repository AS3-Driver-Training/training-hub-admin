
import * as React from "react"
import { DialogRoot } from "./dialog-primitives"
import { useDialogPlaceSelection } from "@/hooks/use-dialog-place-selection"

// Define Dialog props interface using DialogRoot
interface DialogProps extends React.ComponentPropsWithoutRef<typeof DialogRoot> {
  children: React.ReactNode;
}

/**
 * Enhanced Dialog component with special handling for Google Places elements
 */
export function Dialog({ children, ...props }: DialogProps) {
  // Use our custom hook to handle Google Places selection
  useDialogPlaceSelection();
  
  return (
    <DialogRoot {...props}>
      {children}
    </DialogRoot>
  );
}

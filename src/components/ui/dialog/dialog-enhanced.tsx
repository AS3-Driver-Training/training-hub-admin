import * as React from "react"
import { DialogRoot } from "./dialog-primitives"
import { isGooglePlacesElement, isGooglePlacesInput } from "./google-places-utils"

// Define Dialog props interface using DialogRoot
interface DialogProps extends React.ComponentPropsWithoutRef<typeof DialogRoot> {
  children: React.ReactNode;
}

/**
 * Enhanced Dialog component with special handling for Google Places elements
 */
export function Dialog({ children, ...props }: DialogProps) {
  // Add a ref to track if we're currently selecting a place
  const isSelectingPlaceRef = React.useRef(false);
  
  // Create a modified onOpenChange handler that prevents closing during Google Places interaction
  const handleOpenChange = (open: boolean) => {
    // If trying to close the dialog but we're selecting a place, block it
    if (!open && isSelectingPlaceRef.current) {
      console.log('Blocked dialog close during Google Places interaction');
      return; // Don't propagate the close event
    }
    
    // Otherwise use the provided onOpenChange handler
    if (props.onOpenChange) {
      props.onOpenChange(open);
    }
  };
  
  // Set up a global click capture to detect clicks on Google Places elements
  React.useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Check if clicking on a Google Places dropdown element
      if (isGooglePlacesElement(target)) {
        console.log('Google Places element clicked - setting flag');
        isSelectingPlaceRef.current = true;
        
        // Reset the flag after a delay (after selection is processed)
        setTimeout(() => {
          isSelectingPlaceRef.current = false;
          console.log('Reset Google Places selection flag');
        }, 300);
      }
    };
    
    // Only add listener when dialog is open
    if (props.open) {
      // Use capture phase to get the event first
      document.addEventListener('click', handleGlobalClick, true);
      
      // Handle Escape key specially for Google Places
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          const target = e.target as HTMLElement;
          if (isGooglePlacesElement(target) || isGooglePlacesInput(target)) {
            console.log('Preventing Escape from closing dialog when in Google Places context');
            e.stopPropagation();
            e.preventDefault();
          }
        }
      };
      
      document.addEventListener('keydown', handleKeyDown, true);
      
      return () => {
        document.removeEventListener('click', handleGlobalClick, true);
        document.removeEventListener('keydown', handleKeyDown, true);
      };
    }
  }, [props.open]);
  
  // Pass everything to DialogRoot except onOpenChange which we handle specially
  const { onOpenChange, ...otherProps } = props;
  
  return (
    <DialogRoot {...otherProps} onOpenChange={handleOpenChange}>
      {children}
    </DialogRoot>
  );
}

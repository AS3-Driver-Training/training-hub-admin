
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
  const dialogRef = React.useRef<any>(null);
  
  // Modified dialog props with explicit handlers to prevent closing
  const dialogProps = {
    ...props,
    // Force the dialog to be modal (prevents outside clicks from closing)
    modal: true
  };
  
  // Simplified event capture that focuses only on preventing dialog closure
  const captureDialogCloseEvents = React.useCallback((e: Event) => {
    const target = e.target as HTMLElement;
    
    // Only block external clicks when they're on PAC elements
    if (target.closest('.pac-container') || 
        target.classList.contains('pac-item') ||
        target.classList.contains('pac-item-query')) {
      
      console.log('Preventing dialog close from PAC element click');
      e.stopPropagation();
      // IMPORTANT: Don't prevent default on these elements
    }
  }, []);

  // Add global event listeners when dialog is open - but only for mousedown
  React.useEffect(() => {
    if (props.open) {
      // Use capture phase, but for fewer events
      document.addEventListener('mousedown', captureDialogCloseEvents, true);
      
      // Only handle Escape key specially, allow other keyboard events
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          // Check if the target is a Google Places element
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
        document.removeEventListener('mousedown', captureDialogCloseEvents, true);
        document.removeEventListener('keydown', handleKeyDown, true);
      };
    }
  }, [props.open, captureDialogCloseEvents]);

  return (
    <DialogRoot {...dialogProps}>
      {children}
    </DialogRoot>
  );
}

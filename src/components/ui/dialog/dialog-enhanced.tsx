
import * as React from "react"
import { DialogRoot } from "./dialog-primitives"
import { isGooglePlacesElement } from "./google-places-utils"

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
  
  // More aggressive event handling for Google Places elements
  const captureAllEvents = React.useCallback((e: Event) => {
    // Check if event target is a Google Places element
    const target = e.target as HTMLElement;
    if (isGooglePlacesElement(target)) {
      console.log('Dialog captured Google Places event globally');
      // This is crucial - completely block these events
      e.stopPropagation();
      e.preventDefault();
      return false;
    }
  }, []);

  // Add global event listeners when dialog is open
  React.useEffect(() => {
    if (props.open) {
      // Use capture phase to intercept events before they reach radix dialog
      document.addEventListener('mousedown', captureAllEvents, true);
      document.addEventListener('pointerdown', captureAllEvents, true); 
      document.addEventListener('click', captureAllEvents, true);
      document.addEventListener('keydown', captureAllEvents, true);
      
      return () => {
        document.removeEventListener('mousedown', captureAllEvents, true);
        document.removeEventListener('pointerdown', captureAllEvents, true);
        document.removeEventListener('click', captureAllEvents, true);
        document.removeEventListener('keydown', captureAllEvents, true);
      };
    }
  }, [props.open, captureAllEvents]);

  return (
    <DialogRoot {...dialogProps}>
      {children}
    </DialogRoot>
  );
}

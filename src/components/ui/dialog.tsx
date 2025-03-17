import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

// Rename to avoid naming conflicts - this is the primitive component
const DialogRoot = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

// Function to check if element is part of Google Places autocomplete
const isGooglePlacesElement = (target: HTMLElement | null): boolean => {
  if (!target) return false;
  return (
    target.classList.contains('pac-container') || 
    target.closest('.pac-container') ||
    target.classList.contains('pac-item') || 
    target.closest('.pac-item') ||
    target.classList.contains('pac-item-query') ||
    target.closest('.pac-item-query') ||
    target.classList.contains('pac-icon') ||
    target.closest('.pac-icon')
  );
};

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-[9000] bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    onClick={(e) => {
      // Prevent clicks on Google Places elements from closing the dialog
      if (isGooglePlacesElement(e.target as HTMLElement)) {
        e.stopPropagation();
        e.preventDefault();
      }
      // Let the original click handler run otherwise
      if (props.onClick) {
        props.onClick(e);
      }
    }}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const contentRef = React.useRef<HTMLDivElement>(null);
  
  // Handle clicks on the content to prevent dialog closing when clicking Google autocomplete
  const handleContentEvent = (e: React.MouseEvent | React.PointerEvent) => {
    const target = e.target as HTMLElement;
    
    // Check if the click is on or inside a Google Places element
    if (isGooglePlacesElement(target)) {
      e.stopPropagation();
      return false;
    }
  };

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={(el) => {
          // Pass the ref to both react-hook-form ref and our local ref
          if (typeof ref === 'function') {
            ref(el);
          } else if (ref) {
            ref.current = el;
          }
          contentRef.current = el;
        }}
        className={cn(
          "fixed left-[50%] top-[50%] z-[9100] grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg md:w-full",
          className
        )}
        onClick={handleContentEvent}
        onPointerDown={handleContentEvent}
        {...props}
      >
        {children}
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary data-[state=open]:text-muted-foreground">
          <X className="h-6 w-6" />
          <span className="sr-only">Close</span>
        </DialogClose>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
})
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

const DialogProvider = ({ children }: { children: React.ReactNode }) => {
  return children;
};

// Define Dialog props interface using DialogRoot
interface DialogProps extends React.ComponentPropsWithoutRef<typeof DialogRoot> {
  children: React.ReactNode;
}

// Properly implement the Dialog component as a wrapper around DialogRoot
// with additional Google Places autocomplete handling
function Dialog({ children, ...props }: DialogProps) {
  const handleDialogEvents = React.useCallback((e: MouseEvent | KeyboardEvent) => {
    // Check if event target is a Google Places element
    const target = e.target as HTMLElement;
    if (isGooglePlacesElement(target)) {
      e.stopPropagation();
      if (e.type === 'click' || e.type === 'mousedown') {
        e.preventDefault();
      }
    }
  }, []);

  // Add global event listeners when dialog is open
  React.useEffect(() => {
    if (props.open) {
      // Use capture phase to intercept events before they reach radix dialog
      document.addEventListener('mousedown', handleDialogEvents, true);
      document.addEventListener('click', handleDialogEvents, true);
      
      return () => {
        document.removeEventListener('mousedown', handleDialogEvents, true);
        document.removeEventListener('click', handleDialogEvents, true);
      };
    }
  }, [props.open, handleDialogEvents]);

  return (
    <DialogRoot {...props}>
      {children}
    </DialogRoot>
  );
}

// Export all components
export {
  Dialog,
  DialogRoot,
  DialogPortal,
  DialogTrigger,
  DialogClose,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}

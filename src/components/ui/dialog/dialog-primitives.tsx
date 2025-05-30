
import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// Create a wrapped version of the Dialog Root that checks for Google Place selection
const PatchedDialogRoot = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Root>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root>>(({
  onOpenChange,
  ...props
}, ref) => {
  // Custom onOpenChange handler that checks for Google Place selection
  const handleOpenChange = (open: boolean) => {
    // If trying to close dialog during Google Place selection, block it
    if (!open && window.isSelectingGooglePlace && window.isSelectingGooglePlace()) {
      console.log('Blocked dialog close during Google Places selection');
      return;
    }

    // Additional check for Google Places elements in the DOM
    if (!open) {
      const pacContainer = document.querySelector('.pac-container');
      if (pacContainer && (pacContainer as HTMLElement).style.display !== 'none') {
        console.log('Blocked dialog close - Google Places dropdown is visible');
        return;
      }
    }

    // Otherwise call the original handler
    if (onOpenChange) {
      onOpenChange(open);
    }
  };
  return <DialogPrimitive.Root {...props} onOpenChange={handleOpenChange} />;
});

// Add displayName
PatchedDialogRoot.displayName = 'PatchedDialogRoot';

// Export the patched component as DialogRoot
export const DialogRoot = PatchedDialogRoot;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogPortal = DialogPrimitive.Portal;
export const DialogClose = DialogPrimitive.Close;

// Enhanced DialogOverlay with Google Places protection
export const DialogOverlay = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Overlay>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>>(({
  className,
  ...props
}, ref) => <DialogPrimitive.Overlay ref={ref} className={cn("fixed inset-0 z-[8000] bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className)} aria-hidden={undefined} {...props} />);
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

// Enhanced content with Google Places protection
export const DialogContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>>(({
  className,
  children,
  ...props
}, ref) => <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content ref={ref} className={cn("fixed left-[50%] top-[50%] z-[8100] grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg md:w-full", className)} aria-hidden={undefined} onOpenAutoFocus={props.onOpenAutoFocus} onCloseAutoFocus={props.onCloseAutoFocus} onPointerDownOutside={e => {
    // Enhanced protection for Google Places elements
    const target = e.target as HTMLElement;
    
    // Prevent closing when clicking Google Places elements
    if (target && (
      target.closest('.pac-container') ||
      target.closest('.pac-item') ||
      target.classList.contains('pac-item') ||
      target.classList.contains('pac-item-query') ||
      target.classList.contains('pac-icon') ||
      target.closest('[data-stop-propagation="true"]')
    )) {
      console.log('Prevented dialog close - clicked on Google Places element');
      e.preventDefault();
      return;
    }
    
    // Call original handler if provided
    if (props.onPointerDownOutside) {
      props.onPointerDownOutside(e);
    }
  }} onEscapeKeyDown={e => {
    // Prevent closing with Escape if Google Places is active
    if (window.isSelectingGooglePlace && window.isSelectingGooglePlace()) {
      console.log('Prevented dialog close with Escape - Google Places is active');
      e.preventDefault();
      return;
    }
    
    // Call original handler if provided
    if (props.onEscapeKeyDown) {
      props.onEscapeKeyDown(e);
    }
  }} {...props}>
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary data-[state=open]:text-muted-foreground">
        
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>);
DialogContent.displayName = DialogPrimitive.Content.displayName;

// Extra layout components
export const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />;
DialogHeader.displayName = "DialogHeader";
export const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />;
DialogFooter.displayName = "DialogFooter";
export const DialogTitle = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Title>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>>(({
  className,
  ...props
}, ref) => <DialogPrimitive.Title ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />);
DialogTitle.displayName = DialogPrimitive.Title.displayName;
export const DialogDescription = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Description>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>>(({
  className,
  ...props
}, ref) => <DialogPrimitive.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />);
DialogDescription.displayName = DialogPrimitive.Description.displayName;

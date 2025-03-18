
import { DashboardLayout } from "@/components/DashboardLayout";
import { VenuesList } from "@/components/venues/VenuesList";
import { useEffect, useRef } from "react";
import { setupPacContainerObserver } from "@/hooks/google-maps/autocomplete";

export default function Venues() {
  // Store a reference for the observer
  const observerRef = useRef<MutationObserver | null>(null);

  // Set up a global observer for Google Places dropdowns
  useEffect(() => {
    // Setup the observer
    observerRef.current = setupPacContainerObserver();
    
    // Add global event handling to prevent dialog closing
    const handleGlobalEvent = (e: MouseEvent | TouchEvent | PointerEvent) => {
      const target = e.target as HTMLElement;
      
      // Check if the target is a Google Places element
      if (target && (
          target.classList.contains('pac-container') || 
          target.closest('.pac-container') || 
          target.classList.contains('pac-item') || 
          target.closest('.pac-item') ||
          target.hasAttribute('data-google-places-element') ||
          target.closest('[data-google-places-element]')
        )) {
        
        // Prevent the event from propagating to Radix UI dialog
        e.stopPropagation();
        
        // Only prevent default if not on an input to allow input interaction
        if (!(target instanceof HTMLInputElement)) {
          e.preventDefault();
        }
      }
    };
    
    // Add event listeners with capture phase to intercept early
    document.addEventListener('click', handleGlobalEvent as EventListener, true);
    document.addEventListener('mousedown', handleGlobalEvent as EventListener, true);
    document.addEventListener('pointerdown', handleGlobalEvent as EventListener, true);
    document.addEventListener('touchstart', handleGlobalEvent as EventListener, true);
    
    return () => {
      // Clean up observer
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      
      // Clean up event listeners
      document.removeEventListener('click', handleGlobalEvent as EventListener, true);
      document.removeEventListener('mousedown', handleGlobalEvent as EventListener, true);
      document.removeEventListener('pointerdown', handleGlobalEvent as EventListener, true);
      document.removeEventListener('touchstart', handleGlobalEvent as EventListener, true);
    };
  }, []);

  return (
    <DashboardLayout>
      <VenuesList />
    </DashboardLayout>
  );
}


import { DashboardLayout } from "@/components/DashboardLayout";
import { VenuesList } from "@/components/venues/VenuesList";
import { useEffect, useRef } from "react";
import { setupPacContainerObserver } from "@/hooks/google-maps/autocomplete";

export default function Venues() {
  // Store a reference for the observer
  const observerRef = useRef<MutationObserver | null>(null);

  // Set up a global observer for Google Places dropdowns
  useEffect(() => {
    // Setup the observer for styling Google Places containers
    observerRef.current = setupPacContainerObserver();
    
    // Global debug logger for Google Places elements
    const handleGooglePlacesDebug = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Check if clicking on Google Places element
      if (
        target.closest('.pac-container') || 
        target.closest('.pac-item') ||
        target.classList.contains('pac-item') ||
        target.classList.contains('pac-item-query')
      ) {
        console.log('Google Places element interaction detected at page level');
        // Don't interfere with event propagation here - just logging
      }
    };
    
    // Use capture phase for debugging only
    document.addEventListener('click', handleGooglePlacesDebug, true);
    
    return () => {
      // Clean up observer
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      
      document.removeEventListener('click', handleGooglePlacesDebug, true);
    };
  }, []);

  return (
    <DashboardLayout>
      <VenuesList />
    </DashboardLayout>
  );
}

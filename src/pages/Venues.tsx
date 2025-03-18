
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
    
    // Apply additional global handlers for Google Places elements
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Check if clicking on Google Places element
      if (
        target.closest('.pac-container') || 
        target.closest('.pac-item') ||
        target.classList.contains('pac-item') ||
        target.classList.contains('pac-item-query')
      ) {
        console.log('Google Places element clicked');
        // Don't stop propagation, but log for debugging
      }
    };
    
    document.addEventListener('click', handleDocumentClick, true);
    
    return () => {
      // Clean up observer
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      
      document.removeEventListener('click', handleDocumentClick, true);
    };
  }, []);

  return (
    <DashboardLayout>
      <VenuesList />
    </DashboardLayout>
  );
}

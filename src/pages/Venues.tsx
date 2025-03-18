
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
    
    // Add styling to handle Google Places elements if they exist
    const style = document.createElement('style');
    style.innerHTML = `
      .pac-container {
        z-index: 10000 !important;
        position: absolute !important;
        pointer-events: auto !important;
      }
      /* Ensure pac items are clickable and visible */
      .pac-item, .pac-item-query {
        pointer-events: auto !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      // Clean up observer
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      // Remove the style
      document.head.removeChild(style);
    };
  }, []);

  return (
    <DashboardLayout>
      <VenuesList />
    </DashboardLayout>
  );
}

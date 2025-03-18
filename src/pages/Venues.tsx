
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
    
    return () => {
      // Clean up observer
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return (
    <DashboardLayout>
      <VenuesList />
    </DashboardLayout>
  );
}

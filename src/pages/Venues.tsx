
import { DashboardLayout } from "@/components/DashboardLayout";
import { VenuesList } from "@/components/venues/VenuesList";
import { useEffect } from "react";

export default function Venues() {
  // Add an effect to handle any global clicks for the Google Maps autocomplete
  useEffect(() => {
    // This handler will prevent clicks on Google Places elements from closing dialogs
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target && (
          target.classList.contains('pac-container') || 
          target.closest('.pac-container') || 
          target.classList.contains('pac-item') || 
          target.closest('.pac-item')
        )
      ) {
        e.stopPropagation();
        e.preventDefault();
      }
    };
    
    // Add capture phase listeners to catch events before they reach dialog handlers
    document.addEventListener('click', handleGlobalClick, true);
    document.addEventListener('mousedown', handleGlobalClick, true);
    
    return () => {
      document.removeEventListener('click', handleGlobalClick, true);
      document.removeEventListener('mousedown', handleGlobalClick, true);
    };
  }, []);

  return (
    <DashboardLayout>
      <VenuesList />
    </DashboardLayout>
  );
}

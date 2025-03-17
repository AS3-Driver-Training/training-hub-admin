
import { DashboardLayout } from "@/components/DashboardLayout";
import { VenuesList } from "@/components/venues/VenuesList";
import { useEffect, useRef } from "react";

export default function Venues() {
  // Store a reference for any active autocomplete container
  const pacContainerRef = useRef<HTMLElement | null>(null);

  // Add a more comprehensive effect to handle any global clicks for Google Places autocomplete
  useEffect(() => {
    // Locate and track the pac-container when it's added to the DOM
    const pacContainerObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement && 
                (node.classList.contains('pac-container') || 
                 node.className.includes('pac-container'))) {
              
              // Store reference and apply styles
              pacContainerRef.current = node;
              node.style.zIndex = '99999';
              node.style.position = 'absolute';
              node.style.pointerEvents = 'auto';
              
              // Add click handlers to all pac items
              node.querySelectorAll('.pac-item, .pac-item-query, .pac-icon, .pac-item *')
                .forEach((item) => {
                  if (item instanceof HTMLElement) {
                    item.style.pointerEvents = 'auto';
                    item.style.cursor = 'pointer';
                    
                    // Add event handlers that prevent propagation
                    const handleEvent = (e: Event) => {
                      e.stopPropagation();
                      e.preventDefault();
                    };
                    
                    item.addEventListener('click', handleEvent, true);
                    item.addEventListener('mousedown', handleEvent, true);
                    item.addEventListener('pointerdown', handleEvent, true);
                  }
                });
              
              // Add handlers to the container itself
              const handleEvent = (e: Event) => {
                e.stopPropagation();
                e.preventDefault();
              };
              
              node.addEventListener('click', handleEvent, true);
              node.addEventListener('mousedown', handleEvent, true);
              node.addEventListener('pointerdown', handleEvent, true);
            }
          });
        }
      }
    });
    
    // Start observing the document body for pac-container additions
    pacContainerObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // The most crucial handler to prevent clicks on Google Places elements from closing dialogs
    const handleGlobalEvent = (e: MouseEvent | PointerEvent) => {
      const target = e.target as HTMLElement;
      
      if (target && (
          target.classList.contains('pac-container') || 
          target.closest('.pac-container') || 
          target.classList.contains('pac-item') || 
          target.closest('.pac-item') ||
          target.classList.contains('pac-item-query') ||
          target.closest('.pac-item-query') ||
          target.classList.contains('pac-icon') ||
          target.closest('.pac-icon')
        )) {
        // Prevent the event from propagating to Radix UI dialog
        e.stopPropagation();
        e.preventDefault();
        console.log('Prevented dialog close from Google Places element', target);
      }
    };
    
    // Add capture phase listeners to catch events before they reach dialog handlers
    document.addEventListener('click', handleGlobalEvent, true);
    document.addEventListener('mousedown', handleGlobalEvent, true);
    document.addEventListener('pointerdown', handleGlobalEvent, true);
    
    return () => {
      // Clean up all listeners when component unmounts
      pacContainerObserver.disconnect();
      document.removeEventListener('click', handleGlobalEvent, true);
      document.removeEventListener('mousedown', handleGlobalEvent, true);
      document.removeEventListener('pointerdown', handleGlobalEvent, true);
    };
  }, []);

  return (
    <DashboardLayout>
      <VenuesList />
    </DashboardLayout>
  );
}

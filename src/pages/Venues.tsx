
import { DashboardLayout } from "@/components/DashboardLayout";
import { VenuesList } from "@/components/venues/VenuesList";
import { useEffect, useRef, useState } from "react";

export default function Venues() {
  // Store a reference for any active autocomplete container
  const pacContainerRef = useRef<HTMLElement | null>(null);
  const [observerActive, setObserverActive] = useState(false);

  // Add a more comprehensive effect to handle any global clicks for Google Places autocomplete
  useEffect(() => {
    // This flag will prevent duplicate listeners
    if (observerActive) return;
    
    // Locate and track the pac-container when it's added to the DOM
    const pacContainerObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement && 
                (node.classList.contains('pac-container') || 
                 node.className.includes('pac-container'))) {
              
              console.log("Detected pac-container, applying styles and handlers");
              
              // Store reference and apply critical styles
              pacContainerRef.current = node;
              
              // Ensure maximum visibility and interactivity
              node.style.zIndex = '999999';
              node.style.position = 'absolute';
              node.style.pointerEvents = 'auto';
              
              // Add click handlers to all pac items with better selector coverage
              node.querySelectorAll('.pac-item, .pac-item *, .pac-item-query, .pac-matched, .pac-icon, div[class^="pac-"]')
                .forEach((item) => {
                  if (item instanceof HTMLElement) {
                    item.style.pointerEvents = 'auto';
                    item.style.cursor = 'pointer';
                    
                    // Add robust event handlers
                    const handleEvent = (e: Event) => {
                      e.stopPropagation();
                      
                      // Only prevent default on non-input elements
                      // to allow normal interaction with inputs
                      if (!(e.target instanceof HTMLInputElement)) {
                        e.preventDefault();
                      }
                      
                      console.log("Handled Google Places element event", e.type);
                    };
                    
                    // Use capture phase to intercept events
                    ['click', 'mousedown', 'pointerdown', 'touchstart'].forEach(eventType => {
                      item.addEventListener(eventType, handleEvent, true);
                    });
                  }
                });
              
              // Add handlers to the container itself
              const handleContainerEvent = (e: Event) => {
                e.stopPropagation();
                
                // Only prevent default if not on an input
                if (!(e.target instanceof HTMLInputElement)) {
                  e.preventDefault();
                }
                
                console.log("Handled pac-container event", e.type);
              };
              
              // Use capture phase for container events
              ['click', 'mousedown', 'pointerdown', 'touchstart'].forEach(eventType => {
                node.addEventListener(eventType, handleContainerEvent, true);
              });
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
    
    setObserverActive(true);
    
    // The most crucial handler to prevent clicks on Google Places elements from closing dialogs
    const handleGlobalEvent = (e: MouseEvent | PointerEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      
      // More comprehensive check for Google Places elements
      if (target && (
          target.classList.contains('pac-container') || 
          target.closest('.pac-container') || 
          target.classList.contains('pac-item') || 
          target.closest('.pac-item') ||
          target.classList.contains('pac-item-query') ||
          target.closest('.pac-item-query') ||
          target.classList.contains('pac-icon') ||
          target.closest('.pac-icon') ||
          target.classList.contains('pac-matched') ||
          target.closest('.pac-matched') ||
          (target.className && target.className.startsWith && target.className.startsWith('pac-'))
        )) {
        // Prevent the event from propagating to Radix UI dialog
        e.stopPropagation();
        
        // Only prevent default if not on an input
        if (!(target instanceof HTMLInputElement)) {
          e.preventDefault();
        }
        
        console.log('Prevented dialog close from Google Places element', target);
      }
    };
    
    // Add capture phase listeners to catch events before they reach dialog handlers
    document.addEventListener('click', handleGlobalEvent as EventListener, true);
    document.addEventListener('mousedown', handleGlobalEvent as EventListener, true);
    document.addEventListener('pointerdown', handleGlobalEvent as EventListener, true);
    document.addEventListener('touchstart', handleGlobalEvent as EventListener, true);
    
    return () => {
      // Clean up all listeners when component unmounts
      pacContainerObserver.disconnect();
      document.removeEventListener('click', handleGlobalEvent as EventListener, true);
      document.removeEventListener('mousedown', handleGlobalEvent as EventListener, true);
      document.removeEventListener('pointerdown', handleGlobalEvent as EventListener, true);
      document.removeEventListener('touchstart', handleGlobalEvent as EventListener, true);
      setObserverActive(false);
    };
  }, [observerActive]);

  return (
    <DashboardLayout>
      <VenuesList />
    </DashboardLayout>
  );
}

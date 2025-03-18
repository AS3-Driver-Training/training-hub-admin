
import { useEffect, useRef } from 'react';

// Define global window property
declare global {
  interface Window {
    isSelectingGooglePlace?: () => boolean;
  }
}

/**
 * Hook that prevents dialog from closing when selecting places
 * by registering a global function that checks if we're currently selecting a place.
 */
export function useDialogPlaceSelection() {
  const isSelectingRef = useRef(false);
  
  useEffect(() => {
    // Global function to check if we're currently selecting a place
    window.isSelectingGooglePlace = () => isSelectingRef.current;
    
    // Handler to detect clicks on pac elements
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Check if clicking on a Google Places dropdown element
      if (
        target.closest('.pac-container') || 
        target.classList.contains('pac-item') ||
        target.classList.contains('pac-item-query') ||
        target.classList.contains('pac-icon')
      ) {
        isSelectingRef.current = true;
        console.log('Google Places element clicked - blocking dialog close');
        
        // Reset after a delay
        setTimeout(() => {
          isSelectingRef.current = false;
          console.log('Reset Google Places selection flag');
        }, 500);
      }
    };
    
    // Use capture phase to get the event first
    document.addEventListener('mousedown', handleGlobalClick, true);
    
    return () => {
      document.removeEventListener('mousedown', handleGlobalClick, true);
      delete window.isSelectingGooglePlace;
    };
  }, []);
  
  return isSelectingRef;
}

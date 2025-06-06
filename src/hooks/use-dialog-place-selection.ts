
import { useEffect, useRef } from 'react';

// Extend Window interface to include our global function
declare global {
  interface Window {
    isSelectingGooglePlace?: () => boolean;
  }
}

/**
 * Hook that prevents dialog from closing when selecting places from Google Places Autocomplete
 * 
 * This hooks adds event listeners to detect when a user is interacting with Google Places
 * dropdown elements and sets a global flag that can be checked by the dialog component
 * before closing.
 */
export function useDialogPlaceSelection() {
  const isSelectingRef = useRef(false);
  
  useEffect(() => {
    // Set up global function to check if user is currently selecting a place
    window.isSelectingGooglePlace = () => isSelectingRef.current;
    
    // Handler to detect clicks on pac elements
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // If clicking on a Google Places element, set the flag
      if (
        target.closest('.pac-container') || 
        target.classList.contains('pac-item') ||
        target.classList.contains('pac-item-query') ||
        target.classList.contains('pac-icon')
      ) {
        isSelectingRef.current = true;
        console.log('Google Places element clicked - blocking dialog close');
        
        // Extended timeout for better protection
        setTimeout(() => {
          isSelectingRef.current = false;
          console.log('Reset Google Places selection flag');
        }, 1000);
      }
    };
    
    // Handler to detect mousedown on pac elements for better timing
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      if (
        target.closest('.pac-container') || 
        target.classList.contains('pac-item') ||
        target.classList.contains('pac-item-query') ||
        target.classList.contains('pac-icon')
      ) {
        isSelectingRef.current = true;
        console.log('Google Places mousedown detected - setting protection');
      }
    };
    
    // Use capture phase to get the event first
    document.addEventListener('mousedown', handleGlobalClick, true);
    document.addEventListener('mousedown', handleMouseDown, true);
    document.addEventListener('click', handleGlobalClick, true);
    
    return () => {
      document.removeEventListener('mousedown', handleGlobalClick, true);
      document.removeEventListener('mousedown', handleMouseDown, true);
      document.removeEventListener('click', handleGlobalClick, true);
      // Clean up the global function when the component unmounts
      delete window.isSelectingGooglePlace;
    };
  }, []);
  
  return isSelectingRef;
}

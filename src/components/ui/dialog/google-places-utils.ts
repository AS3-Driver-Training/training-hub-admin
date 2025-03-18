
/**
 * Utility functions for detecting and handling Google Places elements
 */

/**
 * Checks if an element is part of Google Places autocomplete dropdown (NOT the input field)
 */
export const isGooglePlacesElement = (target: HTMLElement | null): boolean => {
  if (!target) return false;
  
  // Target specific dropdown elements 
  const isPacElement = (
    target.classList.contains('pac-container') || 
    target.closest('.pac-container') !== null ||
    target.classList.contains('pac-item') || 
    target.closest('.pac-item') !== null ||
    target.classList.contains('pac-item-query') ||
    target.classList.contains('pac-icon')
  );
  
  // Add debugging only when needed
  if (isPacElement) {
    console.log('Google Places element detected:', target.className);
  }
  
  return isPacElement;
};

/**
 * Specifically checks if an element is a Google Places input field
 * This helps distinguish between the input field and dropdown elements
 */
export const isGooglePlacesInput = (target: HTMLElement | null): boolean => {
  if (!target) return false;
  
  const isInput = target.tagName === 'INPUT' && (
    // Check if it's our places input field
    target.id === 'place' || 
    target.getAttribute('placeholder')?.includes('Search for a place') ||
    // For older code that might still have this attribute
    target.hasAttribute('data-google-places-element')
  );
  
  if (isInput) {
    console.log('Google Places input field detected:', target);
  }
  
  return isInput;
};

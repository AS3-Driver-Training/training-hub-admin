
/**
 * Utility functions for detecting and handling Google Places elements
 */

/**
 * Checks if an element is part of Google Places autocomplete dropdown (NOT the input field)
 */
export const isGooglePlacesElement = (target: HTMLElement | null): boolean => {
  if (!target) return false;
  
  // Only consider dropdown elements as Google Places elements
  // NOT the input field itself
  const result = (
    // Check for PAC container and items
    target.classList.contains('pac-container') || 
    target.closest('.pac-container') !== null ||
    target.classList.contains('pac-item') || 
    target.closest('.pac-item') !== null ||
    target.classList.contains('pac-item-query') ||
    target.closest('.pac-item-query') !== null ||
    target.classList.contains('pac-icon') ||
    target.closest('.pac-icon') !== null ||
    // Only check for container data attribute, not the input element
    target.hasAttribute('data-google-places-container') ||
    target.closest('[data-google-places-container]') !== null
  );
  
  // Add enhanced event debugging
  if (result) {
    console.log('Google Places dropdown element detected:', target);
    
    // Log detailed information for better debugging
    if (target.classList.contains('pac-container')) {
      console.log('Direct pac-container detected');
    } else if (target.closest('.pac-container')) {
      console.log('Parent pac-container detected');
    } else if (target.hasAttribute('data-google-places-container')) {
      console.log('Data attribute detected on container');
    }
  }
  
  return result;
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

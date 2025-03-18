
/**
 * Utility functions for detecting and handling Google Places elements
 */

/**
 * Checks if an element is part of Google Places autocomplete
 */
export const isGooglePlacesElement = (target: HTMLElement | null): boolean => {
  if (!target) return false;
  
  // Comprehensive check for Google Places elements
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
    // Check for data attributes
    target.hasAttribute('data-google-places-element') ||
    target.closest('[data-google-places-element]') !== null ||
    target.hasAttribute('data-google-places-container') ||
    target.closest('[data-google-places-container]') !== null
  );
  
  // Add enhanced event debugging
  if (result) {
    console.log('Google Places element detected:', target);
    
    // Log detailed information for better debugging
    if (target.classList.contains('pac-container')) {
      console.log('Direct pac-container detected');
    } else if (target.closest('.pac-container')) {
      console.log('Parent pac-container detected');
    } else if (target.hasAttribute('data-google-places-element')) {
      console.log('Data attribute detected on element');
    } else if (target.closest('[data-google-places-element]')) {
      console.log('Data attribute detected on parent');
    }
  }
  
  return result;
};

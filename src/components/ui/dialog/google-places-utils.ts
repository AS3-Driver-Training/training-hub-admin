
/**
 * Utility functions for detecting and handling Google Places elements
 */

/**
 * Checks if an element is part of Google Places autocomplete
 */
export const isGooglePlacesElement = (target: HTMLElement | null): boolean => {
  if (!target) return false;
  
  // Comprehensive check for Google Places elements
  return (
    target.classList.contains('pac-container') || 
    target.closest('.pac-container') !== null ||
    target.classList.contains('pac-item') || 
    target.closest('.pac-item') !== null ||
    target.classList.contains('pac-item-query') ||
    target.closest('.pac-item-query') !== null ||
    target.classList.contains('pac-icon') ||
    target.closest('.pac-icon') !== null ||
    target.hasAttribute('data-google-places-element') ||
    target.closest('[data-google-places-element]') !== null ||
    target.hasAttribute('data-google-places-container') ||
    target.closest('[data-google-places-container]') !== null
  );
};

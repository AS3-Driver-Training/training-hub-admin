
import { GooglePlaceData } from '@/hooks/google-maps/types';

// Cache to store autocomplete instances by input element
const autocompleteCache = new Map<HTMLInputElement, google.maps.places.Autocomplete>();

/**
 * Initializes Google Places Autocomplete for the given input element
 */
export function initializeAutocomplete(
  inputElement: HTMLInputElement,
  onPlaceSelect: (placeData: GooglePlaceData) => void
): void {
  if (!window.google || !window.google.maps || !window.google.maps.places) {
    throw new Error('Google Maps API not loaded');
  }

  // Check if we already have an autocomplete instance for this input
  if (autocompleteCache.has(inputElement)) {
    console.info('Autocomplete already initialized for this input, skipping');
    return;
  }

  // Create new autocomplete instance
  try {
    // Create the autocomplete object
    const autocomplete = new window.google.maps.places.Autocomplete(inputElement, {
      fields: ['address_components', 'formatted_address', 'name', 'geometry'],
      types: ['establishment', 'geocode'],
    });

    // Store the autocomplete instance in our cache
    autocompleteCache.set(inputElement, autocomplete);

    // Add listener for place selection
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      
      if (!place || !place.address_components) {
        console.warn('Invalid place selected:', place);
        return;
      }

      // Parse address components
      let region = '';
      let country = '';
      let placeName = place.name || '';

      place.address_components.forEach(component => {
        if (component.types.includes('administrative_area_level_1')) {
          region = component.long_name;
        }
        if (component.types.includes('country')) {
          country = component.long_name;
        }
      });

      // Create place data object
      const placeData: GooglePlaceData = {
        place: placeName,
        address: place.formatted_address || '',
        googleLocation: JSON.stringify({
          lat: place.geometry?.location?.lat?.() || 0,
          lng: place.geometry?.location?.lng?.() || 0,
        }),
        region,
        country,
        placeName
      };

      // Call the callback with the place data
      onPlaceSelect(placeData);
    });

    console.info('Google Places Autocomplete initialized successfully');
  } catch (error) {
    console.error('Error initializing autocomplete:', error);
    throw error;
  }
}

/**
 * Resets the autocomplete instance for the given input element
 */
export function resetAutocomplete(inputElement: HTMLInputElement): void {
  if (autocompleteCache.has(inputElement)) {
    // Remove from cache
    autocompleteCache.delete(inputElement);
    console.info('Autocomplete instance reset for input');
  }
}

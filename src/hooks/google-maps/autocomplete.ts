
import { GooglePlaceData } from './types';

/**
 * Initialize Google Places Autocomplete on an input element
 */
export function initializeAutocomplete(
  inputElement: HTMLInputElement,
  onPlaceSelect: (data: GooglePlaceData) => void
): any {
  if (!inputElement || !window.google?.maps?.places) {
    console.error("Cannot initialize autocomplete: Google Maps not loaded or input not available");
    return null;
  }

  try {
    // Create the autocomplete object
    const autocomplete = new window.google.maps.places.Autocomplete(inputElement, {
      types: ['establishment', 'geocode'],
      fields: ['address_components', 'formatted_address', 'geometry', 'name', 'place_id']
    });

    // Set up the place changed listener
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      
      console.log("Place selected:", place);
      
      if (!place.geometry) {
        console.warn("No details available for this place");
        return;
      }

      // Extract address components
      const addressComponents: Record<string, string> = {};
      
      if (place.address_components) {
        place.address_components.forEach((component: any) => {
          if (component.types.includes('locality')) {
            addressComponents.city = component.long_name;
          }
          else if (component.types.includes('administrative_area_level_1')) {
            addressComponents.state = component.long_name;
          }
          else if (component.types.includes('country')) {
            addressComponents.country = component.long_name;
          }
        });
      }

      // Get coordinates
      const lat = place.geometry.location?.lat();
      const lng = place.geometry.location?.lng();
      const locationString = lat && lng ? `${lat},${lng}` : '';

      // Create the place data object
      const placeData: GooglePlaceData = {
        place: place.name || '',
        address: place.formatted_address || '',
        googleLocation: locationString,
        region: addressComponents.state || addressComponents.city || '',
        country: addressComponents.country || '',
        placeName: place.name || ''
      };

      // Call the callback with the place data
      onPlaceSelect(placeData);
    });

    return autocomplete;
  } catch (error) {
    console.error("Error initializing autocomplete:", error);
    return null;
  }
}

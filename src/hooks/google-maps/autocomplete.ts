
import { GooglePlaceData } from './types';

// Higher z-index applied to pac-container
const applyAutocompleteStyles = () => {
  // Create a style element for the autocomplete dropdown
  const styleElement = document.createElement('style');
  styleElement.id = 'google-places-autocomplete-styles';
  styleElement.textContent = `
    .pac-container {
      z-index: 9999 !important;
      position: absolute !important;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2) !important;
    }
  `;
  
  // Remove existing style if it exists
  const existingStyle = document.getElementById('google-places-autocomplete-styles');
  if (existingStyle) {
    document.head.removeChild(existingStyle);
  }
  
  // Add the style to the document head
  document.head.appendChild(styleElement);
};

/**
 * Initialize Google Places Autocomplete on an input element
 */
export function initializeAutocomplete(
  inputElement: HTMLInputElement,
  onPlaceSelect: (data: GooglePlaceData) => void
): google.maps.places.Autocomplete | null {
  if (!inputElement || !window.google?.maps?.places) {
    console.error("Cannot initialize autocomplete: Google Maps not loaded or input not available");
    return null;
  }

  try {
    // Apply custom styles to ensure dropdown appears above other elements
    applyAutocompleteStyles();
    
    // Prevent other click handlers from interfering
    const clickHandler = (e: Event) => {
      e.stopPropagation();
    };
    
    inputElement.addEventListener('click', clickHandler);
    
    // Create the autocomplete object
    const autocomplete = new window.google.maps.places.Autocomplete(inputElement, {
      types: ['establishment', 'geocode'],
      fields: ['address_components', 'formatted_address', 'geometry', 'name', 'place_id']
    });

    // Set up the place changed listener
    const listener = autocomplete.addListener('place_changed', () => {
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

    // Return the autocomplete instance for later cleanup
    return autocomplete;
  } catch (error) {
    console.error("Error initializing autocomplete:", error);
    return null;
  }
}

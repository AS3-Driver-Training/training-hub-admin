
import { GooglePlaceData } from './types';

export function initializeAutocomplete(
  inputElement: HTMLInputElement | null,
  onPlaceSelect: (data: GooglePlaceData) => void
): google.maps.places.Autocomplete | null {
  if (!inputElement || !window.google || !window.google.maps || !window.google.maps.places) {
    console.log("Google Maps not loaded or input element not available");
    return null;
  }

  try {
    console.log("Initializing autocomplete for element:", inputElement);
    
    // Initialize the autocomplete with the input element
    const autocomplete = new window.google.maps.places.Autocomplete(inputElement, {
      types: ['establishment', 'geocode'],
      fields: ['address_components', 'formatted_address', 'geometry', 'name', 'place_id']
    });

    // Set up the place changed event
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      console.log("Place selected:", place);
      
      if (!place.geometry) {
        console.log("No place details available for this selection");
        return;
      }

      const addressComponents = extractAddressComponents(place);
      const formatted_address = place.formatted_address || '';
      
      // Construct the location string from the coordinates
      const lat = place.geometry.location?.lat();
      const lng = place.geometry.location?.lng();
      const locationString = lat && lng ? `${lat},${lng}` : '';

      // Convert to our app's data format
      const placeData: GooglePlaceData = {
        place: place.name || '',
        address: formatted_address,
        googleLocation: locationString,
        region: addressComponents.state || addressComponents.city || '',
        country: addressComponents.country || '',
        placeName: place.name || ''
      };

      console.log("Sending place data to callback:", placeData);
      // Send the data back via callback
      onPlaceSelect(placeData);
    });

    return autocomplete;
  } catch (error) {
    console.error("Error initializing Google Places Autocomplete:", error);
    return null;
  }
}

const extractAddressComponents = (place: google.maps.places.PlaceResult): Record<string, string> => {
  const components: Record<string, string> = {};
  
  if (!place.address_components) {
    return components;
  }

  place.address_components.forEach((component) => {
    const types = component.types;
    
    if (types.includes('locality')) {
      components.city = component.long_name;
    }
    else if (types.includes('administrative_area_level_1')) {
      components.state = component.long_name;
      components.stateCode = component.short_name;
    }
    else if (types.includes('country')) {
      components.country = component.long_name;
      components.countryCode = component.short_name;
    }
    else if (types.includes('postal_code')) {
      components.postalCode = component.long_name;
    }
    else if (types.includes('route')) {
      components.street = component.long_name;
    }
    else if (types.includes('street_number')) {
      components.streetNumber = component.long_name;
    }
  });
  
  return components;
};

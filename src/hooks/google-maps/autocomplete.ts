
import { UseGooglePlacesProps, GooglePlaceData } from './types';

/**
 * Initialize Google Places Autocomplete
 */
export const initializeAutocomplete = (
  inputRef: React.RefObject<HTMLInputElement>,
  autoCompleteRef: React.RefObject<any>,
  onPlaceSelect: UseGooglePlacesProps['onPlaceSelect'],
  setScriptError: (error: string) => void
) => {
  if (!inputRef.current || !window.google?.maps?.places) {
    console.warn("Cannot initialize Google Places Autocomplete - dependencies not loaded");
    return;
  }

  // Check if autocomplete is already initialized for this input
  if (autoCompleteRef.current && autoCompleteRef.current.inputField === inputRef.current) {
    console.log("Autocomplete already initialized for this input, skipping");
    return;
  }

  console.log("Initializing Google Places Autocomplete for input:", inputRef.current);
  try {
    // Initialize Google Places Autocomplete with expanded options
    const autocompleteInstance = new window.google.maps.places.Autocomplete(inputRef.current, {
      fields: ["address_components", "formatted_address", "geometry", "name", "place_id"],
      types: ["establishment", "geocode"],
    });
    
    // Store reference to input field to prevent duplicate initialization
    autocompleteInstance.inputField = inputRef.current;
    
    // Set the reference to the autocomplete instance
    if (autoCompleteRef) {
      autoCompleteRef.current = autocompleteInstance;
    }

    // Add listener for place selection
    window.google.maps.event.addListener(autocompleteInstance, "place_changed", () => {
      try {
        const place = autocompleteInstance.getPlace();
        console.log("Selected place:", place);
        
        if (!place || !place.place_id) {
          console.warn("No place details available or invalid place selected");
          return;
        }
        
        // If place has no geometry, it might be because of restrictions or errors
        if (!place.geometry) {
          console.warn("Place has no geometry, possibly due to API restrictions");
          setScriptError("Unable to get complete place details. Check your Google Cloud Console settings.");
          return;
        }

        // Extract address components
        let region = "";
        let country = "";
        let formattedAddress = place.formatted_address || "";
        
        // Extract components from address_components
        if (place.address_components) {
          for (const component of place.address_components) {
            // Get region (state/province)
            if (component.types.includes("administrative_area_level_1")) {
              region = component.long_name;
            }
            // Get country
            if (component.types.includes("country")) {
              country = component.long_name;
            }
          }
        }

        // Format latitude and longitude
        const lat = place.geometry.location?.lat();
        const lng = place.geometry.location?.lng();
        const googleLocation = lat && lng ? `${lat},${lng}` : "";

        const placeName = place.name || "";

        if (onPlaceSelect) {
          onPlaceSelect({
            place: placeName,
            address: formattedAddress,
            googleLocation,
            region,
            country,
            placeName
          });
        }
      } catch (error) {
        console.error("Error processing place selection:", error);
        setScriptError("Error processing selected place. Please enter address manually.");
      }
    });
    
    console.log("Google Places Autocomplete initialized successfully");
  } catch (error) {
    console.error("Error initializing Google Places Autocomplete:", error);
    setScriptError("Error initializing Google Places. Please enter address manually.");
  }
};

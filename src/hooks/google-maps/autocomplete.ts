
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

  console.log("Initializing Google Places Autocomplete");
  try {
    // Initialize Google Places Autocomplete
    autoCompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
      fields: ["address_components", "formatted_address", "geometry", "name"],
      types: ["establishment", "geocode"],
    });

    // Add listener for place selection
    autoCompleteRef.current.addListener("place_changed", () => {
      try {
        const place = autoCompleteRef.current.getPlace();
        console.log("Selected place:", place);
        
        if (!place) {
          console.warn("No place details available");
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
        let formattedAddress = place.formatted_address || "";
        
        // Attempt to extract region (administrative_area_level_1)
        if (place.address_components) {
          for (const component of place.address_components) {
            if (component.types.includes("administrative_area_level_1")) {
              region = component.long_name;
              break;
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
            address: formattedAddress,
            googleLocation,
            region,
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


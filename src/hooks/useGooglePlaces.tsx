
import { useState, useEffect, useRef } from "react";

// This should be loaded from environment variables in a real app
const GOOGLE_MAPS_API_KEY = 'AIzaSyCu7aCPjM539cGuK3ng2TXDvYcVkLJ1Pi4';

// Add Google Maps type definitions for TypeScript
declare global {
  interface Window {
    google: {
      maps: {
        places: {
          Autocomplete: new (
            input: HTMLInputElement,
            options?: google.maps.places.AutocompleteOptions
          ) => google.maps.places.Autocomplete;
        };
        Map: any;
      };
    };
    initGoogleMapsCallback: () => void;
  }
}

interface GooglePlaceData {
  address: string;
  googleLocation: string;
  region: string;
  placeName: string;
}

interface UseGooglePlacesProps {
  onPlaceSelect?: (placeData: GooglePlaceData) => void;
}

export function useGooglePlaces({ onPlaceSelect }: UseGooglePlacesProps = {}) {
  const [isLoadingScript, setIsLoadingScript] = useState(false);
  const [scriptError, setScriptError] = useState<string | null>(null);
  const autoCompleteRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Load Google Maps JavaScript API with Places library
  useEffect(() => {
    // Define callback for when Google Maps script loads
    window.initGoogleMapsCallback = () => {
      console.log("Google Maps API loaded successfully");
      setIsLoadingScript(false);
      initializeAutocomplete();
    };

    // Check if Google Maps script is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      console.log("Google Maps API already loaded");
      initializeAutocomplete();
      return;
    }

    console.log("Loading Google Maps API script...");
    setIsLoadingScript(true);
    
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGoogleMapsCallback`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      console.error("Google Maps script failed to load");
      setIsLoadingScript(false);
      setScriptError("Failed to load Google Maps. You can still enter address manually.");
    };

    document.head.appendChild(script);

    return () => {
      // Clean up script if component unmounts before script loads
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
      // Clean up global callback
      if (window.initGoogleMapsCallback) {
        delete window.initGoogleMapsCallback;
      }
    };
  }, []);

  const initializeAutocomplete = () => {
    if (!inputRef.current || !window.google || !window.google.maps || !window.google.maps.places) {
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
        const place = autoCompleteRef.current.getPlace();
        console.log("Selected place:", place);
        
        if (!place || !place.geometry) {
          console.warn("No place details available");
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
      });
      
      console.log("Google Places Autocomplete initialized successfully");
    } catch (error) {
      console.error("Error initializing Google Places Autocomplete:", error);
      setScriptError("Error initializing Google Places. You can still enter address manually.");
    }
  };

  return {
    inputRef,
    isLoadingScript,
    scriptError,
  };
}

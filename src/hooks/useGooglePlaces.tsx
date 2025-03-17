
import { useState, useEffect, useRef } from "react";

// This should be loaded from environment variables in a real app
const GOOGLE_MAPS_API_KEY = 'AIzaSyCu7aCPjM539cGuK3ng2TXDvYcVkLJ1Pi4';

// Google Maps type declarations
declare global {
  interface Window {
    google?: {
      maps: {
        places: {
          Autocomplete: new (
            input: HTMLInputElement,
            options?: any
          ) => any;
        };
        Map: any;
      };
    };
    initGoogleMapsCallback?: () => void;
    gm_authFailure?: () => void;
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

  // Function to handle API key errors
  const handleApiKeyError = () => {
    console.error("Google Maps authentication error - billing may not be enabled for this API key");
    setScriptError("Google Maps API key requires billing to be enabled. You can still enter address manually.");
  };

  // Load Google Maps JavaScript API with Places library
  useEffect(() => {
    // Skip if we already found an error
    if (scriptError) {
      return;
    }

    // Define callback for when Google Maps script loads
    window.initGoogleMapsCallback = () => {
      console.log("Google Maps API loaded successfully");
      setIsLoadingScript(false);
      initializeAutocomplete();
    };

    // Set up global error handler for API key issues
    window.gm_authFailure = handleApiKeyError;

    // Check if Google Maps script is already loaded
    if (window.google?.maps?.places) {
      console.log("Google Maps API already loaded");
      initializeAutocomplete();
      return;
    }

    console.log("Loading Google Maps API script...");
    setIsLoadingScript(true);
    
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGoogleMapsCallback&loading=async`;
    script.async = true;
    script.defer = true;
    
    // Handle script load error
    script.onerror = () => {
      console.error("Google Maps script failed to load");
      setIsLoadingScript(false);
      setScriptError("Failed to load Google Maps. Please enter address manually.");
    };

    // Set a reasonable timeout for loading the script
    const timeoutId = setTimeout(() => {
      if (isLoadingScript) {
        console.error("Google Maps script load timeout");
        setIsLoadingScript(false);
        setScriptError("Google Maps took too long to load. Please enter address manually.");
      }
    }, 10000);

    document.head.appendChild(script);

    return () => {
      // Clean up timeout
      clearTimeout(timeoutId);
      
      // Clean up script if component unmounts before script loads
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
      
      // Clean up global callbacks
      if (window.initGoogleMapsCallback) {
        delete window.initGoogleMapsCallback;
      }
      
      if (window.gm_authFailure) {
        delete window.gm_authFailure;
      }
    };
  }, [scriptError]);

  const initializeAutocomplete = () => {
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

  // Manual fallback for handling errors after initialization
  useEffect(() => {
    const handleAutocompleteError = (event: ErrorEvent) => {
      // Only catch Google Maps related errors
      if (event.filename?.includes('maps.googleapis.com')) {
        console.error("Google Maps runtime error:", event.message);
        
        // Check for common API key and billing errors
        if (event.message?.includes('API key') || 
            event.message?.includes('billing') || 
            event.message?.includes('ApiTargetBlockedMapError') || 
            event.message?.includes('BillingNotEnabledMapError')) {
          setScriptError("Google Maps API key requires billing to be enabled. Please enter address manually.");
        }
      }
    };

    window.addEventListener('error', handleAutocompleteError);
    
    return () => {
      window.removeEventListener('error', handleAutocompleteError);
    };
  }, []);

  return {
    inputRef,
    isLoadingScript,
    scriptError,
  };
}

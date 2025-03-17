
import { useEffect, useRef, useState } from 'react';
import { loadGoogleMapsScript } from './google-maps/scriptLoader';
import { initializeAutocomplete } from './google-maps/autocomplete';
import { UseGooglePlacesProps, UseGooglePlacesReturn, GooglePlaceData } from './google-maps/types';
import { setupErrorHandlers } from './google-maps/errorHandlers';

export function useGooglePlaces({ onPlaceSelect }: UseGooglePlacesProps = {}): UseGooglePlacesReturn {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoadingScript, setIsLoadingScript] = useState<boolean>(false);
  const [scriptError, setScriptError] = useState<string | null>(null);
  const initCompletedRef = useRef<boolean>(false);

  // Load Google Maps script
  useEffect(() => {
    if (!window.google?.maps?.places) {
      setIsLoadingScript(true);
      loadGoogleMapsScript()
        .then(() => {
          setIsLoadingScript(false);
          setScriptError(null);
          initAutocomplete();
        })
        .catch((error) => {
          setIsLoadingScript(false);
          setScriptError(error.message || 'Failed to load Google Maps');
          console.error('Error loading Google Maps script:', error);
        });
    } else {
      initAutocomplete();
    }

    // Set up error handlers for Google Maps
    setupErrorHandlers(setScriptError);

    return () => {
      // Clean up by removing the global callback
      if (window.initGoogleMapsCallback) {
        window.initGoogleMapsCallback = undefined;
      }
    };
  }, []);

  // Initialize autocomplete when input is mounted
  const initAutocomplete = () => {
    if (!inputRef.current || initCompletedRef.current || !window.google?.maps?.places) return;
    
    console.log("Initializing autocomplete with input:", inputRef.current);
    
    // Create a small delay to ensure the DOM is fully rendered
    setTimeout(() => {
      if (inputRef.current) {
        const handlePlaceSelect = (placeData: GooglePlaceData) => {
          console.log("Place selected:", placeData);
          if (onPlaceSelect) {
            onPlaceSelect(placeData);
          }
        };

        autocompleteRef.current = initializeAutocomplete(inputRef.current, handlePlaceSelect);
        
        if (autocompleteRef.current) {
          initCompletedRef.current = true;
          console.log("Autocomplete successfully initialized");
        }
      }
    }, 100);
  };

  // Reset autocomplete if needed
  const resetAutocomplete = () => {
    initCompletedRef.current = false;
    if (inputRef.current) {
      inputRef.current.value = '';
      initAutocomplete();
    }
  };

  return {
    inputRef,
    isLoadingScript,
    scriptError,
    resetAutocomplete
  };
}

export default useGooglePlaces;

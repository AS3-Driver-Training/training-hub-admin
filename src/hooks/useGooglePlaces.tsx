
import { useEffect, useRef, useState, useCallback } from 'react';
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
    let cleanupFn: () => void;
    
    const loadScript = async () => {
      if (window.google?.maps?.places) {
        console.log("Google Maps already loaded");
        initAutocomplete();
        return;
      }
      
      setIsLoadingScript(true);
      setScriptError(null);
      
      try {
        await loadGoogleMapsScript();
        console.log("Google Maps script loaded successfully");
        setScriptError(null);
        initAutocomplete();
      } catch (error) {
        console.error('Error loading Google Maps script:', error);
        setScriptError(error instanceof Error ? error.message : 'Failed to load Google Maps');
      } finally {
        setIsLoadingScript(false);
      }
    };
    
    // Set up error handlers for Google Maps
    cleanupFn = setupErrorHandlers(setScriptError);
    
    loadScript();
    
    return () => {
      // Clean up error handlers
      if (cleanupFn) {
        cleanupFn();
      }
      
      // Clean up by removing the global callback
      if (window.initGoogleMapsCallback) {
        window.initGoogleMapsCallback = undefined;
      }
    };
  }, []);

  // Initialize autocomplete when input is mounted
  const initAutocomplete = useCallback(() => {
    if (!inputRef.current || !window.google?.maps?.places) {
      console.log("Cannot initialize autocomplete: Google Maps not loaded or input not available");
      return;
    }
    
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

        try {
          // Reset the previous autocomplete if exists
          if (autocompleteRef.current) {
            // No direct way to destroy autocomplete, but we can create a new one
            console.log("Replacing existing autocomplete instance");
          }
          
          autocompleteRef.current = initializeAutocomplete(inputRef.current, handlePlaceSelect);
          
          if (autocompleteRef.current) {
            initCompletedRef.current = true;
            console.log("Autocomplete successfully initialized");
          } else {
            console.error("Failed to initialize autocomplete");
            setScriptError("Failed to initialize Google Places Autocomplete");
          }
        } catch (error) {
          console.error("Error initializing autocomplete:", error);
          setScriptError("Failed to initialize Google Places Autocomplete");
        }
      }
    }, 100);
  }, [onPlaceSelect]);

  // Reset autocomplete if needed
  const resetAutocomplete = useCallback(() => {
    initCompletedRef.current = false;
    if (inputRef.current) {
      inputRef.current.value = '';
      initAutocomplete();
    }
  }, [initAutocomplete]);

  // Re-initialize when the input reference changes
  useEffect(() => {
    if (inputRef.current && window.google?.maps?.places && !initCompletedRef.current) {
      console.log("Input ref changed, reinitializing autocomplete");
      initAutocomplete();
    }
  }, [inputRef.current, initAutocomplete]);

  return {
    inputRef,
    isLoadingScript,
    scriptError,
    resetAutocomplete
  };
}

export default useGooglePlaces;

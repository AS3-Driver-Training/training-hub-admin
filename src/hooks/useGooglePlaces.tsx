
import { useState, useRef, useEffect, useCallback } from 'react';
import { loadGoogleMapsScript } from './google-maps/scriptLoader';
import { initializeAutocomplete } from './google-maps/autocomplete';
import { UseGooglePlacesProps, UseGooglePlacesReturn, GooglePlaceData } from './google-maps/types';

export function useGooglePlaces({ onPlaceSelect }: UseGooglePlacesProps = {}): UseGooglePlacesReturn {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoadingScript, setIsLoadingScript] = useState(false);
  const [scriptError, setScriptError] = useState<string | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  
  // Load the Google Maps script
  useEffect(() => {
    async function loadScript() {
      // Skip if already loaded
      if (window.google?.maps?.places) {
        return;
      }
      
      setIsLoadingScript(true);
      setScriptError(null);
      
      try {
        await loadGoogleMapsScript();
        setScriptError(null);
      } catch (error) {
        console.error("Failed to load Google Maps:", error);
        setScriptError(error instanceof Error ? error.message : "Failed to load Google Maps");
      } finally {
        setIsLoadingScript(false);
      }
    }
    
    loadScript();
    
    // Clean up callback on unmount
    return () => {
      window.initGoogleMapsCallback = undefined;
      window.gm_authFailure = undefined;
    };
  }, []);
  
  // Initialize autocomplete when input is available and script is loaded
  const initAutocomplete = useCallback(() => {
    if (!inputRef.current || !window.google?.maps?.places) {
      return;
    }
    
    const handlePlaceSelect = (placeData: GooglePlaceData) => {
      if (onPlaceSelect) {
        onPlaceSelect(placeData);
      }
    };
    
    // Initialize autocomplete
    autocompleteRef.current = initializeAutocomplete(
      inputRef.current,
      handlePlaceSelect
    );
    
    if (!autocompleteRef.current) {
      setScriptError("Failed to initialize Places Autocomplete");
    }
  }, [onPlaceSelect]);
  
  // Initialize autocomplete when the input element changes
  useEffect(() => {
    if (inputRef.current && window.google?.maps?.places) {
      initAutocomplete();
    }
  }, [inputRef.current, initAutocomplete]);
  
  // Function to reset the autocomplete
  const resetAutocomplete = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.value = '';
      
      // Re-initialize
      if (window.google?.maps?.places) {
        initAutocomplete();
      }
    }
  }, [initAutocomplete]);
  
  return {
    inputRef,
    isLoadingScript,
    scriptError,
    resetAutocomplete
  };
}

export default useGooglePlaces;

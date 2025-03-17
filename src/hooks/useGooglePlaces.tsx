
import { useState, useRef, useEffect, useCallback } from 'react';
import { loadGoogleMapsScript } from './google-maps/scriptLoader';
import { initializeAutocomplete } from './google-maps/autocomplete';
import { UseGooglePlacesProps, UseGooglePlacesReturn, GooglePlaceData } from './google-maps/types';

export function useGooglePlaces({ onPlaceSelect }: UseGooglePlacesProps = {}): UseGooglePlacesReturn {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoadingScript, setIsLoadingScript] = useState(false);
  const [scriptError, setScriptError] = useState<string | null>(null);
  const autocompleteInstanceRef = useRef<any>(null);
  
  // Load the Google Maps script
  useEffect(() => {
    let isMounted = true;
    
    async function loadScript() {
      // Skip if already loaded
      if (window.google?.maps?.places) {
        return;
      }
      
      if (isMounted) setIsLoadingScript(true);
      
      try {
        await loadGoogleMapsScript();
        if (isMounted) {
          setScriptError(null);
          console.log("Script loaded successfully, ready to initialize autocomplete");
        }
      } catch (error) {
        console.error("Failed to load Google Maps:", error);
        if (isMounted) {
          setScriptError(error instanceof Error ? error.message : "Failed to load Google Maps");
        }
      } finally {
        if (isMounted) setIsLoadingScript(false);
      }
    }
    
    loadScript();
    
    // Clean up callback on unmount
    return () => {
      isMounted = false;
      window.initGoogleMapsCallback = undefined;
      window.gm_authFailure = undefined;
    };
  }, []);
  
  // Initialize autocomplete when input is available and script is loaded
  useEffect(() => {
    if (!inputRef.current || !window.google?.maps?.places) {
      return;
    }
    
    console.log("Setting up autocomplete on input element");
    
    const handlePlaceSelect = (placeData: GooglePlaceData) => {
      console.log("Place selected in hook:", placeData);
      if (onPlaceSelect) {
        onPlaceSelect(placeData);
      }
    };
    
    try {
      // Initialize autocomplete
      autocompleteInstanceRef.current = initializeAutocomplete(
        inputRef.current,
        handlePlaceSelect
      );
    } catch (error) {
      console.error("Error in autocomplete initialization:", error);
      setScriptError("Failed to initialize Places Autocomplete");
    }
    
    // Clean up autocomplete when unmounting
    return () => {
      autocompleteInstanceRef.current = null;
    };
  }, [inputRef.current, window.google?.maps?.places, onPlaceSelect]);
  
  // Function to reset the autocomplete
  const resetAutocomplete = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.value = '';
      
      // Re-initialize if needed
      if (window.google?.maps?.places && !autocompleteInstanceRef.current) {
        try {
          autocompleteInstanceRef.current = initializeAutocomplete(
            inputRef.current,
            (placeData: GooglePlaceData) => {
              if (onPlaceSelect) onPlaceSelect(placeData);
            }
          );
        } catch (error) {
          console.error("Error reinitializing autocomplete:", error);
        }
      }
    }
  }, [onPlaceSelect]);
  
  return {
    inputRef,
    isLoadingScript,
    scriptError,
    resetAutocomplete
  };
}

export default useGooglePlaces;

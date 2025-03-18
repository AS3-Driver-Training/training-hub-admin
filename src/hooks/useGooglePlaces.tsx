
import { useState, useRef, useEffect, useCallback } from 'react';
import { loadGoogleMapsScript } from './google-maps/scriptLoader';
import { initializeAutocomplete, cleanupAutocomplete } from './google-maps/autocomplete';
import { UseGooglePlacesProps, UseGooglePlacesReturn, GooglePlaceData } from './google-maps/types';

export function useGooglePlaces({ onPlaceSelect }: UseGooglePlacesProps = {}): UseGooglePlacesReturn {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoadingScript, setIsLoadingScript] = useState(false);
  const [scriptError, setScriptError] = useState<string | null>(null);
  const [isInputReady, setIsInputReady] = useState(false);
  const autocompleteInstanceRef = useRef<google.maps.places.Autocomplete | null>(null);
  
  // Track when input is ready
  useEffect(() => {
    if (inputRef.current) {
      setIsInputReady(true);
    }
  }, []);
  
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
    
    return () => {
      isMounted = false;
    };
  }, []);
  
  // Initialize autocomplete when input is ready and script is loaded
  useEffect(() => {
    // Only initialize if input is ready and Google Maps is loaded
    if (!isInputReady || !inputRef.current || !window.google?.maps?.places) {
      return;
    }
    
    const handlePlaceSelect = (placeData: GooglePlaceData) => {
      if (onPlaceSelect) {
        onPlaceSelect(placeData);
      }
    };
    
    try {
      // Initialize autocomplete with a slight delay to ensure DOM is ready
      const timer = setTimeout(() => {
        if (inputRef.current && window.google?.maps?.places) {
          // Initialize autocomplete
          autocompleteInstanceRef.current = initializeAutocomplete(
            inputRef.current,
            handlePlaceSelect
          );
        }
      }, 100);
      
      return () => {
        clearTimeout(timer);
      };
    } catch (error) {
      console.error("Error in autocomplete initialization:", error);
      setScriptError("Failed to initialize Places Autocomplete");
    }
    
    // Clean up autocomplete when unmounting
    return () => {
      cleanupAutocomplete();
      autocompleteInstanceRef.current = null;
    };
  }, [isInputReady, onPlaceSelect]);
  
  // Function to reset the autocomplete
  const resetAutocomplete = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, []);
  
  return {
    inputRef,
    isLoadingScript,
    scriptError,
    resetAutocomplete
  };
}

export default useGooglePlaces;

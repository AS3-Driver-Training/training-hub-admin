
import { useState, useRef, useEffect, useCallback } from 'react';
import { loadGoogleMapsScript } from './google-maps/scriptLoader';
import { initializeAutocomplete } from './google-maps/autocomplete';
import { UseGooglePlacesProps, UseGooglePlacesReturn, GooglePlaceData } from './google-maps/types';

export function useGooglePlaces({ onPlaceSelect }: UseGooglePlacesProps = {}): UseGooglePlacesReturn {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoadingScript, setIsLoadingScript] = useState(false);
  const [scriptError, setScriptError] = useState<string | null>(null);
  const [isInputReady, setIsInputReady] = useState(false);
  const autocompleteInstanceRef = useRef<google.maps.places.Autocomplete | null>(null);
  const listenerRef = useRef<google.maps.MapsEventListener | null>(null);
  
  // Track when input is ready
  useEffect(() => {
    if (inputRef.current) {
      setIsInputReady(true);
    }
  }, [inputRef.current]);
  
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
    };
  }, []);
  
  // Initialize autocomplete when input is ready and script is loaded
  useEffect(() => {
    // Only initialize if input is ready and Google Maps is loaded
    if (!isInputReady || !inputRef.current || !window.google?.maps?.places) {
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
      // Cleanup previous instance if it exists
      if (listenerRef.current) {
        listenerRef.current.remove();
        listenerRef.current = null;
      }
      
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
      if (listenerRef.current) {
        listenerRef.current.remove();
        listenerRef.current = null;
      }
      autocompleteInstanceRef.current = null;
    };
  }, [isInputReady, onPlaceSelect, window.google?.maps?.places]);
  
  // Function to reset the autocomplete
  const resetAutocomplete = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.value = '';
      
      // Re-initialize if needed
      if (window.google?.maps?.places && !autocompleteInstanceRef.current && isInputReady) {
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
  }, [onPlaceSelect, isInputReady]);
  
  return {
    inputRef,
    isLoadingScript,
    scriptError,
    resetAutocomplete
  };
}

export default useGooglePlaces;

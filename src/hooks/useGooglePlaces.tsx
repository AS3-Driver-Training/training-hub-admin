
import { useRef, useState, useEffect, useCallback } from 'react';
import { loadGoogleMapsScript } from '@/hooks/google-maps/scriptLoader';
import { initializeAutocomplete, resetAutocomplete as resetAutocompleteInstance } from '@/hooks/google-maps/autocomplete';
import { registerErrorHandlers } from '@/hooks/google-maps/errorHandlers';
import { GooglePlaceData, UseGooglePlacesProps, UseGooglePlacesReturn } from '@/hooks/google-maps/types';

export function useGooglePlaces({ onPlaceSelect }: UseGooglePlacesProps = {}): UseGooglePlacesReturn {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoadingScript, setIsLoadingScript] = useState(false);
  const [scriptError, setScriptError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Function to handle place selection
  const handlePlaceSelect = useCallback((placeData: GooglePlaceData) => {
    if (onPlaceSelect) {
      onPlaceSelect(placeData);
    }
  }, [onPlaceSelect]);

  // Load the Google Maps script
  useEffect(() => {
    // Register global error handlers
    registerErrorHandlers(setScriptError);

    // Load the script if not already loaded
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      setIsLoadingScript(true);
      loadGoogleMapsScript()
        .then(() => {
          console.info('Google Maps API loaded successfully');
          setIsLoadingScript(false);
          setScriptError(null);
        })
        .catch((error) => {
          console.error('Error loading Google Maps API:', error);
          setIsLoadingScript(false);
          setScriptError(error.message || 'Failed to load Google Maps API');
        });
    } else {
      console.info('Google Maps API already loaded and ready to use');
    }
  }, []);

  // Initialize autocomplete when input ref and Google Maps are available
  useEffect(() => {
    // Check if the script is loaded and an input element exists
    if (
      !isLoadingScript && 
      !scriptError && 
      inputRef.current && 
      window.google && 
      window.google.maps && 
      window.google.maps.places &&
      !isInitialized
    ) {
      console.info('Initializing Google Places Autocomplete');
      
      try {
        initializeAutocomplete(inputRef.current, handlePlaceSelect);
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing autocomplete:', error);
        setScriptError((error as Error).message || 'Failed to initialize Google Places Autocomplete');
      }
    }
  }, [isLoadingScript, scriptError, handlePlaceSelect, isInitialized]);

  // Reset autocomplete when inputRef changes
  const resetAutocomplete = useCallback(() => {
    setIsInitialized(false);
    if (inputRef.current) {
      resetAutocompleteInstance(inputRef.current);
      
      // Re-initialize autocomplete
      if (window.google && window.google.maps && window.google.maps.places) {
        try {
          initializeAutocomplete(inputRef.current, handlePlaceSelect);
          setIsInitialized(true);
        } catch (error) {
          console.error('Error re-initializing autocomplete:', error);
        }
      }
    }
  }, [handlePlaceSelect]);

  return {
    inputRef,
    isLoadingScript,
    scriptError,
    resetAutocomplete,
  };
}

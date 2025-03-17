
import { useState, useEffect, useRef } from "react";
import { useGoogleMapsErrorHandler, setupGlobalAuthErrorHandler } from "./google-maps/errorHandlers";
import { useGoogleMapsScript } from "./google-maps/scriptLoader";
import { initializeAutocomplete } from "./google-maps/autocomplete";
import { UseGooglePlacesProps, UseGooglePlacesReturn } from "./google-maps/types";

export function useGooglePlaces({ onPlaceSelect }: UseGooglePlacesProps = {}): UseGooglePlacesReturn {
  const [isLoadingScript, setIsLoadingScript] = useState(false);
  const [scriptError, setScriptError] = useState<string | null>(null);
  const autoCompleteRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [initialized, setInitialized] = useState(false);
  
  // Setup error handlers
  useGoogleMapsErrorHandler(setScriptError);
  
  // Initialize autocomplete when script is loaded
  const initAutocomplete = () => {
    if (!initialized && inputRef.current) {
      initializeAutocomplete(inputRef, autoCompleteRef, onPlaceSelect, setScriptError);
      setInitialized(true);
    }
  };
  
  // Load Google Maps script
  useGoogleMapsScript(initAutocomplete, setIsLoadingScript, setScriptError, scriptError);
  
  // Setup global auth error handler
  useEffect(() => {
    const cleanupAuthHandler = setupGlobalAuthErrorHandler(setScriptError);
    return cleanupAuthHandler;
  }, []);

  // Re-initialize autocomplete if the input reference changes or when the component remounts
  useEffect(() => {
    // Small delay to ensure the input ref is properly set
    const timeoutId = setTimeout(() => {
      if (inputRef.current && window.google?.maps?.places && !initialized) {
        initializeAutocomplete(inputRef, autoCompleteRef, onPlaceSelect, setScriptError);
        setInitialized(true);
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [onPlaceSelect, initialized]);

  // Provide a method to manually reset the autocomplete
  const resetAutocomplete = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.focus();
    }
  };

  return {
    inputRef,
    isLoadingScript,
    scriptError,
    resetAutocomplete,
  };
}

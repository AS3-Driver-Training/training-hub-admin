
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
      console.log("Initializing autocomplete from script load callback with input:", inputRef.current);
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

  // Re-initialize autocomplete if the input reference changes
  useEffect(() => {
    // Skip if there's an error or we're still loading
    if (scriptError || !window.google?.maps?.places) {
      return;
    }

    // Reset initialized state if input ref changes
    const currentInput = inputRef.current;
    if (currentInput && !initialized) {
      console.log("Input ref changed, reinitializing autocomplete with:", currentInput);
      
      const timeoutId = setTimeout(() => {
        initializeAutocomplete(inputRef, autoCompleteRef, onPlaceSelect, setScriptError);
        setInitialized(true);
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [inputRef.current, onPlaceSelect, initialized, scriptError]);

  // Provide a method to manually reset the autocomplete
  const resetAutocomplete = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.focus();
      
      // If we're already initialized with a different input, reinitialize
      if (initialized && autoCompleteRef.current) {
        setInitialized(false);
      }
    }
  };

  return {
    inputRef,
    isLoadingScript,
    scriptError,
    resetAutocomplete,
  };
}

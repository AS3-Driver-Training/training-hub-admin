
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
  
  // Setup global auth error handler
  useEffect(() => {
    const cleanupAuthHandler = setupGlobalAuthErrorHandler(setScriptError);
    return cleanupAuthHandler;
  }, []);

  // Initialize autocomplete when script is loaded or input reference changes
  useEffect(() => {
    // Skip if there's an error or we're still loading or no input element
    if (scriptError || !window.google?.maps?.places || !inputRef.current) {
      return;
    }

    // Prevent continuous reinitializing by checking if this input was already initialized
    if (autoCompleteRef.current && autoCompleteRef.current.inputField === inputRef.current) {
      return;
    }

    console.log("Input ref is available, initializing autocomplete with:", inputRef.current);
    
    // Add a small delay to ensure the DOM is fully updated
    const timer = setTimeout(() => {
      initializeAutocomplete(inputRef, autoCompleteRef, onPlaceSelect, setScriptError);
      setInitialized(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [inputRef.current, onPlaceSelect, scriptError]);  // Re-run when these dependencies change

  // Load Google Maps script
  useGoogleMapsScript(
    // Callback when script is loaded
    () => {
      if (!initialized && inputRef.current) {
        console.log("Google Maps script loaded, initializing autocomplete");
        
        // Add a small delay to ensure DOM is ready
        setTimeout(() => {
          initializeAutocomplete(inputRef, autoCompleteRef, onPlaceSelect, setScriptError);
          setInitialized(true);
        }, 100);
      }
    },
    setIsLoadingScript,
    setScriptError,
    scriptError
  );

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

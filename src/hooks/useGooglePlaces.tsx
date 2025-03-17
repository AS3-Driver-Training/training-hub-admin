
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
  
  // Setup error handlers
  useGoogleMapsErrorHandler(setScriptError);
  
  // Initialize autocomplete when script is loaded
  const initAutocomplete = () => {
    initializeAutocomplete(inputRef, autoCompleteRef, onPlaceSelect, setScriptError);
  };
  
  // Load Google Maps script
  useGoogleMapsScript(initAutocomplete, setIsLoadingScript, setScriptError, scriptError);
  
  // Setup global auth error handler
  useEffect(() => {
    const cleanupAuthHandler = setupGlobalAuthErrorHandler(setScriptError);
    return cleanupAuthHandler;
  }, []);

  // Provide a method to manually reset the autocomplete
  const resetAutocomplete = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return {
    inputRef,
    isLoadingScript,
    scriptError,
    resetAutocomplete,
  };
}


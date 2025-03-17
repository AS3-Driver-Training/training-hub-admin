
import { useState, useEffect } from 'react';
import { getGoogleMapsScriptUrl, SCRIPT_LOAD_TIMEOUT } from './constants';

/**
 * Hook to load the Google Maps script
 */
export const useGoogleMapsScript = (
  initCallback: () => void,
  setIsLoadingScript: (isLoading: boolean) => void,
  setScriptError: (error: string | null) => void,
  scriptError: string | null
) => {
  useEffect(() => {
    // Skip if we already found an error
    if (scriptError) {
      return;
    }

    // Define callback for when Google Maps script loads
    window.initGoogleMapsCallback = () => {
      console.log("Google Maps API loaded successfully");
      setIsLoadingScript(false);
      
      // Short delay to ensure DOM is ready
      setTimeout(() => {
        initCallback();
      }, 100);
    };

    // Check if Google Maps script is already loaded
    if (window.google?.maps?.places) {
      console.log("Google Maps API already loaded");
      initCallback();
      return;
    }

    console.log("Loading Google Maps API script...");
    setIsLoadingScript(true);
    
    // Create and append the script tag
    const script = document.createElement("script");
    script.src = getGoogleMapsScriptUrl();
    script.async = true;
    script.defer = true;
    
    // Handle script load error
    script.onerror = () => {
      console.error("Google Maps script failed to load");
      setIsLoadingScript(false);
      setScriptError("Failed to load Google Maps. Please enter address manually.");
    };

    // Set a timeout for loading the script
    const timeoutId = setTimeout(() => {
      if (setIsLoadingScript) {
        console.error("Google Maps script load timeout");
        setIsLoadingScript(false);
        setScriptError("Google Maps took too long to load. Please enter address manually.");
      }
    }, SCRIPT_LOAD_TIMEOUT);

    document.head.appendChild(script);

    return () => {
      // Clean up timeout
      clearTimeout(timeoutId);
      
      // Clean up script if component unmounts before script loads
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
      
      // Clean up global callbacks
      if (window.initGoogleMapsCallback) {
        delete window.initGoogleMapsCallback;
      }
    };
  }, [scriptError, setIsLoadingScript, setScriptError, initCallback]);
};


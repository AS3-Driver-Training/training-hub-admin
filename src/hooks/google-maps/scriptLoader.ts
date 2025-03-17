
import { useEffect } from 'react';
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

    // Check if Google Maps script is already loaded and ready to use
    if (window.google?.maps?.places) {
      console.log("Google Maps API already loaded and ready to use");
      // Call init callback if Google Maps is already loaded
      initCallback();
      return;
    }

    // Only define callback if it doesn't exist yet
    if (!window.initGoogleMapsCallback) {
      window.initGoogleMapsCallback = () => {
        console.log("Google Maps API loaded successfully");
        setIsLoadingScript(false);
        
        // Short delay to ensure DOM is ready
        setTimeout(() => {
          initCallback();
        }, 100);
      };
    }

    // Check if the script tag already exists to prevent duplicate loading
    const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
    if (existingScript) {
      // Script is already in the DOM but not yet fully loaded or initialized
      console.log("Google Maps script tag already exists, waiting for it to load");
      
      // If it's already in the DOM but Google isn't defined, we're still loading
      if (!window.google?.maps?.places) {
        setIsLoadingScript(true);
      }
      return;
    }

    console.log("Loading Google Maps API script...");
    setIsLoadingScript(true);
    
    // Create and append the script tag
    const script = document.createElement("script");
    script.src = getGoogleMapsScriptUrl();
    script.async = true;
    script.defer = true;
    script.id = "google-maps-script"; // Add ID to easily identify the script
    
    // Handle script load error
    script.onerror = () => {
      console.error("Google Maps script failed to load");
      setIsLoadingScript(false);
      setScriptError("Failed to load Google Maps. Please enter address manually.");
    };

    // Set a timeout for loading the script
    const timeoutId = setTimeout(() => {
      if (!window.google?.maps?.places) {
        console.error("Google Maps script load timeout");
        setIsLoadingScript(false);
        setScriptError("Google Maps took too long to load. Please enter address manually.");
      }
    }, SCRIPT_LOAD_TIMEOUT);

    document.head.appendChild(script);

    return () => {
      // Clean up timeout
      clearTimeout(timeoutId);
    };
  }, [scriptError, setIsLoadingScript, setScriptError, initCallback]);
};

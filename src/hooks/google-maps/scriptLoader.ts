
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

    // Check if Google Maps script is already loaded
    if (window.google?.maps?.places) {
      console.log("Google Maps API already loaded");
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
      // Script is already in the DOM but not yet loaded
      console.log("Google Maps script tag already exists, waiting for it to load");
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
      console.error("Google Maps script load timeout");
      setIsLoadingScript(false);
      setScriptError("Google Maps took too long to load. Please enter address manually.");
    }, SCRIPT_LOAD_TIMEOUT);

    document.head.appendChild(script);

    return () => {
      // Clean up timeout
      clearTimeout(timeoutId);
      
      // We don't remove the script on unmount as it might be used by other components
      // But we clean up the global callback
      if (window.initGoogleMapsCallback) {
        delete window.initGoogleMapsCallback;
      }
    };
  }, [scriptError, setIsLoadingScript, setScriptError, initCallback]);
};

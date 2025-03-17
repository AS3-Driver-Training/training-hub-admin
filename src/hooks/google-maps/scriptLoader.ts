
// Google Maps API key - in a real app, this would be from environment variables
const GOOGLE_MAPS_API_KEY = 'AIzaSyCu7aCPjM539cGuK3ng2TXDvYcVkLJ1Pi4';

// Timeout for loading in milliseconds
const SCRIPT_LOAD_TIMEOUT = 10000;

/**
 * Load the Google Maps API script
 */
export function loadGoogleMapsScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // If already loaded, resolve immediately
    if (window.google?.maps?.places) {
      console.log("Google Maps script already loaded");
      return resolve();
    }

    // Define the callback function that Google Maps will call when loaded
    window.initGoogleMapsCallback = () => {
      console.log("Google Maps loaded successfully");
      resolve();
    };

    // Set up auth failure handler
    window.gm_authFailure = () => {
      const error = new Error("Google Maps authentication failed - API key may be invalid");
      console.error(error);
      reject(error);
    };

    // Create and add the script tag
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGoogleMapsCallback`;
    script.async = true;
    script.defer = true;
    
    // Error handling
    script.onerror = () => {
      const error = new Error("Failed to load Google Maps script");
      console.error(error);
      reject(error);
    };

    // Set a timeout in case Google never calls our callback
    const timeoutId = setTimeout(() => {
      if (!window.google?.maps?.places) {
        const error = new Error("Google Maps script load timeout");
        console.error(error);
        reject(error);
      }
    }, SCRIPT_LOAD_TIMEOUT);

    // Clean up the timeout when the script loads
    script.onload = () => {
      // The actual initialization happens in the callback
      // This just clears the timeout
      clearTimeout(timeoutId);
    };

    // Add script to document
    document.head.appendChild(script);
  });
}

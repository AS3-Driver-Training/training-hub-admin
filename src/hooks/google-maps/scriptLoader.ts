
import { getGoogleMapsScriptUrl, SCRIPT_LOAD_TIMEOUT } from './constants';

/**
 * Loads the Google Maps API script with Places library
 */
export async function loadGoogleMapsScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if the script is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      console.info('Google Maps script already loaded');
      resolve();
      return;
    }

    // Check if we're already loading the script (to prevent duplicate loads)
    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      console.info('Google Maps script already loading');
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', (e) => reject(new Error('Google Maps script failed to load')));
      return;
    }

    // Set up a timeout to reject the promise if loading takes too long
    const timeoutId = setTimeout(() => {
      reject(new Error('Google Maps script load timeout'));
    }, SCRIPT_LOAD_TIMEOUT);

    // Define the callback function that will be called when the script loads
    window.initGoogleMapsCallback = () => {
      clearTimeout(timeoutId);
      console.info('Google Maps script loaded successfully');
      resolve();
    };

    // Create script element
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.type = 'text/javascript';
    script.src = getGoogleMapsScriptUrl();
    script.async = true;
    script.defer = true;

    // Handle script load error
    script.onerror = () => {
      clearTimeout(timeoutId);
      const error = new Error('Google Maps script failed to load');
      console.error(error);
      reject(error);
    };

    // Append the script to the document
    document.head.appendChild(script);
  });
}

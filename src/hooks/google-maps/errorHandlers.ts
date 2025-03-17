
/**
 * Error handlers for Google Maps API
 */

// Type definition for Google Maps API error
interface GoogleMapErrorEvent {
  error: {
    message: string;
  };
}

/**
 * Setup a React hook to handle Google Maps API errors.
 */
export const useGoogleMapsErrorHandler = (
  setError: (error: string) => void,
) => {
  // This now uses MutationObserver to monitor DOM changes instead of deprecated DOMNodeInserted
  return window.addEventListener('error', (event: ErrorEvent) => {
    // Only handle Google Maps errors
    if (event.message && 
        (event.message.includes('Google Maps') || 
         event.message.includes('google is not defined'))) {
      console.error('Google Maps API Error:', event.message);
      setError('Google Maps API Error: Please check your API key and permissions.');
    }
  });
};

/**
 * Set up a global listener for Google Maps authentication errors.
 * These typically appear as alert dialogs or elements inserted into the DOM.
 */
export const setupGlobalAuthErrorHandler = (
  setError: (error: string) => void,
) => {
  if (typeof window === 'undefined') return () => {};
  
  // This now uses MutationObserver to monitor DOM changes instead of deprecated events
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        // Check for Google Maps error messages in the DOM
        const nodes = Array.from(mutation.addedNodes);
        for (const node of nodes) {
          if (node instanceof HTMLElement) {
            // Look for error messages in text content
            const text = node.textContent?.toLowerCase() || '';
            if (
              (text.includes('google maps') && text.includes('error')) ||
              text.includes('api key') ||
              text.includes('authentication') ||
              text.includes('billing account')
            ) {
              console.error('Google Maps Authentication Error detected in DOM');
              setError('Google Maps Authentication Error: Please check your API key and billing status.');
            }
          }
        }
      }
    }
  });
  
  // Start observing the entire document for changes
  observer.observe(document.body, { 
    childList: true, 
    subtree: true 
  });
  
  // Also add window.gm_authFailure handler
  window.gm_authFailure = () => {
    console.error('Google Maps Authentication Failed');
    setError('Google Maps Authentication Failed: Please check your API key and billing status.');
  };
  
  // Setup a global error event listener for Google Maps
  const errorHandler = (event: GoogleMapErrorEvent) => {
    if (event.error && event.error.message) {
      console.error('Google Maps API Error:', event.error.message);
      setError(`Google Maps API Error: ${event.error.message}`);
    }
  };
  
  // Add the error handler to window object for Google to call
  window.gm_errorHandler = errorHandler;
  
  return () => {
    // Clean up
    observer.disconnect();
    delete window.gm_authFailure;
    delete window.gm_errorHandler;
  };
};


/**
 * Registers error handlers for Google Maps API
 */
export function registerErrorHandlers(setError: (errorMessage: string) => void): void {
  // Authentication error handler (when the API key is invalid or has issues)
  window.gm_authFailure = () => {
    const errorMessage = 'Google Maps authentication failed. Check your API key.';
    console.error(errorMessage);
    setError(errorMessage);
  };

  // Use a MutationObserver to detect Google Maps error elements injected into the DOM
  if (!window.gm_errorHandler) {
    const errorObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              // Check for Google Maps alert elements
              const errorElements = node.querySelectorAll('div.gm-err-container, div.gm-err-message');
              if (errorElements.length > 0) {
                let errorMessage = 'Google Maps error detected';
                
                // Try to extract the specific error message
                errorElements.forEach(el => {
                  if (el.textContent) {
                    errorMessage = el.textContent.trim();
                  }
                });
                
                console.error('Google Maps error:', errorMessage);
                setError(errorMessage);
              }
            }
          });
        }
      });
    });

    // Start observing the document body for Google Maps error elements
    errorObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Store the observer in window for cleanup
    window.gm_errorHandler = (event: any) => {
      const errorMessage = event?.error?.message || 'An error occurred with Google Maps API';
      console.error('Google Maps error event:', errorMessage);
      setError(errorMessage);
    };
  }
}

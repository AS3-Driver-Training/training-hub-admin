
import { useState, useEffect } from 'react';

/**
 * Hook to handle Google Maps API runtime errors
 */
export const useGoogleMapsErrorHandler = (setScriptError: (error: string) => void) => {
  useEffect(() => {
    const handleRuntimeError = (event: ErrorEvent) => {
      // Only catch Google Maps related errors
      if (event.filename?.includes('maps.googleapis.com')) {
        console.error("Google Maps runtime error:", event.message);
        
        // Look for specific error messages in the error output
        if (
          event.message?.includes('ApiTargetBlockedMapError') || 
          event.message?.includes('BillingNotEnabledMapError') ||
          event.message?.includes('RefererNotAllowedMapError') ||
          event.message?.includes('InvalidKeyMapError') ||
          event.message?.includes('MissingKeyMapError')
        ) {
          setScriptError("Google Maps API configuration error. Please check your Google Cloud Console settings for API key restrictions, billing, and enabled APIs.");
        }
      }
    };

    // Use MutationObserver instead of deprecated DOMNodeInserted
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement && 
                node.textContent?.includes("This page can't load Google Maps correctly")) {
              setScriptError("Google Maps API configuration error. Please make sure Places API is enabled in Google Cloud Console.");
            }
          });
        }
      });
    });

    // Start observing the document body for DOM changes
    observer.observe(document.body, { childList: true, subtree: true });
    
    window.addEventListener('error', handleRuntimeError);
    
    return () => {
      window.removeEventListener('error', handleRuntimeError);
      observer.disconnect();
    };
  }, [setScriptError]);
};

/**
 * Set up global error handler for Google Maps authentication failures
 */
export const setupGlobalAuthErrorHandler = (setScriptError: (error: string) => void) => {
  window.gm_authFailure = () => {
    console.error("Google Maps authentication error - billing or API key issue");
    setScriptError("Google Maps API requires proper configuration and billing to be enabled. You can still enter addresses manually.");
  };
  
  return () => {
    if (window.gm_authFailure) {
      delete window.gm_authFailure;
    }
  };
};

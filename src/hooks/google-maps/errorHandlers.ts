
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

    // Listen for DOM errors related to Google Maps
    const handleDOMError = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target && target.textContent?.includes("This page can't load Google Maps correctly")) {
        setScriptError("Google Maps API configuration error. Please make sure Places API is enabled in Google Cloud Console.");
      }
    };

    window.addEventListener('error', handleRuntimeError);
    document.addEventListener('DOMNodeInserted', handleDOMError);
    
    return () => {
      window.removeEventListener('error', handleRuntimeError);
      document.removeEventListener('DOMNodeInserted', handleDOMError);
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


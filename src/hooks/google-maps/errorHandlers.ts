
export const setupErrorHandlers = (setScriptError: (error: string | null) => void) => {
  // Auth failure handler (when API key is invalid or has billing issues)
  window.gm_authFailure = () => {
    console.error("Google Maps authentication failed - check your API key");
    setScriptError("Google Maps authentication failed - please check your API key");
  };

  // General Google Maps error handler
  window.gm_errorHandler = (event: any) => {
    console.error("Google Maps error:", event);
    const errorMessage = event?.message || 'Unknown error';
    setScriptError(`Google Maps error: ${errorMessage}`);
  };

  // Return a cleanup function
  return () => {
    window.gm_authFailure = undefined;
    window.gm_errorHandler = undefined;
  };
};

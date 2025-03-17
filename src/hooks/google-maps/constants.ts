
// This is the Google Maps API key - should be loaded from environment variables in production
export const GOOGLE_MAPS_API_KEY = 'AIzaSyCu7aCPjM539cGuK3ng2TXDvYcVkLJ1Pi4';

// Timeout for loading Google Maps script (in milliseconds)
export const SCRIPT_LOAD_TIMEOUT = 10000;

// Google Maps API Script URL
export const getGoogleMapsScriptUrl = () => 
  `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGoogleMapsCallback`;

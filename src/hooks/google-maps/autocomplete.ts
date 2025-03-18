import { useEffect } from 'react';
import { GooglePlaceData } from './types';

// Fix the error with PlacesService
export const setupPacContainerObserver = (): MutationObserver => {
  console.log('Setting up observer for pac-container');
  
  // Fix styling for any existing pac containers
  const pacContainer = document.querySelector('.pac-container') as HTMLElement;
  if (pacContainer) {
    pacContainer.style.zIndex = "10000";
    pacContainer.style.position = "absolute";
    pacContainer.style.pointerEvents = "auto";
    // Add a data attribute to help with detection
    pacContainer.setAttribute('data-google-places-container', 'true');
  }

  // Create a mutation observer to watch for the addition of the .pac-container
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement && node.classList.contains('pac-container')) {
            console.log('pac-container found, setting z-index');
            node.style.zIndex = "10000";
            node.style.position = "absolute";
            node.style.pointerEvents = "auto";
            // Add a data attribute to help with detection
            node.setAttribute('data-google-places-container', 'true');
          }
        });
      }
    });
  });

  // Start observing the document body for changes
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  return observer;
};

export const initializeAutoComplete = (
  inputRef: HTMLInputElement | null,
  setScriptLoaded: (loaded: boolean) => void,
  setScriptError: (error: string | null) => void
): void => {
  if (!inputRef) return;

  const loadGoogleMapsScript = () => {
    if (window.google && window.google.maps) {
      console.log('Google Maps API already loaded');
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log('Google Maps API loaded');
      setScriptLoaded(true);
    };
    script.onerror = () => {
      console.error('Failed to load Google Maps API');
      setScriptError('Failed to load Google Maps API. Please check your API key and network connection.');
    };
    document.head.appendChild(script);
  };

  loadGoogleMapsScript();
};

// Fix the PlacesService reference
export const setupPlaceSearch = (input: HTMLInputElement, map?: google.maps.Map): void => {
  try {
    // Check if PlacesService is available before using it
    if (google && google.maps && google.maps.places && 
        typeof google.maps.places.AutocompleteService !== 'undefined') {
      const autocompleteService = new google.maps.places.AutocompleteService();
      console.log('Places service initialized');
    } else {
      console.warn('Google maps places service not available');
    }
    
    const autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.setFields(['address_components', 'geometry', 'icon', 'name']);

    autocomplete.addListener('place_changed', function() {
      const place = autocomplete.getPlace();

      if (!place.geometry) {
        console.log("Autocomplete's returned place contains no geometry");
        return;
      }

      if (map) {
        if (place.geometry.viewport) {
          map.fitBounds(place.geometry.viewport);
        } else {
          map.setCenter(place.geometry.location!);
          map.setZoom(17);
        }
      }
    });
  } catch (error) {
    console.error('Error setting up place search:', error);
  }
};

export const extractPlaceData = (place: google.maps.places.PlaceResult): GooglePlaceData => {
  const addressComponents = place.address_components || [];
  
  const getStreetNumber = () => {
    const component = addressComponents.find(c => c.types.includes("street_number"));
    return component ? component.long_name : "";
  };

  const getStreetName = () => {
    const component = addressComponents.find(c => c.types.includes("route"));
    return component ? component.long_name : "";
  };

  const getCity = () => {
    const component = addressComponents.find(c => c.types.includes("locality"));
    return component ? component.long_name : "";
  };

  const getRegion = () => {
    const component = addressComponents.find(c => c.types.includes("administrative_area_level_1"));
    return component ? component.long_name : "";
  };

  const getCountry = () => {
    const component = addressComponents.find(c => c.types.includes("country"));
    return component ? component.long_name : "";
  };

  const getPostalCode = () => {
    const component = addressComponents.find(c => c.types.includes("postal_code"));
    return component ? component.long_name : "";
  };

  return {
    name: place.name || "",
    address: `${getStreetNumber()} ${getStreetName()}`.trim(),
    city: getCity(),
    region: getRegion(),
    country: getCountry(),
    postalCode: getPostalCode(),
    latitude: place.geometry?.location?.lat() || 0,
    longitude: place.geometry?.location?.lng() || 0,
    googlePlaceId: place.place_id || "",
  };
};

export const fillAddressFields = (
  place: google.maps.places.PlaceResult,
  form: any
) => {
  const placeData = extractPlaceData(place);
  form.setValue("address", placeData.address);
  form.setValue("city", placeData.city);
  form.setValue("region", placeData.region);
  form.setValue("country", placeData.country);
  form.setValue("postalCode", placeData.postalCode);
};

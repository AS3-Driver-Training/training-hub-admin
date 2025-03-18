
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

// Add the missing initializeAutocomplete function
export const initializeAutocomplete = (
  inputElement: HTMLInputElement,
  handlePlaceSelect: (placeData: GooglePlaceData) => void
): google.maps.places.Autocomplete | null => {
  try {
    if (!window.google?.maps?.places) {
      console.error('Google Maps Places API not loaded');
      return null;
    }

    console.log('Initializing Places Autocomplete');
    
    // Create autocomplete instance
    const autocomplete = new google.maps.places.Autocomplete(inputElement, {
      fields: ['address_components', 'formatted_address', 'geometry', 'name', 'place_id']
    });
    
    // Add place_changed listener
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      
      if (!place.geometry) {
        console.warn('No geometry data for selected place');
        return;
      }
      
      // Extract data for the selected place
      const placeData: GooglePlaceData = {
        place: place.name || '',
        placeName: place.name || '',
        address: place.formatted_address || '',
        googleLocation: `${place.geometry.location?.lat()},${place.geometry.location?.lng()}`,
        region: '', // Will be filled from address components
        country: '', // Will be filled from address components
      };
      
      // Extract region and country from address components
      if (place.address_components) {
        place.address_components.forEach(component => {
          if (component.types.includes('administrative_area_level_1')) {
            placeData.region = component.long_name;
          }
          if (component.types.includes('country')) {
            placeData.country = component.long_name;
          }
        });
      }
      
      // Call the handler with the extracted data
      handlePlaceSelect(placeData);
    });
    
    // Add special handling for the pac-container elements
    setTimeout(() => {
      const pacContainer = document.querySelector('.pac-container');
      if (pacContainer) {
        // Add this critical event handler to the container
        pacContainer.addEventListener('click', (e) => {
          // Let the click work normally, but prevent it from closing the dialog
          e.stopPropagation();
          console.log('Click on pac-container intercepted');
        });
      }
    }, 200);
    
    return autocomplete;
  } catch (error) {
    console.error('Error initializing autocomplete:', error);
    return null;
  }
};

// Add the missing cleanupAutocomplete function
export const cleanupAutocomplete = (): void => {
  // Clean up any Google Maps related elements
  const pacContainers = document.querySelectorAll('.pac-container');
  pacContainers.forEach(container => {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });
  
  console.log('Cleaned up autocomplete elements');
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
    place: place.name || "",
    placeName: place.name || "",
    address: `${getStreetNumber()} ${getStreetName()}`.trim(),
    googleLocation: `${place.geometry?.location?.lat() || 0},${place.geometry?.location?.lng() || 0}`,
    region: getRegion(),
    country: getCountry(),
    city: getCity(),
    postalCode: getPostalCode(),
    latitude: place.geometry?.location?.lat() || 0,
    longitude: place.geometry?.location?.lng() || 0,
    googlePlaceId: place.place_id || "",
  };
};

// Simplify fillAddressFields to avoid type errors
export const fillAddressFields = (
  place: google.maps.places.PlaceResult,
  form: any
) => {
  if (!place || !place.address_components) {
    return;
  }
  
  const getAddressComponent = (
    type: string,
    place: google.maps.places.PlaceResult
  ): string => {
    const component = place.address_components?.find(c => 
      c.types.includes(type)
    );
    return component ? component.long_name : '';
  };
  
  // Set form values with correct typing
  form.setValue("address", place.formatted_address || '');
  form.setValue("city", getAddressComponent('locality', place));
  form.setValue("region", getAddressComponent('administrative_area_level_1', place));
  form.setValue("country", getAddressComponent('country', place));
  form.setValue("postalCode", getAddressComponent('postal_code', place));
};

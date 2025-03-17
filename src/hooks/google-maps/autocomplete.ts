
import { GooglePlaceData } from './types';

// Higher z-index applied to pac-container with improved styling
const applyAutocompleteStyles = () => {
  // Create a style element for the autocomplete dropdown
  const styleElement = document.createElement('style');
  styleElement.id = 'google-places-autocomplete-styles';
  styleElement.textContent = `
    .pac-container {
      z-index: 999999 !important; /* Extremely high z-index */
      position: absolute !important; 
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2) !important;
      pointer-events: auto !important;
    }
    .pac-item {
      pointer-events: auto !important;
      cursor: pointer !important;
    }
    .pac-item:hover {
      background-color: #f8f9fa !important;
    }
    .pac-item *, .pac-item-query, .pac-matched, .pac-icon {
      pointer-events: auto !important;
    }
    /* Force the pac-container to appear above dialogs */
    body > .pac-container {
      z-index: 999999 !important;
    }
  `;
  
  // Remove existing style if it exists
  const existingStyle = document.getElementById('google-places-autocomplete-styles');
  if (existingStyle) {
    document.head.removeChild(existingStyle);
  }
  
  // Add the style to the document head
  document.head.appendChild(styleElement);
};

// Setup direct DOM monitoring for pac-container
const setupPacContainerObserver = () => {
  // Remove any existing listener to prevent duplicates
  document.removeEventListener('DOMNodeInserted', pacContainerHandler);
  document.addEventListener('DOMNodeInserted', pacContainerHandler);
};

// Handler for when pac-container is inserted into the DOM
const pacContainerHandler = (e: any) => {
  if (e.target && e.target.className && 
      (e.target.className === 'pac-container pac-logo' || 
       e.target.className.includes('pac-container'))) {
    
    console.log("PAC container inserted into DOM, applying critical styles");
    
    // Set critical styles directly on the element
    e.target.style.cssText = 'z-index: 999999 !important; position: absolute !important; pointer-events: auto !important;';
    
    // Make sure clicks on dropdown items work
    const items = e.target.querySelectorAll('.pac-item, .pac-item-query, .pac-icon, .pac-item *, .pac-matched');
    items.forEach((item: HTMLElement) => {
      item.style.cssText = 'pointer-events: auto !important; cursor: pointer !important;';
      
      // Add direct event listeners to each item
      const stopEvents = (evt: Event) => {
        evt.stopPropagation();
        // Only prevent default for non-input elements
        if (!(evt.target instanceof HTMLInputElement)) {
          evt.preventDefault();
        }
      };
      
      ['mousedown', 'click', 'pointerdown', 'touchstart'].forEach(eventType => {
        item.addEventListener(eventType, stopEvents, true);
      });
    });
    
    // Add event listeners to the container itself
    const stopEvents = (evt: Event) => {
      evt.stopPropagation();
      // Only prevent default for non-input elements
      if (!(evt.target instanceof HTMLInputElement)) {
        evt.preventDefault();
      }
    };
    
    ['mousedown', 'click', 'pointerdown', 'touchstart'].forEach(eventType => {
      e.target.addEventListener(eventType, stopEvents, true);
    });
  }
};

/**
 * Initialize Google Places Autocomplete on an input element
 */
export function initializeAutocomplete(
  inputElement: HTMLInputElement,
  onPlaceSelect: (data: GooglePlaceData) => void
): google.maps.places.Autocomplete | null {
  if (!inputElement || !window.google?.maps?.places) {
    console.error("Cannot initialize autocomplete: Google Maps not loaded or input not available");
    return null;
  }

  try {
    // Apply custom styles to ensure dropdown appears above other elements
    applyAutocompleteStyles();
    
    // Setup DOM observer for pac-container
    setupPacContainerObserver();
    
    // Create the autocomplete object with delayed timeout to ensure proper initialization
    const autocomplete = new window.google.maps.places.Autocomplete(inputElement, {
      types: ['establishment', 'geocode'],
      fields: ['address_components', 'formatted_address', 'geometry', 'name', 'place_id']
    });
    
    // These event listeners will prevent the dialog from closing
    const preventDialogClose = (e: Event) => {
      e.stopPropagation();
    };
    
    // Clear previous handlers to prevent duplicates
    ['click', 'mousedown', 'pointerdown', 'touchstart'].forEach(eventType => {
      inputElement.removeEventListener(eventType, preventDialogClose, true);
      inputElement.addEventListener(eventType, preventDialogClose, true);
    });
    
    // Set up the place changed listener
    const listener = autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      
      console.log("Place selected:", place);
      
      if (!place.geometry) {
        console.warn("No details available for this place");
        return;
      }

      // Extract address components
      const addressComponents: Record<string, string> = {};
      
      if (place.address_components) {
        place.address_components.forEach((component: any) => {
          if (component.types.includes('locality')) {
            addressComponents.city = component.long_name;
          }
          else if (component.types.includes('administrative_area_level_1')) {
            addressComponents.state = component.long_name;
          }
          else if (component.types.includes('country')) {
            addressComponents.country = component.long_name;
          }
        });
      }

      // Get coordinates
      const lat = place.geometry.location?.lat();
      const lng = place.geometry.location?.lng();
      const locationString = lat && lng ? `${lat},${lng}` : '';

      // Create the place data object
      const placeData: GooglePlaceData = {
        place: place.name || '',
        address: place.formatted_address || '',
        googleLocation: locationString,
        region: addressComponents.state || addressComponents.city || '',
        country: addressComponents.country || '',
        placeName: place.name || ''
      };

      // Call the callback with the place data
      onPlaceSelect(placeData);
    });

    return autocomplete;
  } catch (error) {
    console.error("Error initializing autocomplete:", error);
    return null;
  }
}

// Cleanup function to remove event listeners
export function cleanupAutocomplete() {
  document.removeEventListener('DOMNodeInserted', pacContainerHandler);
  
  // Remove the style element
  const styleElement = document.getElementById('google-places-autocomplete-styles');
  if (styleElement) {
    document.head.removeChild(styleElement);
  }
}

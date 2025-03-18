
import { GooglePlaceData } from './types';

// Higher z-index applied to pac-container with improved styling
const applyAutocompleteStyles = () => {
  // Create a style element for the autocomplete dropdown
  const styleElement = document.createElement('style');
  styleElement.id = 'google-places-autocomplete-styles';
  styleElement.textContent = `
    .pac-container {
      z-index: 10000 !important;
      background-color: white !important;
      position: absolute !important; 
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2) !important;
      pointer-events: auto !important;
    }
    .pac-item {
      pointer-events: auto !important;
      cursor: pointer !important;
      background-color: white !important;
    }
    .pac-item:hover {
      background-color: #f8f9fa !important;
    }
    .pac-item *, .pac-item-query, .pac-matched, .pac-icon {
      pointer-events: auto !important;
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
    
    // Create the autocomplete object
    const autocomplete = new window.google.maps.places.Autocomplete(inputElement, {
      types: ['establishment', 'geocode'],
      fields: ['address_components', 'formatted_address', 'geometry', 'name', 'place_id']
    });
    
    // Add data attribute for easier selection
    inputElement.setAttribute('data-google-places-element', 'true');
    
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

      // Delay the callback to prevent dialog closing
      setTimeout(() => {
        // Call the callback with the place data
        onPlaceSelect(placeData);
      }, 100);
    });

    // Apply direct styling to the pac-container after a short delay
    setTimeout(() => {
      const pacContainer = document.querySelector('.pac-container');
      if (pacContainer) {
        pacContainer.setAttribute('data-google-places-container', 'true');
        pacContainer.style.zIndex = "10000";
        pacContainer.style.position = "absolute";
        pacContainer.style.pointerEvents = "auto";
      }
    }, 300);

    return autocomplete;
  } catch (error) {
    console.error("Error initializing autocomplete:", error);
    return null;
  }
}

// Simple observer setup to detect PAC container
export function setupPacContainerObserver(): MutationObserver {
  // Create a mutation observer to watch for pac-container being added to DOM
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          if (node instanceof HTMLElement && 
              (node.classList.contains('pac-container') || 
              node.className.includes('pac-container'))) {
            
            // Set critical styles directly on the element
            node.style.zIndex = '10000';
            node.style.backgroundColor = 'white';
            node.style.position = 'absolute';
            node.style.pointerEvents = 'auto';
            
            // Add data attribute to help with detection
            node.setAttribute('data-google-places-container', 'true');
          }
        });
      }
    });
  });
  
  // Start observing the document body for pac-container additions
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  return observer;
}

// Cleanup function to remove event listeners and observer
export function cleanupAutocomplete() {
  // Remove the style element
  const styleElement = document.getElementById('google-places-autocomplete-styles');
  if (styleElement) {
    document.head.removeChild(styleElement);
  }
}

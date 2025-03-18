
import { GooglePlaceData } from './types';

let autocompleteInstance: google.maps.places.Autocomplete | null = null;
let placeService: google.maps.places.PlacesService | null = null;

// Observer to watch for Google Places container added to DOM
export function setupPacContainerObserver(): MutationObserver {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length) {
        mutation.addedNodes.forEach((node) => {
          // Find any Google Places containers
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;
            if (element.classList.contains('pac-container')) {
              console.log('Found Google Places container, applying styles');
              
              // Add custom attribute for easier detection
              element.setAttribute('data-google-places-container', 'true');
              
              // Apply styles for better integration
              element.style.zIndex = '10000';
              element.style.position = 'absolute';
              element.style.backgroundColor = 'white';
              element.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
              element.style.borderRadius = '0.375rem';
              element.style.overflow = 'hidden';
              element.style.marginTop = '2px';
              element.style.border = '1px solid rgba(0, 0, 0, 0.1)';
              
              // Ensure it has proper pointer events
              element.style.pointerEvents = 'auto';
            }
          }
        });
      }
    });
  });
  
  // Start observing the entire document for .pac-container elements
  observer.observe(document.body, { 
    childList: true, 
    subtree: true 
  });
  
  return observer;
}

// Initialize Google Places autocomplete on an input element
export function initializeAutocomplete(
  inputElement: HTMLInputElement,
  onPlaceSelect?: (placeData: GooglePlaceData) => void
): google.maps.places.Autocomplete {
  console.log('Initializing Places Autocomplete');
  
  try {
    // Initialize autocomplete with desired options
    const options: google.maps.places.AutocompleteOptions = {
      fields: ['address_components', 'formatted_address', 'geometry', 'name', 'place_id'],
      types: ['establishment', 'geocode'],
    };
    
    // Create the autocomplete instance
    autocompleteInstance = new google.maps.places.Autocomplete(inputElement, options);
    
    // Initialize a place service if needed
    const mapDiv = document.createElement('div');
    placeService = new google.maps.places.PlacesService(mapDiv);
    
    // Add event listener for place selection
    autocompleteInstance.addListener('place_changed', () => {
      if (!autocompleteInstance) return;
      
      const place = autocompleteInstance.getPlace();
      console.log('Place selected:', place);
      
      if (!place.geometry) {
        console.warn('No details available for this place');
        return;
      }
      
      // Extract relevant data from the place
      const address = place.formatted_address || '';
      const placeName = place.name || '';
      
      // Extract region and country from address components
      let region = '';
      let country = '';
      
      if (place.address_components) {
        for (const component of place.address_components) {
          const componentType = component.types[0];
          
          if (componentType === 'administrative_area_level_1') {
            region = component.long_name;
          } else if (componentType === 'country') {
            country = component.long_name;
          }
        }
      }
      
      // Create location string format (lat,lng)
      const googleLocation = place.geometry.location 
        ? `${place.geometry.location.lat()},${place.geometry.location.lng()}`
        : '';
      
      // Prepare place data object
      const placeData: GooglePlaceData = {
        place: placeName,
        placeName: placeName,
        address: address,
        googleLocation: googleLocation,
        region: region,
        country: country
      };
      
      // Call the callback if provided
      if (onPlaceSelect) {
        onPlaceSelect(placeData);
      }
      
      // Apply styles to Google Places elements after selection
      applyStylesToGooglePlacesElements();
    });
    
    return autocompleteInstance;
  } catch (error) {
    console.error('Error initializing Places Autocomplete:', error);
    throw error;
  }
}

// Apply styles to Google Places container element
function applyStylesToGooglePlacesElements() {
  // Get any Google Places container currently in the DOM
  const pacContainer = document.querySelector('.pac-container') as HTMLElement;
  
  // Only apply styles if the element exists
  if (pacContainer) {
    pacContainer.style.zIndex = "10000";
    pacContainer.style.position = "absolute";
    pacContainer.style.pointerEvents = "auto";
    
    // Mark all Google Places elements with a data attribute
    pacContainer.setAttribute('data-google-places-container', 'true');
    
    // Find all Google Places items and mark them
    const pacItems = pacContainer.querySelectorAll('.pac-item');
    pacItems.forEach(item => {
      (item as HTMLElement).setAttribute('data-google-places-element', 'true');
    });
  }
}

// Clean up autocomplete instance
export function cleanupAutocomplete() {
  if (autocompleteInstance) {
    // Note: google.maps.event.clearInstanceListeners is the proper way to clean up
    google.maps.event.clearInstanceListeners(autocompleteInstance);
    autocompleteInstance = null;
  }
  
  if (placeService) {
    placeService = null;
  }
}

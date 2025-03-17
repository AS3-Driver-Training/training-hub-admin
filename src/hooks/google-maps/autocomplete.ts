
/**
 * Attaches Google Places Autocomplete to an input element
 */
import { useCallback } from 'react';
import { registerErrorHandlers } from './errorHandlers';

// Add a type declaration for the google namespace
declare global {
  interface Window {
    google: typeof google;
    initGoogleMapsCallback?: () => void;
    gm_authFailure?: () => void;
    gm_errorHandler?: (event: any) => void;
  }
  
  namespace google {
    namespace maps {
      class LatLng {
        constructor(lat: number, lng: number);
        lat(): number;
        lng(): number;
        toString(): string;
      }
      
      class LatLngBounds {
        constructor(sw?: LatLng, ne?: LatLng);
        extend(point: LatLng): LatLngBounds;
        getCenter(): LatLng;
        toString(): string;
      }
      
      interface LatLngBoundsLiteral {
        east: number;
        north: number;
        south: number;
        west: number;
      }
      
      interface GeocoderAddressComponent {
        long_name: string;
        short_name: string;
        types: string[];
      }
      
      namespace places {
        class Autocomplete {
          constructor(
            inputElement: HTMLInputElement,
            options?: AutocompleteOptions
          );
          addListener(eventName: string, handler: (...args: any[]) => void): google.maps.MapsEventListener;
          getPlace(): google.maps.places.PlaceResult;
          setBounds(bounds: google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral): void;
          setComponentRestrictions(restrictions: ComponentRestrictions): void;
          setFields(fields: string[]): void;
          setOptions(options: AutocompleteOptions): void;
        }
        
        interface AutocompleteOptions {
          bounds?: google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral;
          componentRestrictions?: ComponentRestrictions;
          fields?: string[];
          strictBounds?: boolean;
          types?: string[];
        }
        
        interface ComponentRestrictions {
          country: string | string[];
        }
        
        interface PlaceResult {
          address_components?: google.maps.GeocoderAddressComponent[];
          formatted_address?: string;
          geometry?: {
            location: google.maps.LatLng;
            viewport: google.maps.LatLngBounds;
          };
          name?: string;
          place_id?: string;
          types?: string[];
          [key: string]: any;
        }
      }
      
      interface MapsEventListener {
        remove(): void;
      }
    }
  }
}

// Cache for autocomplete instances to avoid duplicate initialization
const autocompleteCache = new WeakMap<HTMLInputElement, google.maps.places.Autocomplete>();

export function initializeAutocomplete(
  inputElement: HTMLInputElement,
  onPlaceSelect?: (place: any) => void
): void {
  // Check if autocomplete is already initialized for this input
  if (autocompleteCache.has(inputElement)) {
    console.info('Autocomplete already initialized for this input, skipping');
    return;
  }

  try {
    // Create the autocomplete instance
    const autocompleteInstance = new google.maps.places.Autocomplete(
      inputElement,
      {
        fields: ['address_components', 'formatted_address', 'geometry', 'name', 'place_id'],
      }
    );
    
    // Store in cache
    autocompleteCache.set(inputElement, autocompleteInstance);
    
    console.info('Google Places Autocomplete initialized successfully');

    // Increase z-index of the autocomplete dropdown
    setTimeout(() => {
      const pacContainers = document.querySelectorAll('.pac-container');
      pacContainers.forEach(container => {
        if (container instanceof HTMLElement) {
          container.style.zIndex = '10000'; // Set higher than dialog
        }
      });
    }, 100);

    // Add place_changed event listener
    if (onPlaceSelect) {
      const listener = autocompleteInstance.addListener('place_changed', () => {
        const place = autocompleteInstance.getPlace();
        if (!place.geometry) {
          console.warn('Place selected has no geometry data');
          return;
        }
        
        console.log('Place selected:', place);
        
        // Extract relevant place data
        const placeData = {
          place: place.name || '',
          placeName: place.name || '',
          address: place.formatted_address || '',
          googleLocation: place.geometry.location.toString(),
          region: '',
          country: ''
        };
        
        // Process address components
        if (place.address_components) {
          place.address_components.forEach(component => {
            const types = component.types;
            
            if (types.includes('administrative_area_level_1')) {
              placeData.region = component.long_name;
            }
            
            if (types.includes('country')) {
              placeData.country = component.long_name;
            }
          });
        }
        
        onPlaceSelect(placeData);
      });
    }
  } catch (error) {
    console.error('Error initializing Google Places Autocomplete:', error);
    throw error;
  }
}

export function resetAutocomplete(inputElement: HTMLInputElement): void {
  // Remove from cache so it can be reinitialized
  if (autocompleteCache.has(inputElement)) {
    autocompleteCache.delete(inputElement);
    console.info('Google Maps script loaded, initializing autocomplete');
  }
}

export async function attachGooglePlacesAutocomplete(
  inputRef: React.RefObject<HTMLInputElement>,
  options: {
    setError: (errorMsg: string) => void;
    onPlaceSelect?: (place: google.maps.places.PlaceResult) => void;
    customOptions?: google.maps.places.AutocompleteOptions;
  }
): Promise<(() => void) | undefined> {
  const { setError, onPlaceSelect, customOptions = {} } = options;

  // Register error handlers
  registerErrorHandlers(setError);

  if (!inputRef.current) {
    console.error('Input element reference is not available');
    return undefined;
  }

  try {
    if (!window.google?.maps?.places) {
      console.error('Google Maps Places API not loaded');
      return undefined;
    }

    // Create the autocomplete instance with higher z-index to ensure it's clickable
    const autocompleteInstance = new google.maps.places.Autocomplete(
      inputRef.current,
      {
        fields: ['address_components', 'formatted_address', 'geometry', 'name', 'place_id'],
        ...customOptions
      }
    );

    // Increase z-index of the autocomplete dropdown using CSS
    // This helps ensure it appears above other elements and is clickable
    setTimeout(() => {
      const pacContainers = document.querySelectorAll('.pac-container');
      pacContainers.forEach(container => {
        if (container instanceof HTMLElement) {
          container.style.zIndex = '10000'; // Higher than dialog
        }
      });
    }, 100);

    // Use the proper event listener method
    const listener = autocompleteInstance.addListener('place_changed', () => {
      const place = autocompleteInstance.getPlace();
      console.log('Place selected:', place);
      if (onPlaceSelect && place) {
        onPlaceSelect(place);
      }
    });

    // Return a cleanup function
    return () => {
      if (listener) {
        listener.remove();
      }
    };
  } catch (error) {
    console.error('Error attaching Google Places Autocomplete:', error);
    setError(`Failed to initialize address search: ${error instanceof Error ? error.message : String(error)}`);
    return undefined;
  }
}

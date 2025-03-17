
/**
 * Attaches Google Places Autocomplete to an input element
 */
import { useCallback } from 'react';
import { registerErrorHandlers } from './errorHandlers';

// Add a type declaration for the google namespace
declare global {
  namespace google {
    namespace maps {
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
          container.style.zIndex = '9999';
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


// Type definitions for Google Maps JavaScript API - simplified version

declare namespace google {
  namespace maps {
    class LatLng {
      constructor(lat: number, lng: number);
      lat(): number;
      lng(): number;
    }

    class LatLngBounds {
      constructor(sw?: LatLng, ne?: LatLng);
      extend(point: LatLng): LatLngBounds;
    }

    namespace places {
      class Autocomplete {
        constructor(inputField: HTMLInputElement, opts?: AutocompleteOptions);
        addListener(eventName: string, handler: Function): MapsEventListener;
        getPlace(): PlaceResult;
        setBounds(bounds: LatLngBounds): void;
        setFields(fields: string[]): void;
        setOptions(options: AutocompleteOptions): void;
      }

      interface AutocompleteOptions {
        types?: string[];
        fields?: string[];
        componentRestrictions?: ComponentRestrictions;
        bounds?: LatLngBounds;
      }

      interface ComponentRestrictions {
        country?: string | string[];
      }

      interface PlaceResult {
        address_components?: AddressComponent[];
        formatted_address?: string;
        geometry?: {
          location?: {
            lat: () => number;
            lng: () => number;
          };
        };
        name?: string;
        place_id?: string;
        types?: string[];
      }

      interface AddressComponent {
        long_name: string;
        short_name: string;
        types: string[];
      }
    }

    interface MapsEventListener {
      remove: () => void;
    }
  }
}

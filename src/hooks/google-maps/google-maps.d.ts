
// Type definitions for Google Maps JavaScript API

declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: Element, opts?: MapOptions);
    }

    class LatLng {
      constructor(lat: number, lng: number);
      lat(): number;
      lng(): number;
    }

    class LatLngBounds {
      constructor(sw?: LatLng, ne?: LatLng);
      extend(point: LatLng): LatLngBounds;
    }

    interface MapOptions {
      center?: LatLng | null;
      zoom?: number;
      [key: string]: any;
    }

    namespace places {
      class Autocomplete {
        constructor(inputField: HTMLInputElement, opts?: AutocompleteOptions);
        addListener(eventName: string, handler: () => void): any;
        getPlace(): PlaceResult;
      }

      interface AutocompleteOptions {
        bounds?: LatLngBounds;
        componentRestrictions?: ComponentRestrictions;
        fields?: string[];
        types?: string[];
        [key: string]: any;
      }

      interface ComponentRestrictions {
        country: string | string[];
      }

      interface PlaceResult {
        address_components?: AddressComponent[];
        formatted_address?: string;
        geometry?: {
          location?: {
            lat(): number;
            lng(): number;
          };
          viewport?: LatLngBounds;
        };
        name?: string;
        place_id?: string;
        [key: string]: any;
      }

      interface AddressComponent {
        long_name: string;
        short_name: string;
        types: string[];
      }
    }
  }
}

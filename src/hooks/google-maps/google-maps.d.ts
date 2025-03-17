
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
        constructor(inputField: HTMLInputElement, opts?: any);
        addListener(eventName: string, handler: Function): any;
        getPlace(): any;
      }
    }
  }
}

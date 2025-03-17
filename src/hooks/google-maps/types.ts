
// Google Maps type declarations
export interface GoogleMapsWindow extends Window {
  google?: {
    maps: {
      places: {
        Autocomplete: new (
          input: HTMLInputElement,
          options?: any
        ) => google.maps.places.Autocomplete;
      };
      Map: any;
      LatLng: any;
      LatLngBounds: any;
    };
  };
  initGoogleMapsCallback?: () => void;
  gm_authFailure?: () => void;
  gm_errorHandler?: (event: any) => void;
}

export interface GooglePlaceData {
  place: string;
  address: string;
  googleLocation: string;
  region: string;
  country: string;
  placeName: string;
}

export interface UseGooglePlacesProps {
  onPlaceSelect?: (placeData: GooglePlaceData) => void;
}

export interface UseGooglePlacesReturn {
  inputRef: React.RefObject<HTMLInputElement>;
  isLoadingScript: boolean;
  scriptError: string | null;
  resetAutocomplete: () => void;
}

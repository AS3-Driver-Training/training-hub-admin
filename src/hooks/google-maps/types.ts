
// Google Maps type declarations
export interface GoogleMapsWindow {
  google?: {
    maps: {
      places: {
        Autocomplete: any;
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

// Extend the global Window interface
declare global {
  interface Window extends GoogleMapsWindow {}
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

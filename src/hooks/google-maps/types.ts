
// Google Maps type declarations
declare global {
  interface Window {
    google?: {
      maps: {
        places: {
          Autocomplete: new (
            input: HTMLInputElement,
            options?: any
          ) => any;
        };
        Map: any;
      };
    };
    initGoogleMapsCallback?: () => void;
    gm_authFailure?: () => void;
  }
}

export interface GooglePlaceData {
  address: string;
  googleLocation: string;
  region: string;
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


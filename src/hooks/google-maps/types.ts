
// Google Maps type declarations
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

// Define global Google Maps types
declare global {
  interface Window {
    google: any;
    initGoogleMapsCallback: () => void;
    gm_authFailure: () => void;
  }
}

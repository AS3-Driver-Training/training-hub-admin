
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

// Declare global Google Maps types
declare global {
  interface Window {
    google: typeof google;
    initGoogleMapsCallback?: () => void;
    gm_authFailure?: () => void;
  }
}


import { RefObject } from 'react';

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
  inputRef: RefObject<HTMLInputElement>;
  isLoadingScript: boolean;
  scriptError: string | null;
  resetAutocomplete: () => void;
}

// Define window augmentation correctly
declare global {
  interface Window {
    google: any;
    initGoogleMapsCallback: () => void;
    gm_authFailure: () => void;
  }
}

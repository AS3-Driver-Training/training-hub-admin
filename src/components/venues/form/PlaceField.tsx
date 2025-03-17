
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GooglePlaceData } from "@/hooks/google-maps/types";
import useGooglePlaces from "@/hooks/useGooglePlaces";
import { LoadingIndicator } from "./LoadingIndicator";
import { GoogleMapsError } from "./GoogleMapsError";

interface PlaceFieldProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect?: (placeData: GooglePlaceData) => void;
  isRequired?: boolean;
}

export function PlaceField({ value, onChange, onPlaceSelect, isRequired = true }: PlaceFieldProps) {
  const [inputValue, setInputValue] = useState(value);
  const { inputRef, isLoadingScript, scriptError, resetAutocomplete } = useGooglePlaces({
    onPlaceSelect: (data) => {
      if (onPlaceSelect) {
        onPlaceSelect(data);
      }
      setInputValue(data.place);
      onChange(data.place);
    }
  });

  // When external value changes, update the input value
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Listen for manual input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="relative space-y-2">
      <Label htmlFor="place" className={isRequired ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
        Place Name
      </Label>
      
      <div className="relative" style={{ zIndex: 9999 }}>
        <Input
          id="place"
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Search for a place or venue"
          className="pr-8"
          required={isRequired}
          autoComplete="off"
        />
        
        {/* Loading indicator */}
        {isLoadingScript && (
          <div className="absolute inset-y-0 right-2 flex items-center">
            <LoadingIndicator />
          </div>
        )}
      </div>

      {/* Error message */}
      {scriptError && <GoogleMapsError error={scriptError} />}
    </div>
  );
}

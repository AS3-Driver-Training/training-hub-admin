
import { useState, useEffect, RefObject, useLayoutEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GooglePlaceData } from "@/hooks/google-maps/types";
import { UseFormReturn } from "react-hook-form";
import { LoadingIndicator } from "./LoadingIndicator";
import { GoogleMapsError } from "./GoogleMapsError";

interface PlaceFieldProps {
  form: UseFormReturn<any>;
  inputRef: RefObject<HTMLInputElement>;
  scriptError: string | null;
  resetAutocomplete: () => void;
  value?: string;
  onChange?: (value: string) => void;
  onPlaceSelect?: (placeData: GooglePlaceData) => void;
  isRequired?: boolean;
}

export function PlaceField({ 
  form, 
  inputRef, 
  scriptError, 
  resetAutocomplete,
  value, 
  onChange, 
  onPlaceSelect, 
  isRequired = true 
}: PlaceFieldProps) {
  const [inputValue, setInputValue] = useState(value || '');
  
  // When external value changes, update the input value
  useEffect(() => {
    if (value !== undefined) {
      setInputValue(value);
    }
  }, [value]);

  // Use useLayoutEffect to ensure the input element has the proper stacking context
  useLayoutEffect(() => {
    if (inputRef.current) {
      // Add data attribute to help with detection
      inputRef.current.setAttribute('data-google-places-element', 'true');
      
      // Ensure clicking on this input doesn't close the dialog
      inputRef.current.addEventListener('click', (e) => {
        e.stopPropagation();
      });
      
      // Clean up
      return () => {
        if (inputRef.current) {
          inputRef.current.removeEventListener('click', (e) => {
            e.stopPropagation();
          });
        }
      };
    }
  }, [inputRef]);

  // Listen for manual input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <div className="relative space-y-2">
      <Label htmlFor="place" className={isRequired ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
        Place Name
      </Label>
      
      <div className="relative">
        <Input
          id="place"
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Search for a place or venue"
          className="pr-8 z-[1]"
          required={isRequired}
          autoComplete="off"
          data-google-places-element="true"
        />
        
        {/* Loading indicator */}
        <div className="absolute inset-y-0 right-2 flex items-center">
          <LoadingIndicator isLoading={!!form.formState.isSubmitting} />
        </div>
      </div>

      {/* Error message */}
      {scriptError && <GoogleMapsError scriptError={scriptError} />}
    </div>
  );
}

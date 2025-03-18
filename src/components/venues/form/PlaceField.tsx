
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

  // Use useLayoutEffect to ensure the input element has the proper setup before any interactions
  useLayoutEffect(() => {
    if (inputRef.current) {
      // Add data attribute to help with detection
      inputRef.current.setAttribute('data-google-places-element', 'true');
      
      // Ensure clicking on this input doesn't close the dialog but allows typing
      const stopPropagation = (e: Event) => {
        e.stopPropagation();
      };
      
      inputRef.current.addEventListener('click', stopPropagation);
      inputRef.current.addEventListener('mousedown', stopPropagation);
      inputRef.current.addEventListener('pointerdown', stopPropagation);
      
      // Also prevent default behavior on keydown to ensure typing works
      const preventDefaultOnEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          e.preventDefault();
        }
      };
      
      inputRef.current.addEventListener('keydown', preventDefaultOnEsc);
      
      // Clean up
      return () => {
        if (inputRef.current) {
          inputRef.current.removeEventListener('click', stopPropagation);
          inputRef.current.removeEventListener('mousedown', stopPropagation);
          inputRef.current.removeEventListener('pointerdown', stopPropagation);
          inputRef.current.removeEventListener('keydown', preventDefaultOnEsc);
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
    
    // Also update the form value
    form.setValue("place", newValue, { shouldValidate: true });
    
    // Log the input change for debugging
    console.log('PlaceField input changed:', newValue);
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
          // Add these to ensure the input works properly
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
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


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
      // Add event listeners to stop propagation and prevent default
      const handleClick = (e: Event) => {
        e.stopPropagation();
        e.preventDefault();
      };
      
      const handleMouseDown = (e: Event) => {
        e.stopPropagation();
      };
      
      inputRef.current.addEventListener('click', handleClick);
      inputRef.current.addEventListener('mousedown', handleMouseDown);
      
      // Add a global handler for pac-container clicks to prevent dialog close
      const handleDocumentClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target && (
            target.classList.contains('pac-container') || 
            target.closest('.pac-container') || 
            target.classList.contains('pac-item') || 
            target.closest('.pac-item')
          )) {
          e.stopPropagation();
          e.preventDefault();
        }
      };
      
      document.addEventListener('click', handleDocumentClick, true);
      document.addEventListener('mousedown', handleDocumentClick, true);
      
      // Add inline styles to ensure proper stacking and event handling
      inputRef.current.style.position = 'relative';
      inputRef.current.style.zIndex = '9000';
      
      return () => {
        if (inputRef.current) {
          inputRef.current.removeEventListener('click', handleClick);
          inputRef.current.removeEventListener('mousedown', handleMouseDown);
        }
        document.removeEventListener('click', handleDocumentClick, true);
        document.removeEventListener('mousedown', handleDocumentClick, true);
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
    <div className="relative space-y-2 z-[9000]" style={{ position: 'relative' }}>
      <Label htmlFor="place" className={isRequired ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
        Place Name
      </Label>
      
      <div className="relative" style={{ position: 'relative', zIndex: 9000 }}>
        <Input
          id="place"
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Search for a place or venue"
          className="pr-8"
          required={isRequired}
          autoComplete="off"
          style={{ position: 'relative', zIndex: 9000 }}
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

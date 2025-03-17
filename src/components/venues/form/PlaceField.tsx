
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
      // Ensure that clicking on this input doesn't cause dialog close
      const handleEvent = (e: Event) => {
        // Always stop propagation and prevent default to isolate this input
        e.stopPropagation();
      };
      
      // Attach event listeners with capture phase (true) to ensure they run first
      inputRef.current.addEventListener('click', handleEvent, true);
      inputRef.current.addEventListener('mousedown', handleEvent, true);
      inputRef.current.addEventListener('pointerdown', handleEvent, true);
      
      // Critical: ensure the input is accessible and visible
      inputRef.current.style.position = 'relative';
      inputRef.current.style.zIndex = '9999';
      
      return () => {
        if (inputRef.current) {
          inputRef.current.removeEventListener('click', handleEvent, true);
          inputRef.current.removeEventListener('mousedown', handleEvent, true);
          inputRef.current.removeEventListener('pointerdown', handleEvent, true);
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

  // Explicitly prevent propagation but don't prevent default for input interactions
  const preventPropagation = (e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="relative space-y-2 z-[9999]" 
      style={{ position: 'relative' }}
      onClick={preventPropagation}
      onMouseDown={preventPropagation}
      onPointerDown={preventPropagation}
    >
      <Label htmlFor="place" className={isRequired ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
        Place Name
      </Label>
      
      <div 
        className="relative" 
        style={{ position: 'relative', zIndex: 9999 }}
        onClick={preventPropagation}
        onMouseDown={preventPropagation}
        onPointerDown={preventPropagation}
      >
        <Input
          id="place"
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Search for a place or venue"
          className="pr-8"
          required={isRequired}
          autoComplete="off"
          style={{ position: 'relative', zIndex: 9999 }}
          onClick={(e) => {
            e.stopPropagation();
            // Don't prevent default here as we want to focus the input
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
          }}
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

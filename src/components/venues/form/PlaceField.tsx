
import { useState, useEffect, RefObject } from "react";
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
  const [isSearching, setIsSearching] = useState(false);
  
  // Watch the form's place field value and sync with local state
  const formPlaceValue = form.watch("place");
  
  // Sync input value with form value when it changes
  useEffect(() => {
    if (formPlaceValue !== undefined && formPlaceValue !== inputValue) {
      setInputValue(formPlaceValue);
      console.log('PlaceField synced with form value:', formPlaceValue);
    }
  }, [formPlaceValue]);

  // When external value changes, update the input value
  useEffect(() => {
    if (value !== undefined) {
      setInputValue(value);
    }
  }, [value]);

  // Listen for manual input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsSearching(newValue.length > 2); // Show searching state when typing
    
    if (onChange) {
      onChange(newValue);
    }
    
    // Also update the form value
    form.setValue("place", newValue, { shouldValidate: true });
    
    // Log the input change for debugging
    console.log('PlaceField input changed:', newValue);
  };

  // Handle focus to show that Google Places is ready
  const handleInputFocus = () => {
    console.log('PlaceField focused - Google Places autocomplete should be active');
    if (window.google?.maps?.places) {
      console.log('Google Places API is ready');
    } else {
      console.log('Google Places API not yet loaded');
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
          onFocus={handleInputFocus}
          placeholder="Search for a place or venue"
          className="pr-8 z-[1]"
          required={isRequired}
          autoComplete="off"
          // Prevent event bubbling that might close the dialog
          onClick={(e) => {
            e.stopPropagation();
            console.log('PlaceField clicked - should not close dialog');
          }}
          onKeyDown={(e) => {
            // Log key events for debugging
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
              console.log('Arrow key pressed - navigating Google Places suggestions');
            }
          }}
        />
        
        {/* Loading indicator */}
        <div className="absolute inset-y-0 right-2 flex items-center">
          <LoadingIndicator isLoading={isSearching && !scriptError} />
        </div>
      </div>

      {/* Helper text */}
      {!scriptError && (
        <p className="text-xs text-muted-foreground">
          Start typing to search for places with Google Places
        </p>
      )}

      {/* Error message */}
      {scriptError && <GoogleMapsError scriptError={scriptError} />}
    </div>
  );
}

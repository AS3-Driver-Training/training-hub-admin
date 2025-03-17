
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Search } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { VenueFormValues } from "./VenueFormSchema";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RefObject, useEffect, useRef } from "react";

interface PlaceFieldProps {
  form: UseFormReturn<VenueFormValues>;
  inputRef: RefObject<HTMLInputElement>;
  scriptError: string | null;
  resetAutocomplete: () => void;
}

export function PlaceField({ form, inputRef, scriptError, resetAutocomplete }: PlaceFieldProps) {
  // Create a local ref to connect react-hook-form with Google Maps
  const localInputRef = useRef<HTMLInputElement>(null);
  
  // Synchronize the local ref with the Google Maps ref
  useEffect(() => {
    if (localInputRef.current && inputRef) {
      // Update the Google Maps ref to point to this input
      // @ts-ignore - We need to set the current property
      inputRef.current = localInputRef.current;
    }
  }, [inputRef]);

  return (
    <FormField
      control={form.control}
      name="place"
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center justify-between">
            <FormLabel>Place</FormLabel>
            {!scriptError && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 px-2 text-muted-foreground"
                      onClick={() => resetAutocomplete()}
                    >
                      <Search className="h-4 w-4 mr-1" />
                      <span className="text-xs">Start typing to search</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">
                      Type to search for a venue by name or address.
                      Select a result to automatically fill in location details.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <FormControl>
            <div className="relative">
              <Input 
                placeholder={scriptError ? "Enter place name manually" : "Search for a venue or place"} 
                {...field}
                ref={(e) => {
                  // Connect to react-hook-form
                  field.ref(e);
                  // Connect to our local ref
                  localInputRef.current = e;
                }}
                autoComplete="off" // Prevent browser autocomplete from interfering
              />
              <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </FormControl>
          <FormMessage />
          {!scriptError && (
            <p className="text-xs text-muted-foreground">
              Type to search for a place name, venue, or landmark
            </p>
          )}
        </FormItem>
      )}
    />
  );
}

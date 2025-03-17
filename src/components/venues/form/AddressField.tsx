
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { VenueFormValues } from "./VenueFormSchema";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RefObject } from "react";

interface AddressFieldProps {
  form: UseFormReturn<VenueFormValues>;
  inputRef: RefObject<HTMLInputElement>;
  scriptError: string | null;
  resetAutocomplete: () => void;
}

export function AddressField({ form, inputRef, scriptError, resetAutocomplete }: AddressFieldProps) {
  return (
    <FormField
      control={form.control}
      name="address"
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center justify-between">
            <FormLabel>Address</FormLabel>
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
                      <HelpCircle className="h-4 w-4 mr-1" />
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
            <Input 
              placeholder={scriptError ? "Enter address manually" : "Search for address or place"} 
              {...field} 
              ref={(e) => {
                if (e) {
                  inputRef.current = e;
                  field.ref(e);
                }
              }}
            />
          </FormControl>
          <FormMessage />
          {!scriptError && (
            <p className="text-xs text-muted-foreground">
              Type to search for a place or enter address manually
            </p>
          )}
        </FormItem>
      )}
    />
  );
}

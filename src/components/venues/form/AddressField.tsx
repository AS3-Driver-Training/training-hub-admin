
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
  // Fixed: properly handle input ref assignment without directly modifying the read-only current property
  const handleInputRef = (element: HTMLInputElement | null) => {
    if (element) {
      // Make ref available to react-hook-form
      form.register("address").ref(element);
      
      // Make ref available to Google Maps (without directly assigning to read-only current)
      if (inputRef && typeof inputRef === 'object' && 'current' in inputRef) {
        Object.defineProperty(inputRef, 'current', {
          value: element,
          writable: true
        });
      }
    }
  };

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
                      <span className="text-xs">Auto-populated from Place</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">
                      This field is auto-populated based on the Place selection.
                      You can edit it manually if needed.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <FormControl>
            <Input 
              placeholder={scriptError ? "Enter address manually" : "Address will be auto-populated"} 
              {...field} 
              ref={handleInputRef}
              className="bg-slate-50"
              readOnly={!scriptError}
            />
          </FormControl>
          <FormMessage />
          {!scriptError && (
            <p className="text-xs text-muted-foreground">
              This field is filled automatically from your Place selection
            </p>
          )}
        </FormItem>
      )}
    />
  );
}

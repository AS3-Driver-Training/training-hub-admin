
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
        <FormItem className="z-40">
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
              className="bg-slate-50"
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

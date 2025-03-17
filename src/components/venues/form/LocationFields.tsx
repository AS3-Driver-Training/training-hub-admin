
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { VenueFormValues } from "./VenueFormSchema";

interface LocationFieldsProps {
  form: UseFormReturn<VenueFormValues>;
}

export function LocationFields({ form }: LocationFieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="googleLocation"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Google Location</FormLabel>
            <FormControl>
              <Input placeholder="Latitude, Longitude" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="region"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Region</FormLabel>
            <FormControl>
              <Input placeholder="Region" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

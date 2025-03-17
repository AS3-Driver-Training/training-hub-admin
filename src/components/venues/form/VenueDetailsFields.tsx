
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { VenueFormValues } from "./VenueFormSchema";

interface VenueDetailsFieldsProps {
  form: UseFormReturn<VenueFormValues>;
}

export function VenueDetailsFields({ form }: VenueDetailsFieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input placeholder="Venue name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="shortName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Short Name</FormLabel>
            <FormControl>
              <Input placeholder="Short name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

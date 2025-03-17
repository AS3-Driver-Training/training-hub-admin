
import { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useGooglePlaces } from "@/hooks/useGooglePlaces";

const venueSchema = z.object({
  name: z.string().min(1, "Name is required"),
  shortName: z.string().min(1, "Short name is required"),
  address: z.string().min(1, "Address is required"),
  googleLocation: z.string(),
  region: z.string().min(1, "Region is required"),
});

export type VenueFormValues = z.infer<typeof venueSchema>;

interface VenueFormProps {
  defaultValues: VenueFormValues;
  onSubmit: (data: VenueFormValues) => Promise<void>;
  isSubmitting: boolean;
  isEditing: boolean;
}

export function VenueForm({ defaultValues, onSubmit, isSubmitting, isEditing }: VenueFormProps) {
  const form = useForm<VenueFormValues>({
    resolver: zodResolver(venueSchema),
    defaultValues,
  });

  const { inputRef, isLoadingScript, scriptError } = useGooglePlaces({
    onPlaceSelect: (placeData) => {
      form.setValue("address", placeData.address);
      form.setValue("googleLocation", placeData.googleLocation);
      
      if (placeData.region) {
        form.setValue("region", placeData.region);
      }
      
      // If venue name is not set and we have a place name, suggest it
      if (!form.getValues("name") && placeData.placeName) {
        form.setValue("name", placeData.placeName);
      }

      // Generate a short name if none exists (use first part of name or address)
      const suggestedShortName = form.getValues("shortName") || 
        placeData.placeName.split(" ")[0] || 
        placeData.address.split(",")[0] || 
        "";
        
      if (!form.getValues("shortName") && suggestedShortName) {
        form.setValue("shortName", suggestedShortName);
      }
    }
  });

  // Update form values when defaultValues change (e.g., when editing a venue)
  useEffect(() => {
    if (defaultValues) {
      Object.entries(defaultValues).forEach(([key, value]) => {
        form.setValue(key as keyof VenueFormValues, value);
      });
    }
  }, [defaultValues, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {scriptError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Google Maps Error</AlertTitle>
            <AlertDescription>{scriptError}</AlertDescription>
          </Alert>
        )}
        
        {isLoadingScript && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Loading Google Maps...</span>
          </div>
        )}

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
        
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input 
                  placeholder={scriptError ? "Enter address manually" : "Search for address or place"} 
                  {...field} 
                  ref={(e) => {
                    inputRef.current = e;
                    if (e) field.ref(e);
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
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEditing ? "Update Venue" : "Create Venue"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

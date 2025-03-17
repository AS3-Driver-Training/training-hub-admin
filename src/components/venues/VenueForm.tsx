
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { useGooglePlaces } from "@/hooks/useGooglePlaces";
import { venueSchema, VenueFormValues } from "./form/VenueFormSchema";
import { VenueDetailsFields } from "./form/VenueDetailsFields";
import { AddressField } from "./form/AddressField";
import { LocationFields } from "./form/LocationFields";
import { GoogleMapsError } from "./form/GoogleMapsError";
import { LoadingIndicator } from "./form/LoadingIndicator";
import { SubmitButton } from "./form/SubmitButton";

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

  const { inputRef, isLoadingScript, scriptError, resetAutocomplete } = useGooglePlaces({
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
        <GoogleMapsError scriptError={scriptError} />
        <LoadingIndicator isLoading={isLoadingScript} />
        
        <VenueDetailsFields form={form} />
        <AddressField 
          form={form} 
          inputRef={inputRef} 
          scriptError={scriptError} 
          resetAutocomplete={resetAutocomplete} 
        />
        <LocationFields form={form} />
        
        <SubmitButton isSubmitting={isSubmitting} isEditing={isEditing} />
      </form>
    </Form>
  );
}

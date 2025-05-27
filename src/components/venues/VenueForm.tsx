
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { useGooglePlaces } from "@/hooks/useGooglePlaces";
import { venueSchema, VenueFormValues } from "./form/VenueFormSchema";
import { VenueDetailsFields } from "./form/VenueDetailsFields";
import { AddressField } from "./form/AddressField";
import { PlaceField } from "./form/PlaceField";
import { LocationFields } from "./form/LocationFields";
import { GoogleMapsError } from "./form/GoogleMapsError";
import { LoadingIndicator } from "./form/LoadingIndicator";
import { SubmitButton } from "./form/SubmitButton";
import { CheckCircle } from "lucide-react";

interface VenueFormProps {
  defaultValues: VenueFormValues;
  onSubmit: (data: VenueFormValues) => Promise<void>;
  isSubmitting: boolean;
  isEditing: boolean;
}

export function VenueForm({ defaultValues, onSubmit, isSubmitting, isEditing }: VenueFormProps) {
  const [placeSelected, setPlaceSelected] = useState(false);
  const [isProcessingPlace, setIsProcessingPlace] = useState(false);

  const form = useForm<VenueFormValues>({
    resolver: zodResolver(venueSchema),
    defaultValues: {
      ...defaultValues,
      place: defaultValues.name || '', // Initialize place with name if editing
    },
  });

  const { inputRef, isLoadingScript, scriptError, resetAutocomplete } = useGooglePlaces({
    onPlaceSelect: async (placeData) => {
      console.log("Place selected in VenueForm:", placeData);
      setIsProcessingPlace(true);
      
      try {
        // Set the place field (main search field)
        form.setValue("place", placeData.place);
        
        // Set address
        form.setValue("address", placeData.address);
        
        // Set location coordinates
        form.setValue("googleLocation", placeData.googleLocation);
        
        // Set region if available
        if (placeData.region) {
          form.setValue("region", placeData.region);
        }
        
        // Set country if available
        if (placeData.country) {
          form.setValue("country", placeData.country);
        }

        // Set name field with place name if not already set
        if (!form.getValues("name") && placeData.placeName) {
          form.setValue("name", placeData.placeName);
        }

        // Generate a short name if none exists
        if (!form.getValues("shortName")) {
          const suggestedShortName = 
            placeData.placeName.split(" ")[0] || 
            placeData.address.split(",")[0] || 
            "";
            
          if (suggestedShortName) {
            form.setValue("shortName", suggestedShortName);
          }
        }
        
        // Trigger validation after setting values
        await form.trigger();
        
        // Show success feedback
        setPlaceSelected(true);
        setTimeout(() => setPlaceSelected(false), 3000);
        
        console.log("Place data processed successfully, form is ready");
      } catch (error) {
        console.error("Error processing place data:", error);
      } finally {
        setIsProcessingPlace(false);
      }
    }
  });

  // Update form values when defaultValues change (e.g., when editing a venue)
  useEffect(() => {
    if (defaultValues) {
      Object.entries(defaultValues).forEach(([key, value]) => {
        if (value) {
          form.setValue(key as keyof VenueFormValues, value);
        }
      });
      
      // Set place field to name when editing
      if (isEditing && defaultValues.name) {
        form.setValue("place", defaultValues.name);
      }
    }
  }, [defaultValues, form, isEditing]);

  const handleSubmitForm = async (data: VenueFormValues) => {
    console.log("Submitting form with data:", data);
    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmitForm)} className="space-y-4">
        <GoogleMapsError scriptError={scriptError} />
        <LoadingIndicator isLoading={isLoadingScript} />
        
        <div className="relative">
          <PlaceField 
            form={form} 
            inputRef={inputRef} 
            scriptError={scriptError} 
            resetAutocomplete={resetAutocomplete}
          />
          
          {/* Success indicator when place is selected */}
          {placeSelected && (
            <div className="absolute top-2 right-2 flex items-center text-green-600 bg-green-50 px-2 py-1 rounded-md text-sm">
              <CheckCircle className="h-4 w-4 mr-1" />
              Place selected!
            </div>
          )}
          
          {/* Processing indicator */}
          {isProcessingPlace && (
            <div className="absolute top-2 right-2 flex items-center text-blue-600 bg-blue-50 px-2 py-1 rounded-md text-sm">
              <LoadingIndicator isLoading={true} />
              <span className="ml-1">Processing...</span>
            </div>
          )}
        </div>

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

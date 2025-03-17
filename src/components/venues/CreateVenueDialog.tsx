
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Venue } from "@/types/venues";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

// This should be loaded from environment variables in a real app
const GOOGLE_MAPS_API_KEY = 'AIzaSyCu7aCPjM539cGuK3ng2TXDvYcVkLJ1Pi4';

// Add Google Maps type definitions for TypeScript
declare global {
  interface Window {
    google: {
      maps: {
        places: {
          Autocomplete: new (
            input: HTMLInputElement,
            options?: google.maps.places.AutocompleteOptions
          ) => google.maps.places.Autocomplete;
        };
        Map: any;
      };
    };
    initGoogleMapsCallback: () => void;
  }
}

const venueSchema = z.object({
  name: z.string().min(1, "Name is required"),
  shortName: z.string().min(1, "Short name is required"),
  address: z.string().min(1, "Address is required"),
  googleLocation: z.string(),
  region: z.string().min(1, "Region is required"),
});

type VenueFormValues = z.infer<typeof venueSchema>;

interface CreateVenueDialogProps {
  open: boolean;
  onClose: (success?: boolean) => void;
  venue?: Venue | null;
}

export function CreateVenueDialog({ open, onClose, venue }: CreateVenueDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingScript, setIsLoadingScript] = useState(false);
  const [scriptError, setScriptError] = useState<string | null>(null);
  const { toast } = useToast();
  const isEditing = !!venue;
  const autoCompleteRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<VenueFormValues>({
    resolver: zodResolver(venueSchema),
    defaultValues: venue || {
      name: "",
      shortName: "",
      address: "",
      googleLocation: "",
      region: "",
    },
  });

  // Load Google Maps JavaScript API with Places library
  useEffect(() => {
    if (!open) return;

    // Define callback for when Google Maps script loads
    window.initGoogleMapsCallback = () => {
      console.log("Google Maps API loaded successfully");
      setIsLoadingScript(false);
      initializeAutocomplete();
    };

    // Check if Google Maps script is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      console.log("Google Maps API already loaded");
      initializeAutocomplete();
      return;
    }

    console.log("Loading Google Maps API script...");
    setIsLoadingScript(true);
    
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGoogleMapsCallback`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      console.error("Google Maps script failed to load");
      setIsLoadingScript(false);
      setScriptError("Failed to load Google Maps. You can still enter address manually.");
    };

    document.head.appendChild(script);

    return () => {
      // Clean up script if dialog is closed before script loads
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
      // Clean up global callback
      if (window.initGoogleMapsCallback) {
        delete window.initGoogleMapsCallback;
      }
    };
  }, [open]);

  const initializeAutocomplete = () => {
    if (!inputRef.current || !window.google || !window.google.maps || !window.google.maps.places) {
      console.warn("Cannot initialize Google Places Autocomplete - dependencies not loaded");
      return;
    }

    console.log("Initializing Google Places Autocomplete");
    try {
      // Initialize Google Places Autocomplete
      autoCompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        fields: ["address_components", "formatted_address", "geometry", "name"],
        types: ["establishment", "geocode"],
      });

      // Add listener for place selection
      autoCompleteRef.current.addListener("place_changed", () => {
        const place = autoCompleteRef.current.getPlace();
        console.log("Selected place:", place);
        
        if (!place || !place.geometry) {
          console.warn("No place details available");
          return;
        }

        // Extract address components
        let region = "";
        let formattedAddress = place.formatted_address || "";
        
        // Attempt to extract region (administrative_area_level_1)
        if (place.address_components) {
          for (const component of place.address_components) {
            if (component.types.includes("administrative_area_level_1")) {
              region = component.long_name;
              break;
            }
          }
        }

        // Format latitude and longitude
        const lat = place.geometry.location?.lat();
        const lng = place.geometry.location?.lng();
        const googleLocation = lat && lng ? `${lat},${lng}` : "";

        // Generate a short name if none exists (use first part of name or address)
        const placeName = place.name || "";
        const suggestedShortName = form.getValues("shortName") || 
          placeName.split(" ")[0] || 
          formattedAddress.split(",")[0] || 
          "";

        // Update form fields
        form.setValue("address", formattedAddress);
        form.setValue("googleLocation", googleLocation);
        
        if (region) {
          form.setValue("region", region);
        }
        
        if (!form.getValues("shortName") && suggestedShortName) {
          form.setValue("shortName", suggestedShortName);
        }

        // If venue name is not set and we have a place name, suggest it
        if (!form.getValues("name") && placeName) {
          form.setValue("name", placeName);
        }
      });
      
      console.log("Google Places Autocomplete initialized successfully");
    } catch (error) {
      console.error("Error initializing Google Places Autocomplete:", error);
      setScriptError("Error initializing Google Places. You can still enter address manually.");
    }
  };

  const onSubmit = async (data: VenueFormValues) => {
    setIsSubmitting(true);
    try {
      const venueData = {
        name: data.name,
        short_name: data.shortName,
        address: data.address,
        google_location: data.googleLocation,
        region: data.region,
      };
      
      let result;
      
      if (isEditing && venue) {
        result = await supabase
          .from('venues')
          .update(venueData)
          .eq('id', parseInt(venue.id))
          .select();
      } else {
        result = await supabase
          .from('venues')
          .insert(venueData)
          .select();
      }
      
      if (result.error) throw result.error;
      
      toast({
        title: isEditing ? "Venue updated" : "Venue created",
        description: isEditing 
          ? "The venue has been successfully updated." 
          : "The venue has been successfully created.",
      });
      
      onClose(true);
    } catch (error) {
      console.error("Error saving venue:", error);
      toast({
        title: "Error",
        description: "There was an error saving the venue. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Venue" : "Create New Venue"}</DialogTitle>
          <DialogDescription>
            Search for a venue or enter details manually.
          </DialogDescription>
        </DialogHeader>
        
        {scriptError && (
          <Alert className="mb-4">
            <AlertDescription>{scriptError}</AlertDescription>
          </Alert>
        )}
        
        {isLoadingScript && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Loading Google Maps...</span>
          </div>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      placeholder="Search for address or place" 
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
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onClose()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : isEditing ? "Update Venue" : "Create Venue"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

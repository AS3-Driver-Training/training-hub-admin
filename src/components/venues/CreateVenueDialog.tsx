
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Venue } from "@/types/venues";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { VenueForm } from "@/components/venues/VenueForm";
import { VenueFormValues } from "@/components/venues/form/VenueFormSchema";

interface CreateVenueDialogProps {
  open: boolean;
  onClose: (success?: boolean) => void;
  venue?: Venue | null;
}

export function CreateVenueDialog({ open, onClose, venue }: CreateVenueDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const isEditing = !!venue;
  
  // Match property names with Venue type fields (snake_case)
  const defaultValues: VenueFormValues = venue ? {
    place: venue.name || "",
    name: venue.name || "",
    shortName: venue.short_name || "",
    address: venue.address || "",
    googleLocation: venue.google_location || "",
    region: venue.region || "",
    country: ""
  } : {
    place: "",
    name: "",
    shortName: "",
    address: "",
    googleLocation: "",
    region: "",
    country: ""
  };

  const handleSubmit = async (data: VenueFormValues) => {
    setIsSubmitting(true);
    try {
      // Convert to snake_case for database
      const venueData = {
        name: data.name || data.place, // Fallback to place if name is empty
        short_name: data.shortName,
        address: data.address,
        google_location: data.googleLocation,
        region: data.region
        // We don't save country in the current DB schema
      };
      
      let result;
      
      if (isEditing && venue) {
        result = await supabase
          .from('venues')
          .update(venueData)
          .eq('id', Number(venue.id))
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
        
        <VenueForm 
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          isEditing={isEditing}
        />
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onClose()}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

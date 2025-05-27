
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
  
  // Simplified dialog close handler
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };
  
  const defaultValues: VenueFormValues = venue ? {
    place: venue.name || "",
    name: venue.name || "",
    shortName: venue.short_name || "",
    address: venue.address || "",
    googleLocation: venue.google_location || "",
    region: venue.region || "",
    country: venue.country || "US"
  } : {
    place: "",
    name: "",
    shortName: "",
    address: "",
    googleLocation: "",
    region: "",
    country: "US"
  };

  const handleSubmit = async (data: VenueFormValues) => {
    setIsSubmitting(true);
    console.log("Submitting venue data:", data);
    
    try {
      const venueData = {
        name: data.name || data.place,
        short_name: data.shortName,
        address: data.address,
        google_location: data.googleLocation,
        region: data.region,
        country: data.country
      };
      
      let result;
      
      if (isEditing && venue) {
        const venueId = typeof venue.id === 'string' ? parseInt(venue.id, 10) : venue.id;
        result = await supabase
          .from('venues')
          .update(venueData)
          .eq('id', venueId)
          .select();
      } else {
        result = await supabase
          .from('venues')
          .insert(venueData)
          .select();
      }
      
      if (result.error) {
        throw result.error;
      }
      
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
    <Dialog 
      open={open} 
      onOpenChange={handleOpenChange}
      modal={true}
    >
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Venue" : "Create New Venue"}</DialogTitle>
          <DialogDescription>
            Search for a venue or enter details manually.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto py-4">
          <VenueForm 
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            isEditing={isEditing}
          />
        </div>
        
        <DialogFooter className="flex-shrink-0 border-t pt-4">
          <Button type="button" variant="outline" onClick={() => onClose()}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            form="venue-form"
          >
            {isSubmitting ? "Saving..." : isEditing ? "Update Venue" : "Create Venue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { useState, useEffect, useCallback } from "react";
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
  const [isSelectingPlace, setIsSelectingPlace] = useState(false);
  const { toast } = useToast();
  const isEditing = !!venue;
  
  // Consolidated event handler for preventing dialog close
  const preventDialogClose = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    
    // More specific targeting of Google Places elements
    if (
      target.closest('.pac-container') || 
      target.closest('.pac-item') ||
      target.classList.contains('pac-item') ||
      target.classList.contains('pac-item-query') ||
      target.classList.contains('pac-icon') ||
      target.closest('.pac-icon')
    ) {
      // Critical: stop event propagation completely
      e.stopPropagation();
      e.preventDefault();
      
      console.log('Google Places element interaction intercepted');
      setIsSelectingPlace(true);
      
      // Keep the flag active longer to ensure dialog doesn't close
      setTimeout(() => setIsSelectingPlace(false), 500);
    }
  }, []);
  
  // Use capture phase to ensure this runs before Dialog handlers
  useEffect(() => {
    if (open) {
      document.addEventListener('mousedown', preventDialogClose, true);
      document.addEventListener('click', preventDialogClose, true);
      
      return () => {
        document.removeEventListener('mousedown', preventDialogClose, true);
        document.removeEventListener('click', preventDialogClose, true);
      };
    }
  }, [open, preventDialogClose]);
  
  // Enhanced handler to block all automatic closing behavior
  const handleOpenChange = (open: boolean) => {
    // Prevent auto-closing completely when selecting a place
    if (!open) {
      if (isSelectingPlace) {
        console.log('Preventing dialog close during place selection');
        return; // Don't close the dialog
      }
      // Otherwise, proceed with closing
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
    console.log("Submitting venue data:", data);
    
    try {
      const venueData = {
        name: data.name || data.place,
        short_name: data.shortName,
        address: data.address,
        google_location: data.googleLocation,
        region: data.region
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

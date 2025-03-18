
import { useState, useEffect } from "react";
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
  
  // Track Google Places element interactions
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest('.pac-container') || 
        target.closest('.pac-item') ||
        target.classList.contains('pac-item') ||
        target.classList.contains('pac-item-query')
      ) {
        setIsSelectingPlace(true);
        // Reset after a short delay
        setTimeout(() => setIsSelectingPlace(false), 300);
      }
    };
    
    document.addEventListener('mousedown', handleMouseDown, true);
    return () => document.removeEventListener('mousedown', handleMouseDown, true);
  }, []);
  
  // Create a handler function instead of passing onClose directly
  const handleOpenChange = (open: boolean) => {
    // Only close if not selecting a place
    if (!open && !isSelectingPlace) {
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
      modal={false}
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

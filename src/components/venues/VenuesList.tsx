
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VenuesTable } from "@/components/venues/VenuesTable";
import { CreateVenueDialog } from "@/components/venues/CreateVenueDialog";
import { Venue } from "@/types/venues";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Function to fetch venues from Supabase
const fetchVenues = async (): Promise<Venue[]> => {
  const { data, error } = await supabase
    .from('venues')
    .select('*');
  
  if (error) {
    console.error("Error fetching venues:", error);
    throw new Error("Failed to fetch venues");
  }
  
  // The data from Supabase already has snake_case property names that match our Venue type
  return (data || []).map(venue => ({
    id: venue.id.toString(),
    name: venue.name,
    short_name: venue.short_name || "",
    address: venue.address || "",
    google_location: venue.google_location || "",
    region: venue.region || "",
  }));
};

export function VenuesList() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [venueToEdit, setVenueToEdit] = useState<Venue | null>(null);
  const { toast } = useToast();

  const { data: venues, isLoading, refetch } = useQuery({
    queryKey: ["venues"],
    queryFn: fetchVenues,
  });

  const handleCreateVenue = () => {
    setIsCreateDialogOpen(true);
    setVenueToEdit(null);
  };

  const handleEditVenue = (venue: Venue) => {
    setVenueToEdit(venue);
    setIsCreateDialogOpen(true);
  };

  const handleDeleteVenue = async (venueId: string) => {
    try {
      const { error } = await supabase
        .from('venues')
        .delete()
        .eq('id', parseInt(venueId));
      
      if (error) throw error;
      
      toast({
        title: "Venue deleted",
        description: "The venue has been successfully deleted.",
      });
      
      refetch();
    } catch (error) {
      console.error("Error deleting venue:", error);
      toast({
        title: "Error",
        description: "Failed to delete venue. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDialogClose = (success?: boolean) => {
    setIsCreateDialogOpen(false);
    setVenueToEdit(null);
    if (success) {
      refetch();
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Venues Management</h1>
        <Button onClick={handleCreateVenue}>
          <Plus className="mr-2 h-4 w-4" />
          Create Venue
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Venues</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading venues...</p>
          ) : (
            <VenuesTable 
              venues={venues || []} 
              onEdit={handleEditVenue}
              onDelete={handleDeleteVenue}
            />
          )}
        </CardContent>
      </Card>

      <CreateVenueDialog
        open={isCreateDialogOpen}
        onClose={handleDialogClose}
        venue={venueToEdit}
      />
    </div>
  );
}


import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VenuesTable } from "@/components/venues/VenuesTable";
import { CreateVenueDialog } from "@/components/venues/CreateVenueDialog";
import { Venue } from "@/types/venues";
import { useToast } from "@/hooks/use-toast";

// Mock API call to get venues
const fetchVenues = async (): Promise<Venue[]> => {
  // In a real app, this would be an API call
  return [
    {
      id: "1",
      name: "Downtown Conference Center",
      shortName: "DCC",
      address: "123 Main St, San Francisco, CA 94105",
      googleLocation: "37.7749,-122.4194",
      region: "West",
    },
    {
      id: "2",
      name: "Midtown Training Facility",
      shortName: "MTF",
      address: "456 Park Ave, New York, NY 10022",
      googleLocation: "40.7128,-74.0060",
      region: "East",
    },
    {
      id: "3",
      name: "South Campus Learning Center",
      shortName: "SCLC",
      address: "789 Peachtree St, Atlanta, GA 30308",
      googleLocation: "33.7490,-84.3880",
      region: "South",
    },
  ];
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

  const handleDeleteVenue = (venueId: string) => {
    // In a real app, this would call an API
    toast({
      title: "Venue deleted",
      description: "The venue has been successfully deleted.",
    });
    refetch();
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

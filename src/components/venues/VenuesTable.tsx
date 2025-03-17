
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { Venue } from "@/types/venues";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface VenuesTableProps {
  venues: Venue[];
  onEdit: (venue: Venue) => void;
  onDelete: (venueId: string) => void;
}

export function VenuesTable({ venues, onEdit, onDelete }: VenuesTableProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [venueToDelete, setVenueToDelete] = useState<Venue | null>(null);

  const handleDeleteClick = (venue: Venue) => {
    setVenueToDelete(venue);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (venueToDelete) {
      onDelete(venueToDelete.id);
      setIsDeleteDialogOpen(false);
      setVenueToDelete(null);
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Short Name</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Region</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {venues.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6">
                No venues found. Create your first venue to get started.
              </TableCell>
            </TableRow>
          ) : (
            venues.map((venue) => (
              <TableRow key={venue.id}>
                <TableCell className="font-medium">{venue.name}</TableCell>
                <TableCell>{venue.short_name}</TableCell>
                <TableCell>{venue.address}</TableCell>
                <TableCell>{venue.region}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(venue)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(venue)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the venue{" "}
              <strong>{venueToDelete?.name}</strong>. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

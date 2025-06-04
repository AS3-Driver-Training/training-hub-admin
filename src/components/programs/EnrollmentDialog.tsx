
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { Program } from "@/types/programs";
import { format } from "date-fns";
import { Calendar, MapPin, Users } from "lucide-react";

interface CourseInstance {
  id: string;
  start_date: string;
  end_date: string;
  venue_name: string;
  available_seats: number;
  total_seats: number;
}

interface EnrollmentDialogProps {
  open: boolean;
  onClose: () => void;
  program: Program | null;
  instance: CourseInstance | null;
}

export function EnrollmentDialog({ open, onClose, program, instance }: EnrollmentDialogProps) {
  const [seatsRequested, setSeatsRequested] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { profile } = useProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!program || !instance || !seatsRequested) return;

    const seats = parseInt(seatsRequested);
    if (seats <= 0 || seats > instance.available_seats) {
      toast({
        title: "Invalid Seat Count",
        description: `Please request between 1 and ${instance.available_seats} seats.`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Here you would typically create a seat allocation request
      // For now, we'll just show a success toast
      console.log('Seat allocation request:', {
        programId: program.id,
        programName: program.name,
        instanceId: instance.id,
        seatsRequested: seats,
        notes,
        userProfile: profile,
      });

      toast({
        title: "Seat Request Submitted",
        description: `Your request for ${seats} seat${seats !== 1 ? 's' : ''} has been submitted. You'll receive confirmation within 24 hours.`,
      });

      // Reset form
      setSeatsRequested("");
      setNotes("");
      onClose();
    } catch (error) {
      console.error("Error submitting seat request:", error);
      toast({
        title: "Error",
        description: "Failed to submit seat request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!program || !instance) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Request Seats</DialogTitle>
          <DialogDescription>
            Request seats for your organization in this training session.
          </DialogDescription>
        </DialogHeader>

        {/* Session Details */}
        <div className="bg-muted p-4 rounded-lg space-y-2">
          <h3 className="font-medium">{program.name}</h3>
          <div className="space-y-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {format(new Date(instance.start_date), 'MMM d, yyyy')}
                {instance.end_date && instance.end_date !== instance.start_date && 
                  ` - ${format(new Date(instance.end_date), 'MMM d, yyyy')}`
                }
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{instance.venue_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{instance.available_seats} seats available</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="seats">Number of Seats Requested</Label>
            <Input
              id="seats"
              type="number"
              placeholder="e.g., 5"
              value={seatsRequested}
              onChange={(e) => setSeatsRequested(e.target.value)}
              min="1"
              max={instance.available_seats}
              required
            />
            <p className="text-xs text-muted-foreground">
              Maximum: {instance.available_seats} seats available
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any special requirements or notes for this enrollment..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !seatsRequested}>
              {isSubmitting ? "Submitting..." : "Request Seats"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

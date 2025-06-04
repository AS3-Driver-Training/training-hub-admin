
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { Program } from "@/types/programs";

interface InquiryDialogProps {
  open: boolean;
  onClose: () => void;
  program: Program | null;
}

export function InquiryDialog({ open, onClose, program }: InquiryDialogProps) {
  const [message, setMessage] = useState("");
  const [expectedParticipants, setExpectedParticipants] = useState("");
  const [timeframe, setTimeframe] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { profile } = useProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!program || !message.trim()) return;

    setIsSubmitting(true);
    
    try {
      // Here you would typically send the inquiry to your backend
      // For now, we'll just show a success toast
      console.log('Program inquiry:', {
        programId: program.id,
        programName: program.name,
        message,
        expectedParticipants,
        timeframe,
        userProfile: profile,
      });

      toast({
        title: "Inquiry Sent",
        description: "Your inquiry has been sent to AS3. We'll get back to you within 24 hours.",
      });

      // Reset form
      setMessage("");
      setExpectedParticipants("");
      setTimeframe("");
      onClose();
    } catch (error) {
      console.error("Error sending inquiry:", error);
      toast({
        title: "Error",
        description: "Failed to send inquiry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!program) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Inquire About {program.name}</DialogTitle>
          <DialogDescription>
            Send us your questions about this training program and we'll get back to you soon.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="participants">Expected Number of Participants</Label>
            <Input
              id="participants"
              type="number"
              placeholder="e.g., 12"
              value={expectedParticipants}
              onChange={(e) => setExpectedParticipants(e.target.value)}
              min="1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeframe">Preferred Timeframe</Label>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger>
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asap">As soon as possible</SelectItem>
                <SelectItem value="1-3months">1-3 months</SelectItem>
                <SelectItem value="3-6months">3-6 months</SelectItem>
                <SelectItem value="6-12months">6-12 months</SelectItem>
                <SelectItem value="flexible">Flexible</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Tell us about your training needs, specific requirements, or any questions you have..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !message.trim()}>
              {isSubmitting ? "Sending..." : "Send Inquiry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


import { TrainingEvent } from "@/types/events";
import { Button } from "@/components/ui/button";

interface EnrollButtonProps {
  event: TrainingEvent;
}

export function EnrollButton({ event }: EnrollButtonProps) {
  // Calculate if the event is fully booked
  const isFullyBooked = event.capacity && event.enrolledCount >= event.capacity;
  
  return (
    <div className="flex items-center">
      {isFullyBooked ? (
        <span className="text-sm text-muted-foreground">Fully Booked</span>
      ) : (
        <Button variant="ghost" size="sm" className="p-0 h-auto">
          <span className="flex items-center text-sm text-primary hover:text-primary/90">
            <span className="sr-only">Enroll</span>
          </span>
        </Button>
      )}
    </div>
  );
}

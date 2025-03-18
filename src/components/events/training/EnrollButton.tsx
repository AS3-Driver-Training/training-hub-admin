
import { TrainingEvent } from "@/types/events";

interface EnrollButtonProps {
  event: TrainingEvent;
}

export function EnrollButton({ event }: EnrollButtonProps) {
  return (
    <div className="flex items-center">
      {event.enrolledCount === event.capacity ? (
        <span className="text-sm text-muted-foreground">Fully Booked</span>
      ) : (
        <span className="flex items-center text-sm text-primary cursor-pointer hover:text-primary/90 hover:underline">
          Enroll Now
        </span>
      )}
    </div>
  );
}

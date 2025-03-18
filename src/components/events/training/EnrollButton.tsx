
import { TrainingEvent } from "@/types/events";
import { Edit } from "lucide-react";

interface EnrollButtonProps {
  event: TrainingEvent;
}

export function EnrollButton({ event }: EnrollButtonProps) {
  return (
    <div className="flex items-center">
      {event.enrolledCount === event.capacity ? (
        <span className="text-sm text-muted-foreground">Fully Booked</span>
      ) : (
        <span className="flex items-center text-sm text-primary cursor-pointer hover:text-primary/90">
          <Edit className="h-4 w-4 mr-1" />
          <span className="sr-only">Edit</span>
        </span>
      )}
    </div>
  );
}


import { TrainingEvent } from "@/types/events";
import { Calendar } from "lucide-react";

interface EventCalendarViewProps {
  events: TrainingEvent[];
}

export function EventCalendarView({ events }: EventCalendarViewProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 border border-dashed rounded-lg bg-muted/20">
      <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium">Calendar View Coming Soon</h3>
      <p className="text-muted-foreground text-sm mt-2">
        We're working on a calendar view to help you visualize upcoming events.
      </p>
      <p className="text-muted-foreground text-sm mt-1">
        {events.length} event{events.length !== 1 ? 's' : ''} will be displayed here.
      </p>
    </div>
  );
}

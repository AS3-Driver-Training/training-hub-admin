
import { TrainingEvent } from "@/types/events";

interface EventCalendarViewProps {
  events: TrainingEvent[];
}

export function EventCalendarView({ events }: EventCalendarViewProps) {
  return (
    <div className="text-center py-8">
      <p className="text-muted-foreground">Calendar view coming soon</p>
    </div>
  );
}

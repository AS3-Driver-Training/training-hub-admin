
import { TrainingEvent } from "@/types/events";
import { CalendarGrid } from "./CalendarGrid";

interface EventCalendarViewProps {
  events: TrainingEvent[];
  onEventDeleted?: () => void;
}

export function EventCalendarView({ events, onEventDeleted }: EventCalendarViewProps) {
  return <CalendarGrid events={events} onEventDeleted={onEventDeleted} />;
}

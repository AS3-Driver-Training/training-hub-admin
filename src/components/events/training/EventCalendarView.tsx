
import { TrainingEvent } from "@/types/events";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EventCard } from "./EventCard";

interface EventCalendarViewProps {
  events: TrainingEvent[];
  onEventDeleted?: () => void;
}

export function EventCalendarView({ events, onEventDeleted }: EventCalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Get the dates that have events
  const eventDates = events.map(event => new Date(event.startDate));
  
  // Filter events for the selected date
  const eventsOnSelectedDate = selectedDate
    ? events.filter(event => {
        const eventDate = new Date(event.startDate);
        return (
          eventDate.getDate() === selectedDate.getDate() &&
          eventDate.getMonth() === selectedDate.getMonth() &&
          eventDate.getFullYear() === selectedDate.getFullYear()
        );
      })
    : [];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-card rounded-lg shadow p-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="rounded-md"
          components={{
            DayContent: (props) => {
              const date = props.date;
              const hasEvent = eventDates.some(
                eventDate =>
                  eventDate.getDate() === date.getDate() &&
                  eventDate.getMonth() === date.getMonth() &&
                  eventDate.getFullYear() === date.getFullYear()
              );
              
              return (
                <div className="relative">
                  <div>{props.date.getDate()}</div>
                  {hasEvent && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                  )}
                </div>
              );
            },
          }}
        />
      </div>
      
      <div className="md:col-span-2">
        <div className="bg-card rounded-lg shadow p-4 h-full">
          <h3 className="text-lg font-semibold mb-4">
            {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a date"}
          </h3>
          
          {eventsOnSelectedDate.length > 0 ? (
            <ScrollArea className="h-[calc(100%-3rem)]">
              <div className="space-y-4">
                {eventsOnSelectedDate.map(event => (
                  <EventCard key={event.id} event={event} onDelete={onEventDeleted} />
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              No events scheduled for this date
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

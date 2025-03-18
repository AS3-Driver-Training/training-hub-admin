
import { TrainingEvent } from "@/types/events";
import { EventCard } from "./EventCard";

interface EventListViewProps {
  upcomingEvents: TrainingEvent[];
  pastEvents: TrainingEvent[];
}

export function EventListView({ upcomingEvents, pastEvents }: EventListViewProps) {
  return (
    <div className="space-y-6">
      {upcomingEvents.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
          <div className="space-y-4">
            {upcomingEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}
      
      {pastEvents.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Past Events</h2>
          <div className="space-y-4">
            {pastEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}
      
      {upcomingEvents.length === 0 && pastEvents.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No training events found</p>
        </div>
      )}
    </div>
  );
}

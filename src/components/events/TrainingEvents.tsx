
import { useState } from "react";
import { TrainingEventsHeader } from "./training/TrainingEventsHeader";
import { EventSearch } from "./training/EventSearch";
import { EventListView } from "./training/EventListView";
import { EventCalendarView } from "./training/EventCalendarView";
import { MOCK_EVENTS } from "./training/mockData";

export function TrainingEvents() {
  const [view, setView] = useState<"list" | "calendar">("list");
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredEvents = MOCK_EVENTS.filter(event => 
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const currentDate = new Date();
  const upcomingEvents = filteredEvents.filter(
    event => new Date(event.startDate) > currentDate
  );
  const pastEvents = filteredEvents.filter(
    event => new Date(event.startDate) <= currentDate
  );
  
  return (
    <div className="space-y-6">
      <TrainingEventsHeader view={view} setView={setView} />
      <EventSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      
      {view === "list" ? (
        <EventListView upcomingEvents={upcomingEvents} pastEvents={pastEvents} />
      ) : (
        <EventCalendarView events={filteredEvents} />
      )}
    </div>
  );
}


import { useState } from "react";
import { TrainingEventsHeader } from "./training/TrainingEventsHeader";
import { StreamlinedEventFilters } from "./training/StreamlinedEventFilters";
import { EventListView } from "./training/EventListView";
import { EventCalendarView } from "./training/EventCalendarView";
import { TrainingEventsLoading } from "./training/TrainingEventsLoading";
import { TrainingEventsError } from "./training/TrainingEventsError";
import { useTrainingEvents } from "./training/hooks/useTrainingEvents";
import { useEventFilters } from "./training/hooks/useEventFilters";

export function TrainingEvents() {
  const [view, setView] = useState<"list" | "calendar">("list");
  const { events, isLoading, error, handleEventDeleted } = useTrainingEvents();
  
  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
    countryFilter,
    setCountryFilter,
    regionFilter,
    setRegionFilter,
    enrollmentTypeFilter,
    setEnrollmentTypeFilter,
    filteredEvents,
    upcomingEvents,
    pastEvents,
    handleClearFilters
  } = useEventFilters(events);
  
  if (isLoading) {
    return <TrainingEventsLoading />;
  }
  
  if (error) {
    return <TrainingEventsError error={error} />;
  }
  
  return (
    <div className="space-y-6">
      <TrainingEventsHeader view={view} setView={setView} />
      <StreamlinedEventFilters 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        countryFilter={countryFilter}
        setCountryFilter={setCountryFilter}
        regionFilter={regionFilter}
        setRegionFilter={setRegionFilter}
        enrollmentTypeFilter={enrollmentTypeFilter}
        setEnrollmentTypeFilter={setEnrollmentTypeFilter}
        onClearFilters={handleClearFilters}
        events={events}
      />
      
      {view === "list" ? (
        <EventListView 
          upcomingEvents={upcomingEvents} 
          pastEvents={pastEvents} 
          onEventDeleted={handleEventDeleted}
        />
      ) : (
        <EventCalendarView 
          events={filteredEvents} 
          onEventDeleted={handleEventDeleted}
        />
      )}
    </div>
  );
}

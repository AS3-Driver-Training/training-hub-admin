
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrainingEventsHeader } from "./training/TrainingEventsHeader";
import { EventSearch } from "./training/EventSearch";
import { EventListView } from "./training/EventListView";
import { EventCalendarView } from "./training/EventCalendarView";
import { supabase } from "@/integrations/supabase/client";
import { TrainingEvent } from "@/types/events";
import { format } from "date-fns";

export function TrainingEvents() {
  const [view, setView] = useState<"list" | "calendar">("list");
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ['training-events'],
    queryFn: async () => {
      console.log("Fetching course instances...");
      const { data, error } = await supabase
        .from('course_instances')
        .select(`
          id,
          start_date,
          end_date,
          is_open_enrollment,
          private_seats_allocated,
          programs:program_id(name),
          venues:venue_id(name)
        `)
        .order('start_date', { ascending: true });
      
      if (error) {
        console.error("Error fetching course instances:", error);
        throw error;
      }
      
      console.log("Received course instances:", data);
      
      // Transform database data into TrainingEvent format
      const trainingEvents: TrainingEvent[] = data.map(instance => {
        // Calculate enrolled count based on allocated seats
        // For now we're setting it to a random number between 0 and capacity for demonstration
        const capacity = instance.private_seats_allocated || 20; // Default capacity if not set
        const enrolledCount = Math.floor(Math.random() * capacity); // Random enrollment for demo
        
        // Ensure end_date is set, default to start_date + 1 day if null
        const startDate = new Date(instance.start_date);
        let endDate = instance.end_date ? new Date(instance.end_date) : new Date(startDate);
        if (!instance.end_date) {
          endDate.setDate(startDate.getDate() + 1); // Default to next day if no end date
        }
        
        return {
          id: instance.id.toString(),
          title: instance.programs?.name || "Unnamed Course",
          location: instance.venues?.name || "Unknown Location",
          startDate: instance.start_date,
          endDate: endDate.toISOString(),
          status: new Date(instance.start_date) > new Date() ? 'scheduled' : 'completed',
          capacity: capacity,
          enrolledCount: enrolledCount
        };
      });
      
      console.log("Transformed events:", trainingEvents);
      return trainingEvents;
    }
  });
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4 my-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading events</h3>
            <div className="text-sm text-red-700 mt-2">
              {error instanceof Error ? error.message : "An unknown error occurred"}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  const filteredEvents = events.filter(event => 
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

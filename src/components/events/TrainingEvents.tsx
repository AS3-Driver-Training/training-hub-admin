import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { TrainingEventsHeader } from "./training/TrainingEventsHeader";
import { StreamlinedEventFilters } from "./training/StreamlinedEventFilters";
import { EventListView } from "./training/EventListView";
import { EventCalendarView } from "./training/EventCalendarView";
import { supabase } from "@/integrations/supabase/client";
import { TrainingEvent } from "@/types/events";
import { queryKeys } from "@/lib/queryKeys";
import { 
  isEventInDateRange, 
  getDateRangeFromFilter, 
  matchesArrayFilter, 
  matchesEnrollmentType, 
  getCountryFromLocation 
} from "@/utils/dateFilters";

export function TrainingEvents() {
  const [view, setView] = useState<"list" | "calendar">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState<string[]>([]);
  const [regionFilter, setRegionFilter] = useState<string[]>([]);
  const [enrollmentTypeFilter, setEnrollmentTypeFilter] = useState<string[]>([]);
  const queryClient = useQueryClient();
  
  const { data: events = [], isLoading, error } = useQuery({
    queryKey: queryKeys.trainingEvents(),
    queryFn: async () => {
      console.log("Fetching course instances...");
      
      // First, fetch all course allocations to calculate enrolled students
      const { data: allocations, error: allocationsError } = await supabase
        .from('course_allocations')
        .select('course_instance_id, seats_allocated');
      
      if (allocationsError) {
        console.error("Error fetching course allocations:", allocationsError);
        throw allocationsError;
      }
      
      // Group allocations by course instance ID and sum up allocated seats
      const enrollmentByInstance = allocations?.reduce((acc, allocation) => {
        const instanceId = allocation.course_instance_id;
        acc[instanceId] = (acc[instanceId] || 0) + allocation.seats_allocated;
        return acc;
      }, {});
      
      console.log("Enrollment by instance:", enrollmentByInstance);
      
      // Then fetch the course instances with related data including client information
      // Fixed: Use host_client_id instead of client_id for the clients relationship
      const { data, error } = await supabase
        .from('course_instances')
        .select(`
          id,
          start_date,
          end_date,
          is_open_enrollment,
          private_seats_allocated,
          programs:program_id(name, max_students),
          venues:venue_id(name, address, region),
          clients:host_client_id(name)
        `)
        .order('start_date', { ascending: true });
      
      if (error) {
        console.error("Error fetching course instances:", error);
        throw error;
      }
      
      console.log("Received course instances:", data);
      
      // Transform database data into TrainingEvent format
      const trainingEvents: TrainingEvent[] = data.map(instance => {
        // Get the enrollment count from our calculated map
        const enrolledCount = enrollmentByInstance[instance.id] || 0;
        
        // Get capacity from program max_students or instance private_seats_allocated
        const capacity = instance.private_seats_allocated || 
                         (instance.programs?.max_students || 0);
        
        // Ensure end_date is set, default to start_date + 1 day if null
        const startDate = new Date(instance.start_date);
        let endDate = instance.end_date ? new Date(instance.end_date) : new Date(startDate);
        if (!instance.end_date) {
          endDate.setDate(startDate.getDate() + 1); // Default to next day if no end date
        }

        // Enhanced location with region for better filtering
        const venueLocation = instance.venues?.name || "Unknown Location";
        const region = instance.venues?.region;
        const address = instance.venues?.address;
        let fullLocation = venueLocation;
        
        if (address) {
          // Extract country from address for filtering
          const addressParts = address.split(',').map(part => part.trim());
          if (addressParts.length > 1) {
            fullLocation = `${venueLocation}, ${addressParts[addressParts.length - 1]}`;
          }
        }
        
        return {
          id: instance.id.toString(),
          title: instance.programs?.name || "Unnamed Course",
          location: fullLocation,
          startDate: instance.start_date,
          endDate: endDate.toISOString(),
          status: new Date(instance.start_date) > new Date() ? 'scheduled' : 'completed',
          capacity: capacity,
          enrolledCount: enrolledCount,
          clientName: instance.clients?.name || null,
          isOpenEnrollment: instance.is_open_enrollment || false,
          // Additional fields for filtering
          region: region || null,
          venue: instance.venues || null
        };
      });
      
      console.log("Transformed events:", trainingEvents);
      return trainingEvents;
    }
  });
  
  // Function to handle event deletion with proper cache invalidation
  const handleEventDeleted = () => {
    console.log("Event deleted, invalidating training events query");
    // Invalidate the query to refetch the events
    queryClient.invalidateQueries({ queryKey: queryKeys.trainingEvents() });
  };

  // Enhanced filtering logic with new multi-select filters
  const filteredEvents = events.filter(event => {
    // Search filter
    const matchesSearch = searchQuery === "" || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.clientName && event.clientName.toLowerCase().includes(searchQuery.toLowerCase()));

    // Status filter (array-based)
    const matchesStatus = matchesArrayFilter(event.status, statusFilter);

    // Date filter
    const dateRange = getDateRangeFromFilter(dateFilter);
    const matchesDate = dateFilter === "all" || isEventInDateRange(event.startDate, dateRange);

    // Country filter (array-based)
    const eventCountry = getCountryFromLocation(event.location);
    const matchesCountry = matchesArrayFilter(eventCountry, countryFilter);

    // Region filter (array-based)
    const eventRegion = event.region || event.location.split(',').slice(-2, -1)[0]?.trim() || '';
    const matchesRegion = matchesArrayFilter(eventRegion, regionFilter);

    // Enrollment type filter
    const matchesEnrollment = matchesEnrollmentType(event.isOpenEnrollment, enrollmentTypeFilter);

    return matchesSearch && matchesStatus && matchesDate && matchesCountry && matchesRegion && matchesEnrollment;
  });

  // Clear all filters function
  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter([]);
    setDateFilter("all");
    setCountryFilter([]);
    setRegionFilter([]);
    setEnrollmentTypeFilter([]);
  };
  
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

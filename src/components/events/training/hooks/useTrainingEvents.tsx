
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TrainingEvent } from "@/types/events";
import { queryKeys } from "@/lib/queryKeys";

export function useTrainingEvents() {
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
      
      // Then fetch the course instances with related data including venue country
      const { data, error } = await supabase
        .from('course_instances')
        .select(`
          id,
          start_date,
          end_date,
          is_open_enrollment,
          private_seats_allocated,
          programs:program_id(name, max_students),
          venues:venue_id(name, address, region, country),
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
        const country = instance.venues?.country; // Now we have the actual country field
        
        let fullLocation = venueLocation;
        
        if (address) {
          // Extract country from address for display purposes only
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
          country: country || null, // Use the actual country field from venue
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

  return {
    events,
    isLoading,
    error,
    handleEventDeleted
  };
}

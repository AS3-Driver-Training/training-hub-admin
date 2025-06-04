
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TrainingEvent } from "@/types/events";
import { queryKeys } from "@/lib/queryKeys";
import { useProfile } from "@/hooks/useProfile";

export function useTrainingEvents() {
  const queryClient = useQueryClient();
  const { profile, userRole } = useProfile();
  
  const { data: events = [], isLoading, error } = useQuery({
    queryKey: queryKeys.trainingEvents(),
    queryFn: async () => {
      console.log("Fetching course instances...");
      
      // Determine access level based on user role and profile
      const isInternalUser = ["superadmin", "admin", "staff"].includes(userRole);
      const isImpersonating = profile?.impersonation?.isImpersonating;
      const impersonatedClientId = profile?.impersonation?.impersonatedClientId;
      
      // Get user's client IDs from their client memberships or teams
      let userClientIds: string[] = [];
      
      if (isImpersonating && impersonatedClientId) {
        // When impersonating, only show events for the impersonated client
        userClientIds = [impersonatedClientId];
      } else if (!isInternalUser) {
        // For client users, get their client IDs from client_users and user teams
        const clientIds = (profile?.clientUsers || []).map(cu => cu.client_id);
        const teamClientIds = (profile?.userTeams || []).map(ut => ut.client_id);
        userClientIds = [...new Set([...clientIds, ...teamClientIds])];
      }
      
      console.log('Access control - Internal user:', isInternalUser, 'Impersonating:', isImpersonating, 'Client IDs:', userClientIds);
      
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
      
      // Build the query for course instances with filtering
      let query = supabase
        .from('course_instances')
        .select(`
          id,
          start_date,
          end_date,
          is_open_enrollment,
          private_seats_allocated,
          host_client_id,
          programs:program_id(name, max_students),
          venues:venue_id(name, address, region, country),
          clients:host_client_id(name)
        `)
        .order('start_date', { ascending: true });
      
      // Apply access control filters
      if (!isInternalUser || isImpersonating) {
        // For non-internal users or when impersonating, filter by client access
        if (userClientIds.length > 0) {
          // Show events that are either:
          // 1. Hosted by user's client(s) (private events)
          // 2. Open enrollment events where user's client has allocations
          
          // For now, we'll filter by host_client_id for private events
          // TODO: Also include open enrollment events with client allocations
          query = query.in('host_client_id', userClientIds);
        } else {
          // If no client access, return empty result
          console.log('User has no client access, returning empty events');
          return [];
        }
      }
      
      const { data, error } = await query;
      
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
    },
    enabled: !profile?.isLoading // Wait for profile to load before fetching events
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

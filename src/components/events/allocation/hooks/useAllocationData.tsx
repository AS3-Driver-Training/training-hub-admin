
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { queryKeys } from "@/lib/queryKeys";

export interface Allocation {
  id?: number;
  clientId: string;
  clientName: string;
  seatsAllocated: number;
}

export function useAllocationData() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  // Fetch course instance details
  const { 
    data: courseInstance, 
    isLoading: courseLoading, 
    error: courseError 
  } = useQuery({
    queryKey: queryKeys.courseInstance(id || '0'),
    queryFn: async () => {
      console.log("Fetching course instance with ID:", id);
      const { data, error } = await supabase
        .from("course_instances")
        .select(`
          *,
          program:program_id(
            id,
            name,
            max_students,
            min_students,
            description
          ),
          venue:venue_id(
            id, 
            name, 
            address, 
            region, 
            google_location
          ),
          host_client:host_client_id(
            id,
            name
          )
        `)
        .eq("id", parseInt(id || '0', 10))
        .single();
      
      if (error) {
        console.error("Error fetching course instance:", error);
        setError(`Failed to load course: ${error.message}`);
        throw error;
      }
      
      console.log("Course instance data:", data);
      return data;
    },
    enabled: !!id
  });

  // Fetch existing allocations
  const { 
    data: existingAllocations, 
    isLoading: allocationsLoading, 
    error: allocationsError 
  } = useQuery({
    queryKey: queryKeys.courseAllocations(id || '0'),
    queryFn: async () => {
      console.log("Fetching course allocations for instance ID:", id);
      const { data, error } = await supabase
        .from("course_allocations")
        .select(`
          id,
          seats_allocated,
          client:client_id(
            id,
            name
          )
        `)
        .eq("course_instance_id", parseInt(id || '0', 10));
      
      if (error) {
        console.error("Error fetching allocations:", error);
        setError(`Failed to load allocations: ${error.message}`);
        throw error;
      }
      
      console.log("Allocations data:", data);
      return data;
    },
    enabled: !!id
  });

  // Fetch clients for allocation (only needed for open enrollment courses)
  const { 
    data: clients, 
    isLoading: clientsLoading, 
    error: clientsError 
  } = useQuery({
    queryKey: queryKeys.clients(),
    queryFn: async () => {
      console.log("Fetching clients");
      const { data, error } = await supabase.from("clients").select("*");
      
      if (error) {
        console.error("Error fetching clients:", error);
        setError(`Failed to load clients: ${error.message}`);
        throw error;
      }
      
      console.log("Clients data:", data);
      return data;
    },
    // Only fetch clients for open enrollment courses
    enabled: !!courseInstance && courseInstance.is_open_enrollment
  });

  // Save allocations mutation with comprehensive cache invalidation
  const saveAllocationsMutation = useMutation({
    mutationFn: async (allocations: Allocation[]) => {
      console.log("Saving allocations:", allocations);
      
      // Delete all existing allocations
      const { error: deleteError } = await supabase
        .from("course_allocations")
        .delete()
        .eq("course_instance_id", parseInt(id || '0', 10));
      
      if (deleteError) {
        console.error("Error deleting allocations:", deleteError);
        throw deleteError;
      }

      // Insert new allocations
      if (allocations.length > 0) {
        const { error: insertError } = await supabase
          .from("course_allocations")
          .insert(
            allocations.map(a => ({
              course_instance_id: parseInt(id || '0', 10),
              client_id: a.clientId,
              seats_allocated: a.seatsAllocated
            }))
          );
        
        if (insertError) {
          console.error("Error inserting allocations:", insertError);
          throw insertError;
        }
      }

      return { success: true };
    },
    onSuccess: async () => {
      console.log("Invalidating related queries after allocation save");
      
      // Comprehensive cache invalidation to ensure data consistency
      const invalidationPromises = [
        // Invalidate current course allocations
        queryClient.invalidateQueries({ queryKey: queryKeys.courseAllocations(id || '0') }),
        
        // Invalidate training events list to update enrollment counts
        queryClient.invalidateQueries({ queryKey: queryKeys.trainingEvents() }),
        
        // Invalidate the specific course instance to refresh capacity data
        queryClient.invalidateQueries({ queryKey: queryKeys.courseInstance(id || '0') })
      ];
      
      // If this is a private course with a host client, invalidate client events
      if (courseInstance?.host_client_id) {
        invalidationPromises.push(
          queryClient.invalidateQueries({ 
            queryKey: queryKeys.clientEvents(courseInstance.host_client_id) 
          })
        );
      }
      
      // Wait for all invalidations to complete
      await Promise.all(invalidationPromises);
      
      // Show success message
      toast.success("Success", {
        description: "Seat allocations have been saved successfully"
      });
    },
    onError: (error: any) => {
      console.error("Error in saveAllocationsMutation:", error);
      toast.error("Error", {
        description: "Failed to save allocations: " + error.message,
      });
    },
  });

  return {
    courseInstance,
    existingAllocations,
    clients,
    saveAllocationsMutation,
    isLoading: courseLoading || allocationsLoading || (courseInstance?.is_open_enrollment ? clientsLoading : false),
    error: error || courseError || allocationsError || (courseInstance?.is_open_enrollment ? clientsError : null),
    id
  };
}

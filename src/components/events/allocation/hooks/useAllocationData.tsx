
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

  // Save allocations mutation with improved error handling and cache invalidation
  const saveAllocationsMutation = useMutation({
    mutationFn: async (allocations: Allocation[]) => {
      console.log("Starting allocation save with data:", allocations);
      
      if (!id) {
        throw new Error("Course instance ID is required");
      }

      const courseInstanceId = parseInt(id, 10);
      console.log("Saving allocations for course instance:", courseInstanceId);
      
      try {
        // Delete all existing allocations first
        console.log("Deleting existing allocations...");
        const { error: deleteError } = await supabase
          .from("course_allocations")
          .delete()
          .eq("course_instance_id", courseInstanceId);
        
        if (deleteError) {
          console.error("Error deleting existing allocations:", deleteError);
          throw new Error(`Failed to clear existing allocations: ${deleteError.message}`);
        }
        console.log("Successfully deleted existing allocations");

        // Insert new allocations if any exist
        if (allocations.length > 0) {
          console.log("Inserting new allocations...");
          const allocationsToInsert = allocations.map(a => ({
            course_instance_id: courseInstanceId,
            client_id: a.clientId,
            seats_allocated: a.seatsAllocated
          }));
          
          console.log("Allocation data to insert:", allocationsToInsert);
          
          const { error: insertError, data: insertedData } = await supabase
            .from("course_allocations")
            .insert(allocationsToInsert)
            .select();
          
          if (insertError) {
            console.error("Error inserting new allocations:", insertError);
            throw new Error(`Failed to save new allocations: ${insertError.message}`);
          }
          
          console.log("Successfully inserted allocations:", insertedData);
        } else {
          console.log("No allocations to insert");
        }

        // Verify the save by fetching the data back
        console.log("Verifying save by fetching current allocations...");
        const { data: verificationData, error: verificationError } = await supabase
          .from("course_allocations")
          .select("*")
          .eq("course_instance_id", courseInstanceId);
        
        if (verificationError) {
          console.error("Error verifying save:", verificationError);
        } else {
          console.log("Verification: Current allocations in DB:", verificationData);
        }

        return { success: true, allocations: verificationData };
      } catch (error) {
        console.error("Save operation failed:", error);
        throw error;
      }
    },
    onSuccess: async (result) => {
      console.log("Save mutation successful, starting cache invalidation...");
      
      try {
        // Get all clients that have allocations for comprehensive cache invalidation
        const clientIds = new Set<string>();
        
        // Add clients from the saved allocations
        if (result.allocations) {
          result.allocations.forEach(alloc => {
            clientIds.add(alloc.client_id);
          });
        }
        
        // Also add clients from existing allocations (in case some were removed)
        if (existingAllocations) {
          existingAllocations.forEach(alloc => {
            clientIds.add(alloc.client?.id);
          });
        }

        console.log("Invalidating cache for clients:", Array.from(clientIds));

        // Prepare invalidation promises
        const invalidationPromises = [
          // Invalidate current course allocations
          queryClient.invalidateQueries({ queryKey: queryKeys.courseAllocations(id || '0') }),
          
          // Invalidate training events list to update enrollment counts
          queryClient.invalidateQueries({ queryKey: queryKeys.trainingEvents() }),
          
          // Invalidate the specific course instance to refresh capacity data
          queryClient.invalidateQueries({ queryKey: queryKeys.courseInstance(id || '0') })
        ];
        
        // Invalidate client events for all affected clients
        clientIds.forEach(clientId => {
          if (clientId) {
            console.log("Adding client events invalidation for client:", clientId);
            invalidationPromises.push(
              queryClient.invalidateQueries({ 
                queryKey: queryKeys.clientEvents(clientId) 
              })
            );
          }
        });
        
        // If this course has a host client, also invalidate their client events
        if (courseInstance?.host_client_id) {
          console.log("Adding client events invalidation for host client:", courseInstance.host_client_id);
          invalidationPromises.push(
            queryClient.invalidateQueries({ 
              queryKey: queryKeys.clientEvents(courseInstance.host_client_id) 
            })
          );
        }
        
        // Wait for all invalidations to complete with better error handling
        const invalidationResults = await Promise.allSettled(invalidationPromises);
        
        // Log any invalidation failures
        invalidationResults.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.error(`Invalidation ${index} failed:`, result.reason);
          } else {
            console.log(`Invalidation ${index} succeeded`);
          }
        });
        
        console.log("All cache invalidations completed");
        
        // Show success message
        toast.success("Success", {
          description: "Seat allocations have been saved successfully"
        });
      } catch (error) {
        console.error("Error during cache invalidation:", error);
        // Still show success since the save worked, just mention cache issue
        toast.success("Saved", {
          description: "Allocations saved. Please refresh if data doesn't update immediately."
        });
      }
    },
    onError: (error: any) => {
      console.error("Save mutation failed:", error);
      toast.error("Error", {
        description: "Failed to save allocations: " + (error.message || "Unknown error"),
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

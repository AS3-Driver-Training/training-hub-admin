
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { queryKeys } from "@/lib/queryKeys";

export function useCourseInstanceMutations() {
  const queryClient = useQueryClient();

  const createCourseInstance = useMutation({
    mutationFn: async (courseData: any) => {
      console.log("Creating course instance:", courseData);
      
      const { data, error } = await supabase
        .from("course_instances")
        .insert(courseData)
        .select()
        .single();

      if (error) {
        console.error("Error creating course instance:", error);
        throw error;
      }

      console.log("Course instance created:", data);
      return data;
    },
    onSuccess: (data) => {
      console.log("Course instance created successfully, invalidating related queries");
      
      // Invalidate training events to show the new course immediately
      queryClient.invalidateQueries({ queryKey: queryKeys.trainingEvents() });
      
      // If this is a private course, also invalidate client events
      if (data.host_client_id) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.clientEvents(data.host_client_id) 
        });
      }
      
      toast.success("Course created successfully");
    },
    onError: (error: any) => {
      console.error("Failed to create course instance:", error);
      toast.error("Failed to create course: " + error.message);
    }
  });

  const updateCourseInstance = useMutation({
    mutationFn: async ({ id, courseData }: { id: string; courseData: any }) => {
      console.log("Updating course instance:", id, courseData);
      
      const { data, error } = await supabase
        .from("course_instances")
        .update(courseData)
        .eq("id", parseInt(id))
        .select()
        .single();

      if (error) {
        console.error("Error updating course instance:", error);
        throw error;
      }

      console.log("Course instance updated:", data);
      return data;
    },
    onSuccess: (data, variables) => {
      console.log("Course instance updated successfully, invalidating related queries");
      
      // Invalidate training events
      queryClient.invalidateQueries({ queryKey: queryKeys.trainingEvents() });
      
      // Invalidate the specific course instance
      queryClient.invalidateQueries({ queryKey: queryKeys.courseInstance(variables.id) });
      
      // If this is a private course, also invalidate client events
      if (data.host_client_id) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.clientEvents(data.host_client_id) 
        });
      }
      
      toast.success("Course updated successfully");
    },
    onError: (error: any) => {
      console.error("Failed to update course instance:", error);
      toast.error("Failed to update course: " + error.message);
    }
  });

  return {
    createCourseInstance,
    updateCourseInstance
  };
}

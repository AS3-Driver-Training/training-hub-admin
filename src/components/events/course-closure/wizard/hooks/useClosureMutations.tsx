
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWizardContext } from "../WizardContext";
import { CourseClosureData } from "@/types/programs";
import { apiTransformer } from "@/utils/dataTransformUtils";
import { toast } from "sonner";

/**
 * Hook for course closure mutations (create & update)
 */
export const useClosureMutations = (courseId?: number) => {
  const { 
    formData, 
    setCurrentStep, 
    setCompletedClosureId, 
    file, 
    setIsSubmitting,
    setIsEditing 
  } = useWizardContext();
  const queryClient = useQueryClient();

  // Submit closure data mutation for creating a new closure
  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!courseId) throw new Error("No course ID provided");
      setIsSubmitting(true);
      
      try {
        // First check if user is authenticated
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw new Error(`Authentication error: ${sessionError.message}`);
        }
        
        if (!sessionData.session || !sessionData.session.user) {
          throw new Error("You must be logged in to complete this action");
        }
        
        const currentUserId = sessionData.session.user.id;
        console.log("Current user ID for course closure:", currentUserId);
        
        // Convert formData to proper CourseClosureData
        const closureData: CourseClosureData = formData as CourseClosureData;
        
        // Ensure vehicles array exists
        if (!closureData.vehicles) {
          closureData.vehicles = [];
        }
        
        // Ensure additional_exercises array exists - use the snake_case version
        if (!closureData.additional_exercises) {
          closureData.additional_exercises = [];
          
          // If additionalExercises exists (camelCase), copy it to additional_exercises (snake_case)
          if (closureData.additionalExercises) {
            closureData.additional_exercises = closureData.additionalExercises;
          }
        }
        
        // Transform data to snake_case for database storage
        const closureDataJson = JSON.stringify(apiTransformer.toApi(closureData));
        
        let zipfileUrl = null;
        
        // Skip file upload for now as the bucket doesn't exist
        // Only attempt file upload if file exists and user still wants to proceed
        if (file) {
          console.log("File upload skipped - storage bucket not available");
          toast(`File upload will be available in a future update`, {
            style: { backgroundColor: "#FEF3C7" },
            description: "Your course closure data will be saved without the file."
          });
        }
        
        // Create the record payload with the authenticated user's ID
        const payload = {
          course_instance_id: courseId,
          status: "draft",
          units: formData.course_info?.units,
          country: formData.course_info?.country,
          zipfile_url: zipfileUrl,
          closure_data: closureDataJson,
          closed_by: currentUserId  // Use the real authenticated user ID
        };
        
        console.log("Submitting course closure with payload:", payload);
        
        // Create course closure record
        const { data, error } = await supabase
          .from("course_closures")
          .insert(payload)
          .select();
          
        if (error) {
          console.error("Error creating course closure:", error);
          throw new Error(`Failed to create course closure: ${error.message}`);
        }
        
        const closureId = data[0].id;
        setCompletedClosureId(closureId);

        // Insert vehicle data into course_vehicles table
        if (formData.vehicles && formData.vehicles.length > 0) {
          const vehiclesToInsert = formData.vehicles
            .filter(v => v.make && (v.make.trim() !== "")) // Only insert vehicles with actual make values
            .map(vehicle => ({
              course_instance_id: courseId,
              vehicle_id: vehicle.car, // Using car as vehicle_id for now
              car_number: vehicle.car
            }));

          if (vehiclesToInsert.length > 0) {
            const { error: vehicleError } = await supabase
              .from("course_vehicles")
              .insert(vehiclesToInsert);
            
            if (vehicleError) {
              console.error("Error inserting vehicles:", vehicleError);
              toast(`Warning: Failed to save vehicle information`, {
                style: { backgroundColor: "#FEF3C7" },
                description: "Vehicle information may be incomplete."
              });
            } else {
              console.log("Successfully saved vehicle data:", vehiclesToInsert);
            }
          }
        }
        
        return data;
      } catch (err: any) {
        console.error("Course closure submission failed:", err);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    onSuccess: () => {
      toast.success("Course closure process completed successfully");
      setCurrentStep('completed');
      setIsEditing(false);
    },
    onError: (err: any) => {
      toast(`Error: ${err.message}`, {
        style: { backgroundColor: "#FEF3C7" },
        description: "Please check your input and try again."
      });
    },
  });

  // Update an existing course closure
  const updateMutation = useMutation({
    mutationFn: async (existingClosureId: number) => {
      if (!courseId) throw new Error("No course ID provided");
      if (!existingClosureId) throw new Error("No closure ID to update");
      
      setIsSubmitting(true);
      
      try {
        // First check if user is authenticated
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw new Error(`Authentication error: ${sessionError.message}`);
        }
        
        if (!sessionData.session || !sessionData.session.user) {
          throw new Error("You must be logged in to complete this action");
        }
        
        // Convert formData to proper CourseClosureData
        const closureData: CourseClosureData = formData as CourseClosureData;
        
        // Ensure vehicles array exists
        if (!closureData.vehicles) {
          closureData.vehicles = [];
        }
        
        // Ensure additional_exercises array exists - use the snake_case version
        if (!closureData.additional_exercises) {
          closureData.additional_exercises = [];
          
          // If additionalExercises exists (camelCase), copy it to additional_exercises (snake_case)
          if (closureData.additionalExercises) {
            closureData.additional_exercises = closureData.additionalExercises;
          }
        }
        
        // Transform data to snake_case for database storage
        const closureDataJson = JSON.stringify(apiTransformer.toApi(closureData));
        
        // Create the update payload - using a string for updated_at
        const payload = {
          units: formData.course_info?.units,
          country: formData.course_info?.country,
          closure_data: closureDataJson,
          updated_at: new Date().toISOString() // Convert Date to ISO string format
        };
        
        console.log("Updating course closure with payload:", payload);
        
        // Update course closure record
        const { data, error } = await supabase
          .from("course_closures")
          .update(payload)
          .eq('id', existingClosureId)
          .select();
          
        if (error) {
          console.error("Error updating course closure:", error);
          throw new Error(`Failed to update course closure: ${error.message}`);
        }

        // Update vehicle data in course_vehicles table
        if (formData.vehicles && formData.vehicles.length > 0) {
          // First delete existing vehicle records for this course
          const { error: deleteError } = await supabase
            .from("course_vehicles")
            .delete()
            .eq("course_instance_id", courseId);
            
          if (deleteError) {
            console.error("Error removing old vehicle records:", deleteError);
            // Continue anyway - we'll add the new records
          }
          
          // Insert new vehicle records
          const vehiclesToInsert = formData.vehicles
            .filter(v => v.make && (v.make.trim() !== ""))
            .map(vehicle => ({
              course_instance_id: courseId,
              vehicle_id: vehicle.car, 
              car_number: vehicle.car
            }));

          if (vehiclesToInsert.length > 0) {
            const { error: vehicleError } = await supabase
              .from("course_vehicles")
              .insert(vehiclesToInsert);
            
            if (vehicleError) {
              console.error("Error inserting vehicles:", vehicleError);
              toast(`Warning: Failed to save vehicle information`, {
                style: { backgroundColor: "#FEF3C7" },
                description: "Vehicle information may be incomplete."
              });
            } else {
              console.log("Successfully saved vehicle data:", vehiclesToInsert);
            }
          }
        }
        
        return data;
      } catch (err: any) {
        console.error("Course closure update failed:", err);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    onSuccess: () => {
      toast.success("Course closure updated successfully");
      setCurrentStep('completed');
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['existing-closure', courseId] });
    },
    onError: (err: any) => {
      toast(`Error: ${err.message}`, {
        style: { backgroundColor: "#FEF3C7" },
        description: "Please check your input and try again."
      });
    },
  });

  return { submitMutation, updateMutation };
};

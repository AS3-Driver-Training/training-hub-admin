
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { CourseClosureData } from "@/types/programs";
import { apiTransformer } from "@/utils/dataTransformUtils";
import { toast } from "sonner";
import { CourseInstanceWithClient } from "../CourseClosureWizard";
import { useWizardContext } from "./WizardContext";

export const useCourseData = (courseId?: number) => {
  const { 
    formData, 
    updateFormData, 
    setCurrentStep, 
    setCompletedClosureId, 
    file, 
    setIsSubmitting, 
    isEditing,
    setIsEditing 
  } = useWizardContext();
  
  const queryClient = useQueryClient();

  // Fetch course details
  const { data: courseInstance, isLoading, error } = useQuery({
    queryKey: ["course-instance", courseId],
    queryFn: async () => {
      if (!courseId) return null;

      const { data, error } = await supabase
        .from("course_instances")
        .select(`
          id, 
          start_date, 
          end_date,
          programs:program_id(id, name),
          venues:venue_id(id, name),
          host_client_id
        `)
        .eq("id", courseId)
        .single();

      if (error) throw error;
      
      // Create our response with the correct type
      const responseWithClient: CourseInstanceWithClient = { ...data };
      
      // Fetch client info if host_client_id exists
      if (data.host_client_id) {
        const { data: clientData, error: clientError } = await supabase
          .from("clients")
          .select("name")
          .eq("id", data.host_client_id)
          .single();
        
        if (!clientError && clientData) {
          responseWithClient.clientName = clientData.name;
        }
      }
      
      // Fetch venue country information
      if (data.venues && data.venues.id) {
        const { data: venueData, error: venueError } = await supabase
          .from("venues")
          .select("region")
          .eq("id", data.venues.id)
          .single();
          
        if (!venueError && venueData && venueData.region) {
          responseWithClient.venues.country = venueData.region;
        }
      }
      
      return responseWithClient;
    },
    enabled: !!courseId,
  });

  // Check for existing closure
  const { data: existingClosure } = useQuery({
    queryKey: ["existing-closure", courseId],
    queryFn: async () => {
      if (!courseId) return null;
      
      const { data, error } = await supabase
        .from("course_closures")
        .select("*")
        .eq("course_instance_id", courseId)
        .order("created_at", { ascending: false })
        .limit(1);
        
      if (error) throw error;
      return data.length > 0 ? data[0] : null;
    },
    enabled: !!courseId
  });

  // Initialize form data when course instance is loaded
  useEffect(() => {
    if (courseInstance) {
      const courseDate = new Date(courseInstance.start_date);
      
      updateFormData({
        course_info: {
          ...formData.course_info!,
          program: courseInstance.programs?.name || "Unknown Program",
          date: format(courseDate, "yyyy-MM-dd"),
          client: courseInstance.clientName || "Unknown Client",
          country: courseInstance.venues?.country || "USA"
        }
      });
    }
  }, [courseInstance]);

  // Set to completed step if there's already a closure
  useEffect(() => {
    if (existingClosure) {
      setCurrentStep('completed');
      setCompletedClosureId(existingClosure.id);
      
      // Initialize formData with existing closure details
      const baseFormData: Partial<CourseClosureData> = {
        course_info: {
          units: existingClosure.units || "MPH",
          country: existingClosure.country || "USA",
          program: formData.course_info?.program || "",
          date: formData.course_info?.date || "",
          client: formData.course_info?.client || ""
        },
        vehicles: [],
        additional_exercises: [],
        course_layout: formData.course_layout // Initialize with default layout
      };

      // Try to load closure data from the closure_data JSON field
      if (existingClosure.closure_data) {
        try {
          console.log("Raw closure data from DB:", existingClosure.closure_data);
          
          // Apply to formData including any vehicle data and additional_exercises
          const parsedData = apiTransformer.fromApi(existingClosure.closure_data);
          
          // Ensure vehicles array exists
          if (!parsedData.vehicles) {
            parsedData.vehicles = [];
          }
          
          // Ensure additional_exercises array exists
          if (!parsedData.additional_exercises) {
            parsedData.additional_exercises = [];
          }
          
          // Ensure course_layout exists
          if (!parsedData.course_layout) {
            parsedData.course_layout = formData.course_layout;
          }
          
          // Special handling for nested properties to ensure proper case conversion
          if (Array.isArray(parsedData.vehicles)) {
            parsedData.vehicles = parsedData.vehicles.map(vehicle => ({
              ...vehicle,
              // Ensure latAcc property is correctly mapped from snake_case
              latAcc: vehicle.latAcc !== undefined ? vehicle.latAcc : 
                      (vehicle.lat_acc !== undefined ? vehicle.lat_acc : undefined)
            }));
          }
          
          if (Array.isArray(parsedData.additional_exercises)) {
            parsedData.additional_exercises = parsedData.additional_exercises.map(exercise => ({
              ...exercise,
              // Ensure isMeasured property is correctly mapped
              isMeasured: exercise.isMeasured !== undefined ? exercise.isMeasured : 
                         (exercise.is_measured !== undefined ? exercise.is_measured : false),
              // Ensure measurementType property is correctly mapped
              measurementType: exercise.measurementType || exercise.measurement_type || 'time'
            }));
          }
          
          updateFormData({...baseFormData, ...parsedData});
          console.log("Loaded closure data from JSON:", parsedData);
          return;
        } catch (e) {
          console.error("Failed to parse closure_data JSON:", e);
          toast.error("Failed to load course closure data");
        }
      }
      
      // If closure_data wasn't available, try to load vehicles from course_vehicles table
      const loadVehicles = async () => {
        const { data: vehiclesData, error: vehiclesError } = await supabase
          .from('course_vehicles')
          .select(`
            *,
            vehicle:vehicle_id(
              id,
              make,
              model,
              year,
              latacc
            )
          `)
          .eq('course_instance_id', courseId);
          
        if (!vehiclesError && vehiclesData && vehiclesData.length > 0) {
          // Transform vehicle data to the format expected by the form
          const formattedVehicles = vehiclesData.map(v => ({
            car: v.car_number,
            make: v.vehicle?.make || "",
            model: v.vehicle?.model,
            year: v.vehicle?.year,
            latAcc: v.vehicle?.latacc // Map latacc to latAcc
          }));
          
          // Add vehicles to form data
          updateFormData({
            ...baseFormData,
            vehicles: formattedVehicles
          });
          
          console.log("Loaded vehicles from course_vehicles table:", formattedVehicles);
        } else {
          // Just use the base form data
          updateFormData(baseFormData);
        }
      };
      
      loadVehicles();
    }
  }, [existingClosure]);

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
        
        // Ensure additional_exercises array exists
        if (!closureData.additional_exercises) {
          closureData.additional_exercises = [];
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
    mutationFn: async () => {
      if (!courseId) throw new Error("No course ID provided");
      if (!existingClosure?.id) throw new Error("No closure ID to update");
      
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
        
        // Ensure additional_exercises array exists
        if (!closureData.additional_exercises) {
          closureData.additional_exercises = [];
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
          .eq('id', existingClosure.id)
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

  return {
    courseInstance,
    isLoading,
    error,
    submitMutation,
    updateMutation
  };
};

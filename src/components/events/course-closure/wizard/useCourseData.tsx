
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { CourseClosureData } from "@/types/programs";
import { apiTransformer } from "@/utils/dataTransformUtils";
import { toast, success, error as toastError } from "@/utils/toast";
import { CourseInstanceWithClient } from "../CourseClosureWizard";
import { useWizardContext } from "./WizardContext";

export const useCourseData = (courseId?: number) => {
  const { formData, updateFormData, setCurrentStep, setCompletedClosureId, file, setIsSubmitting } = useWizardContext();
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
        vehicles: []
      };

      // Try to load closure data from the closure_data JSON field
      if (existingClosure.closure_data) {
        try {
          // Apply to formData including any vehicle data
          const parsedData = apiTransformer.fromApi(existingClosure.closure_data);
          updateFormData({...baseFormData, ...parsedData});
          console.log("Loaded closure data from JSON:", parsedData);
          return;
        } catch (e) {
          console.error("Failed to parse closure_data JSON:", e);
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
            latAcc: v.vehicle?.latacc
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

  // Submit closure data mutation
  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!courseId) throw new Error("No course ID provided");
      setIsSubmitting(true);
      
      let zipfileUrl = null;
      let closureDataJson = null;
      
      try {
        // Convert formData to proper CourseClosureData
        const closureData: CourseClosureData = formData as CourseClosureData;
        closureDataJson = JSON.stringify(apiTransformer.toApi(closureData));
        
        // Handle file upload if a file is selected
        if (file) {
          // Upload file to storage
          const timestamp = Date.now();
          const fileExt = file.name.split('.').pop();
          const fileName = `course-${courseId}-${timestamp}.${fileExt}`;
          const filePath = `course-closures/${fileName}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("course-documents")
            .upload(filePath, file);
          
          if (uploadError) {
            throw new Error(`File upload failed: ${uploadError.message}`);
          }
          
          // Get the URL for the uploaded file
          const { data: urlData } = await supabase.storage
            .from("course-documents")
            .getPublicUrl(filePath);
            
          zipfileUrl = urlData.publicUrl;
        }
        
        // Create the record payload
        const payload = {
          course_instance_id: courseId,
          status: "draft",
          units: formData.course_info?.units,
          country: formData.course_info?.country,
          zipfile_url: zipfileUrl,
          closure_data: closureDataJson, // Store full closure data in the new column
          closed_by: "00000000-0000-0000-0000-000000000000" // Placeholder UUID, should be replaced with actual user ID
        };
        
        // Create course closure record
        const { data, error } = await supabase
          .from("course_closures")
          .insert(payload)
          .select();
          
        if (error) throw error;
        
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
              toast.warning("Warning: Failed to save vehicle information");
            } else {
              console.log("Successfully saved vehicle data:", vehiclesToInsert);
            }
          }
        }
        
        return data;
      } catch (err) {
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    onSuccess: () => {
      success("Course closure process completed successfully");
      setCurrentStep('completed');
    },
    onError: (err: any) => {
      toastError(`Error: ${err.message}`);
    },
  });

  return {
    courseInstance,
    isLoading,
    error,
    submitMutation
  };
};

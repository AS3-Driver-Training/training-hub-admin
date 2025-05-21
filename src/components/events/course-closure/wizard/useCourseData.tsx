
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
        }
      };

      // Try to load any additional JSON data that might be stored as a stringified object
      try {
        for (const key of Object.keys(existingClosure)) {
          if (typeof existingClosure[key] === 'string' && 
              existingClosure[key].startsWith('{') && 
              existingClosure[key].endsWith('}')) {
            try {
              const parsedData = JSON.parse(existingClosure[key]);
              if (parsedData && typeof parsedData === 'object') {
                // Apply to formData
                updateFormData({...baseFormData, ...apiTransformer.fromApi(parsedData)});
                return;
              }
            } catch (e) {
              // Not valid JSON, continue checking other properties
              console.error("Failed to parse potential JSON data:", e);
            }
          }
        }
      } catch (e) {
        console.error("Error processing closure data:", e);
      }
      
      // If no JSON data found, just use the base form data
      updateFormData(baseFormData);
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
          closed_by: "00000000-0000-0000-0000-000000000000" // Placeholder UUID, should be replaced with actual user ID
        };

        // Add closure_data JSON if available - this will only work if there's a column for it
        if (closureDataJson) {
          try {
            // Check if closure_data column exists (this will only run once)
            const { data: columnsData } = await supabase
              .from('course_closures')
              .select('*')
              .limit(1);
              
            if (columnsData && columnsData[0] && 'closure_data' in columnsData[0]) {
              // If the column exists, include it in the payload
              Object.assign(payload, { closure_data: closureDataJson });
            }
          } catch (e) {
            console.error("Error checking for closure_data column:", e);
          }
        }
        
        // Create course closure record
        const { data, error } = await supabase
          .from("course_closures")
          .insert(payload)
          .select();
          
        if (error) throw error;
        setCompletedClosureId(data[0].id);
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

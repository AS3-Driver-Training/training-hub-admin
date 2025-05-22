
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWizardContext } from "../WizardContext";
import { format } from "date-fns";
import { CourseInstanceWithClient } from "../../CourseClosureWizard";

/**
 * Hook to fetch course instance data
 */
export const useCourseInstance = (courseId?: number) => {
  const { updateFormData, formData } = useWizardContext();

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
  
  // Initialize form data when course instance is loaded
  const initializeCourseData = () => {
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
  };

  return { courseInstance, isLoading, error, initializeCourseData };
};

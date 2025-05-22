import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Define keepPreviousData as true
const keepPreviousData = true;

/**
 * Hook to check if a course has been formally closed
 */
export const useCourseClosure = (courseId?: number) => {
  const { data: closureData, isLoading } = useQuery({
    queryKey: ["course-closure-status", courseId],
    queryFn: async () => {
      if (!courseId) return null;
      
      // Check for a closure record for this course
      const { data, error } = await supabase
        .from("course_closures")
        .select("id, status, closed_at")
        .eq("course_instance_id", courseId)
        .order("created_at", { ascending: false })
        .limit(1);
        
      if (error) throw error;
      return data && data.length > 0 ? data[0] : null;
    },
    enabled: !!courseId,
    // Use the new keepPrevious placeholder data function
    placeholderData: keepPreviousData
  });

  // Determine if the course has been formally closed
  const isClosed = !!closureData;
  
  // Determine if the closure is in draft status
  const isDraft = closureData?.status === 'draft';
  
  // Get the closure ID if available
  const closureId = closureData?.id || null;

  return {
    isClosed,
    isDraft,
    closureId,
    closureData,
    isLoading
  };
};

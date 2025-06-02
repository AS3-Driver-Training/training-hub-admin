
import { supabase } from "@/integrations/supabase/client";
import { AnalyticsData, PerformanceTier, StressResponse } from "@/types/analytics";
import { validateAndTransformAnalyticsData } from "./dataTransformationService";

export const getAnalyticsData = async (courseId: string): Promise<AnalyticsData | null> => {
  try {
    console.log('Fetching analytics data for course:', courseId);
    
    // Fetch from course_closures table with course instance and client data
    const { data, error } = await supabase
      .from('course_closures')
      .select(`
        analytics_data,
        course_instance:course_instance_id (
          id,
          start_date,
          program:program_id (
            name
          ),
          host_client:host_client_id (
            name
          )
        )
      `)
      .eq('course_instance_id', parseInt(courseId))
      .single();
    
    if (error) {
      console.error('No analytics data found in database:', error);
      return null;
    }
    
    if (!data?.analytics_data) {
      console.log('No analytics_data found for this course');
      return null;
    }
    
    console.log('Raw analytics data from database:', data.analytics_data);
    console.log('Course instance data:', data.course_instance);
    
    // Transform and validate the data
    const transformedData = validateAndTransformAnalyticsData(data.analytics_data);
    
    // Override the client name with the correct one from the database relationship
    if (data.course_instance?.host_client?.name) {
      transformedData.metadata.course_client = data.course_instance.host_client.name;
    }
    
    // Also ensure the program name is correct from the database
    if (data.course_instance?.program?.name) {
      transformedData.metadata.course_program = data.course_instance.program.name;
    }
    
    console.log('Transformed analytics data with correct client:', transformedData);
    return transformedData as unknown as AnalyticsData;
  } catch (error) {
    console.error('Analytics service error:', error);
    return null;
  }
};

export const calculatePerformanceTiers = (studentData: AnalyticsData['student_performance_data']): PerformanceTier[] => {
  const tiers = [
    { name: 'Needs Training (<70)', min: 0, max: 69.99, color: '#EF4444' },
    { name: 'Good Performance (70-84)', min: 70, max: 84.99, color: '#F59E0B' },
    { name: 'Exceptional (85+)', min: 85, max: 100, color: '#10B981' }
  ];

  const total = studentData.length;

  return tiers.map(tier => {
    const count = studentData.filter(student => 
      student.overall_score >= tier.min && student.overall_score <= tier.max
    ).length;
    
    return {
      name: tier.name,
      count,
      percentage: Math.round((count / total) * 100),
      color: tier.color
    };
  });
};

export const getStressResponseCategory = (lowScore: number, highScore: number): StressResponse => {
  const difference = highScore - lowScore;
  
  if (difference >= 5) {
    return { category: 'enhanced', color: '#10B981' };
  } else if (difference <= -5) {
    return { category: 'affected', color: '#F59E0B' };
  } else {
    return { category: 'resilient', color: '#3B82F6' };
  }
};


import { supabase } from "@/integrations/supabase/client";
import { AnalyticsData, PerformanceTier, StressResponse } from "@/types/analytics";

// Sample analytics data for development
const sampleAnalyticsData: AnalyticsData = {
  report_id: "as3_anthropic_report_20250528_193920",
  metadata: {
    generated_at: "2025-05-28T19:39:20.987171",
    course_program: "Advanced [Counter-Ambush] 2 Day Driver Training",
    course_date: "2024-05-23",
    course_client: "Patriot Group",
    total_students: 9,
    api_model: "claude-3-5-sonnet-20241022"
  },
  source_data: {
    course_metadata: {
      course_info: {
        units: "MPH",
        country: "EUA",
        program: "Advanced [Counter-Ambush] 2 Day Driver Training",
        date: "2024-05-23",
        client: "Patriot Group"
      },
      vehicles: [
        {car: 1, make: "Ford Explorer", model: "Ford Explorer", year: 2025, latAcc: 0.85},
        {car: 2, make: "Toyota RAV4", model: "Toyota RAV4", year: 2025, latAcc: 0.85},
        {car: 3, make: "Dodge Durango RT", model: "Dodge Durango RT", year: 2025, latAcc: 0.85},
        {car: 4, make: "Nissan Altima", model: "Nissan Altima", year: 2025, latAcc: 0.9}
      ],
      students: [
        {id: "9442905e-ccf1-47b8-9bfb-89a522c6f9e0", name: "Dechase Tyler"},
        {id: "de691fab-0e8c-43e4-95aa-29b31bf8a223", name: "Eric Villarreal"},
        {id: "c5e7d983-ff85-4cbb-9072-925742fcaf10", name: "Joe Zink"},
        {id: "e48a59db-07b7-4a44-8c2f-d90563bb382b", name: "Chris Brown"},
        {id: "eb62007f-2f6e-4d5d-9631-69903d299d8c", name: "James Harris"},
        {id: "695a581f-fa0e-4bfe-8187-f8dffbc6840e", name: "Charles Custance"},
        {id: "7cb6252b-77ab-441b-96ae-f85c67246d8d", name: "Brian Cervantes"},
        {id: "80024067-6a04-44bc-99bf-a4044225bca6", name: "Charlie Tompkins"},
        {id: "8957e8fb-1415-4a62-9f74-79884562cfd9", name: "Steve Sanderson"}
      ]
    },
    group_data: {
      group_average_slalom_runs: 11,
      group_average_slalom_prcnt_completed: 47,
      group_average_slalom_vehicle_control: 85,
      group_average_lnch_runs: 7,
      group_average_lnch_vehicle_control: 80,
      Final_Excersise_Group_Avg_Time: "01:19.70",
      Final_Excersise_Group_Avg_Performance: 89,
      group_average_overall_score: 84
    }
  },
  anthropic_responses: {
    executive_summary: {
      title: "Executive Summary",
      content: "**Executive Summary**\n\n**Group Performance**: Nine students completed the Advanced [Counter-Ambush] 2 Day Driver Training with an overall group average score of 84. This represents near-standard performance that falls slightly below operational requirements, with 44% of students meeting or exceeding the 85-point proficiency threshold.\n\n**Key Findings**: The group demonstrates solid fundamental skills with notably strong performance in the Final Multidisciplinary Exercise (group average 87%). Four students (Charlie Tompkins, Steve Sanderson, Joe Zink, and Charles Custance) have achieved scores above 85, indicating readiness for standard security operations.",
      generated_at: "2025-05-28T19:38:14.968484",
      has_error: false
    },
    performance_distribution: {
      title: "Performance Distribution",
      content: "### Performance Distribution Analysis\n\n- **Exceptional (90+)**: 0 students (0%) \n- **Proficient (85-89)**: 4 students (44.4%) - Steve Sanderson, Charlie Tompkins, Joe Zink, Charles Custance\n- **Developing (70-84)**: 5 students (55.6%) - James Harris, Chris Brown, Dechase Tyler, Eric Villarreal, Brian Cervantes\n- **At Risk (<70)**: 0 students (0%)\n\n**Group Average Score: 84.0**",
      generated_at: "2025-05-28T19:38:26.199634",
      has_error: false
    },
    stress_performance_analysis: {
      title: "Stress Performance Analysis",
      content: "### Stress Response Categories\n\n**🟢 STRESS ENHANCED** (4 students)\n- **Joe Zink**: 80 → 93 *(+13 point improvement)*\n- **James Harris**: 86 → 94 *(+8 point improvement)*\n- **Charles Custance**: 86 → 94 *(+8 point improvement)*\n- **Steve Sanderson**: 85 → 97 *(+12 point improvement)*",
      generated_at: "2025-05-28T19:38:34.474447",
      has_error: false
    },
    exercise_breakdown: {
      title: "Exercise Breakdown",
      content: "### SLALOM EXERCISE\n**Group Average Vehicle Control: 85%**\n\n**Top Performers**:\n- **Joe Zink**: 87% control, 2 attempts\n- **Charlie Tompkins**: 87% control, 6 attempts\n- **Dechase Tyler**: 86% control, 6 attempts",
      generated_at: "2025-05-28T19:38:45.845619",
      has_error: false
    },
    risk_assessment_recommendations: {
      title: "Risk Assessment Recommendations", 
      content: "### 🟡 ADDITIONAL TRAINING RECOMMENDED\n\n**Eric Villarreal** *(Overall Score: 80.87)*\n- **Performance Area**: High runs until pass in Slalom (18 runs)\n- **Risk Factor**: Increased risk in high-speed vehicle control scenarios\n\n**Brian Cervantes** *(Overall Score: 77.79)*\n- **Performance Area**: High runs until pass in Barricade Evasion (16 runs)\n- **Risk Factor**: Increased risk in emergency evasion scenarios",
      generated_at: "2025-05-28T19:39:19.985164",
      has_error: false
    }
  },
  student_performance_data: [
    {name: "Steve Sanderson", overall_score: 87.98, slalom_control: 88, slalom_attempts: 8, evasion_control: 82, evasion_attempts: 4, low_stress_score: 85, high_stress_score: 97},
    {name: "Charlie Tompkins", overall_score: 87.88, slalom_control: 87, slalom_attempts: 6, evasion_control: 82, evasion_attempts: 2, low_stress_score: 87, high_stress_score: 95},
    {name: "Joe Zink", overall_score: 87.28, slalom_control: 87, slalom_attempts: 2, evasion_control: 85, evasion_attempts: 5, low_stress_score: 80, high_stress_score: 93},
    {name: "Charles Custance", overall_score: 82.65, slalom_control: 84, slalom_attempts: 17, evasion_control: 78, evasion_attempts: 6, low_stress_score: 86, high_stress_score: 94},
    {name: "James Harris", overall_score: 82.54, slalom_control: 83, slalom_attempts: 9, evasion_control: 79, evasion_attempts: 4, low_stress_score: 86, high_stress_score: 94},
    {name: "Chris Brown", overall_score: 83.46, slalom_control: 82, slalom_attempts: 12, evasion_control: 83, evasion_attempts: 2, low_stress_score: 88, high_stress_score: 85},
    {name: "Dechase Tyler", overall_score: 83.48, slalom_control: 86, slalom_attempts: 6, evasion_control: 77, evasion_attempts: 7, low_stress_score: 94, high_stress_score: 95},
    {name: "Eric Villarreal", overall_score: 80.87, slalom_control: 85, slalom_attempts: 18, evasion_control: 88, evasion_attempts: 3, low_stress_score: 84, high_stress_score: 82},
    {name: "Brian Cervantes", overall_score: 77.79, slalom_control: 80, slalom_attempts: 15, evasion_control: 75, evasion_attempts: 16, low_stress_score: 91, high_stress_score: 94}
  ],
  endpoint_ready: true,
  processing_status: "completed"
};

export const getAnalyticsData = async (courseId: string): Promise<AnalyticsData | null> => {
  try {
    console.log('Fetching analytics data for course:', courseId);
    
    // Try to fetch from course_closures table first
    const { data, error } = await supabase
      .from('course_closures')
      .select('closure_data')
      .eq('course_instance_id', parseInt(courseId))
      .single();
    
    if (error) {
      console.log('No analytics data found in database, using sample data:', error);
      return sampleAnalyticsData;
    }
    
    // For now, return sample data since analytics_data column doesn't exist yet
    // In the future, this will check data.analytics_data
    console.log('Using sample analytics data for development');
    return sampleAnalyticsData;
  } catch (error) {
    console.error('Analytics service error:', error);
    // Fallback to sample data
    return sampleAnalyticsData;
  }
};

export const calculatePerformanceTiers = (studentData: AnalyticsData['student_performance_data']): PerformanceTier[] => {
  const tiers = [
    { name: 'Exceptional (90+)', min: 90, max: 100, color: '#10B981' },
    { name: 'Proficient (85-89)', min: 85, max: 89, color: '#3B82F6' },
    { name: 'Developing (70-84)', min: 70, max: 84, color: '#F59E0B' },
    { name: 'At Risk (<70)', min: 0, max: 69, color: '#EF4444' }
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

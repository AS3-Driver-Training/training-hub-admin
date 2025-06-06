
export interface AnalyticsData {
  report_id: string;
  metadata: {
    generated_at: string;
    course_program: string;
    course_date: string;
    course_client: string; // This should now come from course_instances.host_client_id relationship
    total_students: number;
    api_model: string;
  };
  source_data: {
    course_metadata: {
      course_info: {
        units: string;
        country: string;
        program: string;
        date: string;
        client: string;
      };
      vehicles: Array<{
        car: number;
        make: string;
        model: string;
        year: number;
        latAcc: number;
      }>;
      students: Array<{
        id: string;
        name: string;
      }>;
    };
    group_data: {
      group_average_slalom_runs: number;
      group_average_slalom_prcnt_completed: number;
      group_average_slalom_vehicle_control: number;
      group_average_lnch_runs: number;
      group_average_lnch_vehicle_control: number;
      Final_Excersise_Group_Avg_Time: string;
      Final_Excersise_Group_Avg_Performance: number;
      group_average_overall_score: number;
    };
  };
  anthropic_response: {
    executive_summary: {
      title: string;
      content: string;
      generated_at: string;
      has_error: boolean;
    };
    performance_distribution: {
      title: string;
      content: string;
      generated_at: string;
      has_error: boolean;
    };
    stress_performance_analysis: {
      title: string;
      content: string;
      generated_at: string;
      has_error: boolean;
    };
    exercise_breakdown: {
      slalom: {
        title: string;
        content: string;
        generated_at: string;
        has_error: boolean;
      };
      barricade_evasion: {
        title: string;
        content: string;
        generated_at: string;
        has_error: boolean;
      };
      final_multidisciplinary_exercise: {
        title: string;
        content: string;
        generated_at: string;
        has_error: boolean;
      };
    };
    risk_assessment_recommendations: {
      title: string;
      content: string;
      generated_at: string;
      has_error: boolean;
    };
  };
  student_performance_data: Array<StudentPerformanceData>;
  endpoint_ready: boolean;
  processing_status: string;
}

export interface StudentPerformanceData {
  // Legacy fields (keeping for backward compatibility)
  name: string;
  overall_score: number;
  slalom_control: number;
  slalom_attempts: number;
  evasion_control: number;
  evasion_attempts: number;
  low_stress_score: number;
  high_stress_score: number;
  
  // Enhanced fields from your JSON data
  program?: string;
  date?: string;
  vehicle?: string;
  company?: string;
  comments?: string;
  
  // Primary composite scores
  slalom_score?: number;
  lnch_score?: number;
  reverse_score?: number;
  final_ex_score?: number;
  
  // Slalom exercise raw data
  s_no_runs?: number;
  s_practice_runs?: number;
  s_passed?: number;
  s_runs_until_pass?: number;
  prcnt_s_pass?: number;
  slalom_max?: number;
  s_avg_vehicle_prcnt?: number;
  s_avg_exercise_prcnt?: number;
  
  // Lane change exercise raw data
  lc_no_runs?: number;
  lc_practice_runs?: number;
  lc_passed?: number;
  lc_runs_until_pass?: number;
  prcnt_lc_pass?: number;
  lane_change_max?: number;
  lc_avg_vehicle_prcnt?: number;
  lc_avg_exercise_prcnt?: number;
  
  // Final exercise derived data
  final_result?: number;
  penalties?: number;
  reverse_time?: number;
  
  // Final exercise detailed attempts
  final_exercise_details?: Array<FinalExerciseAttempt>;
}

export interface FinalExerciseAttempt {
  car_id: number;
  stress: 'Low' | 'High';
  rev_slalom: string;
  rev_pc: number;
  slalom: number;
  lnch: number;
  cones: number;
  gates: number;
  f_time: string;
  final_result: number;
  f_time_seconds: number;
  rev_slalom_seconds: number;
  exercise_id: number;
}

export interface PerformanceTier {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export interface StressResponse {
  category: 'enhanced' | 'resilient' | 'affected';
  color: string;
}


export interface AnalyticsData {
  report_id: string;
  metadata: {
    generated_at: string;
    course_program: string;
    course_date: string;
    course_client: string;
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
  student_performance_data: Array<{
    name: string;
    overall_score: number;
    slalom_control: number;
    slalom_attempts: number;
    evasion_control: number;
    evasion_attempts: number;
    low_stress_score: number;
    high_stress_score: number;
    final_result?: number;
    penalties?: number;
    reverse_time?: number;
  }>;
  endpoint_ready: boolean;
  processing_status: string;
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


import { StudentPerformanceData, FinalExerciseAttempt } from "@/types/analytics";

export interface RawStudentData {
  fullname: string;
  program: string;
  date: string;
  vehicle: string;
  s_no_runs: number;
  s_practice_runs: number;
  s_passed: number;
  s_runs_until_pass: number;
  prcnt_s_pass: number;
  slalom_max: number;
  s_avg_vehicle_prcnt: number;
  s_avg_exercise_prcnt: number;
  lc_no_runs: number;
  lc_practice_runs: number;
  lc_passed: number;
  lc_runs_until_pass: number;
  prcnt_lc_pass: number;
  'lane change_max': number;
  lc_avg_vehicle_prcnt: number;
  lc_avg_exercise_prcnt: number;
  comments: string;
  company: string;
  overall_score: number;
  score_details: {
    slalom_score: number;
    lnch_score: number;
    reverse_score: number;
    final_ex_score: number;
  };
  final_exercise_details: Array<{
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
  }>;
}

export const transformRawDataToAnalytics = (rawData: RawStudentData[]): StudentPerformanceData[] => {
  return rawData.map(student => transformStudentData(student));
};

export const transformStudentData = (rawStudent: RawStudentData): StudentPerformanceData => {
  // Calculate derived final exercise metrics
  const finalExerciseMetrics = calculateFinalExerciseMetrics(rawStudent.final_exercise_details);
  
  // Calculate stress scores from final exercise attempts
  const stressScores = calculateStressScores(rawStudent.final_exercise_details);
  
  return {
    // Legacy fields for backward compatibility
    name: rawStudent.fullname,
    overall_score: rawStudent.overall_score,
    slalom_control: rawStudent.slalom_max,
    slalom_attempts: rawStudent.s_runs_until_pass,
    evasion_control: rawStudent['lane change_max'],
    evasion_attempts: rawStudent.lc_runs_until_pass,
    low_stress_score: stressScores.lowStress,
    high_stress_score: stressScores.highStress,
    
    // Enhanced fields from JSON
    program: rawStudent.program,
    date: rawStudent.date,
    vehicle: rawStudent.vehicle,
    company: rawStudent.company,
    comments: rawStudent.comments,
    
    // Primary composite scores
    slalom_score: rawStudent.score_details.slalom_score,
    lnch_score: rawStudent.score_details.lnch_score,
    reverse_score: rawStudent.score_details.reverse_score,
    final_ex_score: rawStudent.score_details.final_ex_score,
    
    // Slalom exercise raw data
    s_no_runs: rawStudent.s_no_runs,
    s_practice_runs: rawStudent.s_practice_runs,
    s_passed: rawStudent.s_passed,
    s_runs_until_pass: rawStudent.s_runs_until_pass,
    prcnt_s_pass: rawStudent.prcnt_s_pass,
    slalom_max: rawStudent.slalom_max,
    s_avg_vehicle_prcnt: rawStudent.s_avg_vehicle_prcnt,
    s_avg_exercise_prcnt: rawStudent.s_avg_exercise_prcnt,
    
    // Lane change exercise raw data
    lc_no_runs: rawStudent.lc_no_runs,
    lc_practice_runs: rawStudent.lc_practice_runs,
    lc_passed: rawStudent.lc_passed,
    lc_runs_until_pass: rawStudent.lc_runs_until_pass,
    prcnt_lc_pass: rawStudent.prcnt_lc_pass,
    lane_change_max: rawStudent['lane change_max'],
    lc_avg_vehicle_prcnt: rawStudent.lc_avg_vehicle_prcnt,
    lc_avg_exercise_prcnt: rawStudent.lc_avg_exercise_prcnt,
    
    // Final exercise derived data
    final_result: finalExerciseMetrics.averageFinalResult,
    penalties: finalExerciseMetrics.averagePenalties,
    reverse_time: finalExerciseMetrics.averageReverseTime,
    
    // Final exercise detailed attempts
    final_exercise_details: rawStudent.final_exercise_details.map(attempt => ({
      car_id: attempt.car_id,
      stress: attempt.stress,
      rev_slalom: attempt.rev_slalom,
      rev_pc: attempt.rev_pc,
      slalom: attempt.slalom,
      lnch: attempt.lnch,
      cones: attempt.cones,
      gates: attempt.gates,
      f_time: attempt.f_time,
      final_result: attempt.final_result,
      f_time_seconds: attempt.f_time_seconds,
      rev_slalom_seconds: attempt.rev_slalom_seconds,
      exercise_id: attempt.exercise_id
    } as FinalExerciseAttempt))
  };
};

const calculateFinalExerciseMetrics = (attempts: RawStudentData['final_exercise_details']) => {
  if (!attempts || attempts.length === 0) {
    return {
      averageFinalResult: 0,
      averagePenalties: 0,
      averageReverseTime: 0
    };
  }
  
  const totalFinalResult = attempts.reduce((sum, attempt) => sum + attempt.final_result, 0);
  const totalPenalties = attempts.reduce((sum, attempt) => sum + attempt.cones + attempt.gates, 0);
  const totalReverseTime = attempts.reduce((sum, attempt) => sum + attempt.rev_slalom_seconds, 0);
  
  return {
    averageFinalResult: Math.round(totalFinalResult / attempts.length),
    averagePenalties: Math.round(totalPenalties / attempts.length),
    averageReverseTime: Math.round(totalReverseTime / attempts.length)
  };
};

const calculateStressScores = (attempts: RawStudentData['final_exercise_details']) => {
  if (!attempts || attempts.length === 0) {
    return { lowStress: 0, highStress: 0 };
  }
  
  const lowStressAttempts = attempts.filter(attempt => attempt.stress === 'Low');
  const highStressAttempts = attempts.filter(attempt => attempt.stress === 'High');
  
  const lowStressAvg = lowStressAttempts.length > 0 
    ? lowStressAttempts.reduce((sum, attempt) => sum + attempt.final_result, 0) / lowStressAttempts.length
    : 0;
    
  const highStressAvg = highStressAttempts.length > 0
    ? highStressAttempts.reduce((sum, attempt) => sum + attempt.final_result, 0) / highStressAttempts.length
    : 0;
  
  return {
    lowStress: Math.round(lowStressAvg),
    highStress: Math.round(highStressAvg)
  };
};

export const validateAndTransformAnalyticsData = (data: any): any => {
  // If the data already has the new format, return as is
  if (data.student_performance_data && data.student_performance_data[0]?.final_exercise_details) {
    return data;
  }
  
  // If we have raw student data that needs transformation
  if (Array.isArray(data) && data[0]?.fullname) {
    console.log('Transforming raw student data to analytics format');
    const transformedStudents = transformRawDataToAnalytics(data);
    
    // Return in the expected analytics format
    return {
      ...data,
      student_performance_data: transformedStudents
    };
  }
  
  return data;
};

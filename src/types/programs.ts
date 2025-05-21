
export interface Program {
  id: string;
  name: string;
  sku: string;
  description: string;
  durationDays: number;
  maxStudents: number;
  minStudents: number;
  price: number;
  lvl: string; // Using string type for level values (Basic, Intermediate, Advanced)
  measured?: boolean;
  exercises?: ProgramExercise[]; // Will be maintained in the background only
}

export interface ProgramExercise {
  id: string;
  name: string;
  isCore: boolean;
  isMeasured: boolean;
  measurementType: 'latacc' | 'time';
  order: number;
  parameters?: ExerciseParameter[]; // This will be empty at program level now
}

export interface ExerciseParameter {
  id: string;
  name: string;
  value: number;
}

// New interfaces for course-specific data

export interface CourseExerciseValue {
  id: string;
  courseInstanceId: number;
  exerciseId: string;
  parameters: CourseParameter[];
  results?: ExerciseResult[];
}

export interface CourseParameter {
  id: string;
  name: string;
  value: number;
}

export interface ExerciseResult {
  id: string;
  studentId: string;
  vehicleId: number;
  value: number; // The measured value
  penaltyPoints?: number;
  notes?: string;
}

// Enhanced vehicle interface that includes year and more detailed properties
export interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  latAcc: number;
}

// New interfaces for the complex final exercise parameters

export interface SlalomParameters {
  chord: number;
  mo: number; // Maximum offset
}

export interface LaneChangeParameters {
  chord: number;
  mo: number; // Maximum offset
}

export interface FinalExerciseParameters {
  ideal_time_sec: number;
  cone_penalty_sec: number;
  door_penalty_sec: number;
  slalom: SlalomParameters;
  lane_change: LaneChangeParameters;
  reverse_time?: number;
}

export interface CourseLayout {
  final_exercise: FinalExerciseParameters;
  slalom: SlalomParameters;
  lane_change: LaneChangeParameters;
}

export interface CourseInfo {
  units: string; // "MPH" or "KPH"
  country: string;
  program: string;
  date: string;
  client: string;
}

export interface CourseVehicle {
  car: number;
  make: string;
  model?: string;
  year?: number;
  latAcc: number;
}

export interface CourseClosureData {
  course_info: CourseInfo;
  vehicles: CourseVehicle[];
  course_layout: CourseLayout;
  notes?: string; // Adding notes field here
}


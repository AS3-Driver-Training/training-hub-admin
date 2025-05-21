
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
  exercises?: ProgramExercise[];
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

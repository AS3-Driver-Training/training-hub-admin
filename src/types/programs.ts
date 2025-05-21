
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
  parameters?: ExerciseParameter[];
}

export interface ExerciseParameter {
  id: string;
  name: string;
  value: number;
}

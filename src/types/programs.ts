
export interface Program {
  id: string;
  name: string;
  sku: string;
  description: string;
  durationDays: number;
  maxStudents: number;
  minStudents: number;
  price: number;
  lvl: string; // Adding the level field
}

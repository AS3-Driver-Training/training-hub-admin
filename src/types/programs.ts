
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
}


export interface TrainingEvent {
  id: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  capacity: number;
  enrolledCount: number;
  clientName: string | null;
  isOpenEnrollment: boolean;
}

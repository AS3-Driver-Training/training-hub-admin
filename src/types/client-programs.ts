
export interface ClientProgram {
  id: string;
  client_id: string;
  name: string;
  description?: string;
  duration_days: number;
  start_time?: string;
  end_time?: string;
  location_type: 'physical' | 'virtual' | 'hybrid';
  location_name?: string;
  location_address?: string;
  google_place_id?: string;
  google_location?: string;
  enrollment_type: 'open' | 'invitation' | 'team_specific';
  max_participants?: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ClientProgramInstance {
  id: string;
  client_program_id: string;
  start_date: string;
  end_date?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  actual_participants: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  client_program?: ClientProgram;
}

export interface ClientProgramEnrollment {
  id: string;
  client_program_instance_id: string;
  student_id: string;
  enrollment_status: 'enrolled' | 'completed' | 'cancelled' | 'no_show';
  enrolled_at: string;
  completed_at?: string;
  notes?: string;
}

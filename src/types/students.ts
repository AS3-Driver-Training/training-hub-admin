
export interface Student {
  id: string;
  user_id?: string;
  team_id: string;
  employee_number?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface SessionAttendee {
  id: string;
  student_id: string;
  course_instance_id: number;
  status: 'pending' | 'confirmed' | 'unable';
  attendance_confirmed_at?: string;
  special_requests?: string;
  reschedule_request?: string;
  reschedule_preferred_dates?: string;
  created_at: string;
  updated_at: string;
}

export interface StudentWithRelations extends Student {
  teams?: {
    name: string;
    group_id: string;
    groups?: {
      name: string;
      client_id: string;
      clients?: {
        name: string;
      };
    };
  };
}

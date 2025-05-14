
// Define client role types
export type ClientRole = 'client_admin' | 'manager' | 'supervisor';

// Team structure
export interface Team {
  id: string;
  name: string;
  group_id: string;
  group?: {
    id: string;
    name: string;
    description: string | null;
    is_default: boolean | null;
  };
}

// Group structure
export interface Group {
  id: string;
  name: string;
  description: string | null;
  is_default: boolean | null;
  client_id: string;
  teams: Team[];
}

// For backward compatibility
export interface GroupData extends Group {}
export interface TeamData extends Team {}

// User data structure for the client settings
export interface UserData {
  id: string;
  user_id: string;
  client_id: string;
  role: ClientRole;
  status: string;
  created_at: string;
  updated_at: string;
  email: string;
  profiles: {
    first_name: string;
    last_name: string;
  };
  groups: Group[];
  teams: Team[];
}


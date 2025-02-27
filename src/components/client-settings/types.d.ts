
// If this file doesn't exist, we'll create it with the necessary type definitions
// for our UserData interface and related types

export interface UserData {
  id: string;
  user_id: string;
  client_id: string;
  role: 'client_admin' | 'manager' | 'supervisor';
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

export interface Group {
  id: string;
  name: string;
  description?: string;
  is_default?: boolean;
  teams?: Team[];
}

export interface Team {
  id: string;
  name: string;
  group_id: string;
  group?: Group;
}

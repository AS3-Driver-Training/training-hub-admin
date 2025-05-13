
export interface UserData {
  id: string;
  role: 'client_admin' | 'manager' | 'supervisor' | string;
  status: string;
  user_id: string;
  client_id: string;
  created_at: string;
  updated_at: string;
  email: string;
  profiles: {
    first_name: string;
    last_name: string;
  };
  groups: Array<GroupData>;
  teams: Array<TeamData>;
}

export interface GroupData {
  id: string;
  name: string;
  description: string;
  is_default: boolean;
  client_id: string;
  teams: Array<{ id: string; name: string; group_id: string }>;
}

export interface TeamData {
  id: string;
  name: string;
  group_id: string;
  group?: {
    id: string;
    name: string;
    description: string;
    is_default: boolean;
  };
}

export interface Group {
  id: string;
  name: string;
  description: string;  
  is_default: boolean;
  client_id: string;
  teams: Array<Team>;  
}

export interface Team {
  id: string;
  name: string;
  group_id: string;
}

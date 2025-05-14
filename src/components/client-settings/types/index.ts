
export type ClientRole = 'client_admin' | 'manager' | 'supervisor';

export interface UserData {
  id: string;
  user_id: string | null;
  client_id: string;
  role: ClientRole;
  status: string;
  created_at: string;
  updated_at: string;
  email: string;
  last_login?: string | null;
  is_invitation?: boolean;
  invitationId?: string;
  clientName?: string; // Add this for use in invitation emails
  profiles: {
    first_name: string | null;
    last_name: string | null;
  };
  groups: Array<Group>;
  teams: Array<Team>;
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
  description: string | null;  
  is_default: boolean | null;
  client_id: string;
  teams: Array<Team>;  
}

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

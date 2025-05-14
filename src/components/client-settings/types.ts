export interface Group {
  id: string;
  client_id: string;
  name: string;
  description: string | null;
  is_default: boolean | null;
  created_at: string;
  updated_at: string;
  teams?: Team[];
}

export interface Team {
  id: string;
  group_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface ClientRole {
  role: 'client_admin' | 'manager' | 'supervisor';
}

export type ClientUserRole = 'client_admin' | 'manager' | 'supervisor';

export interface UserData {
  id: string;
  user_id: string | null;
  client_id: string;
  role: ClientUserRole;
  status: string;
  created_at: string;
  updated_at: string;
  email: string;
  profiles: {
    first_name: string;
    last_name: string;
  };
  groups: Group[];
  teams: any[];
  // New field to identify invitations
  is_invitation?: boolean;
  // Store invitation ID for invitation management
  invitation_id?: string;
}


export type ClientRole = "client_admin" | "manager" | "supervisor";

export interface Group {
  id: string;
  client_id: string;
  name: string;
  description: string | null;
  is_default: boolean | null;
  created_at?: string; // Making these optional to fix type error
  updated_at?: string; // Making these optional to fix type error
  teams: Team[];
}

export interface Team {
  id: string;
  group_id: string;
  name: string;
}

export interface UserData {
  id: string;
  user_id: string | null;
  email: string;
  role: ClientRole;
  status: string;
  first_name: string | null;
  last_name: string | null;
  last_login: string | null;
  is_invitation?: boolean;
  invitationId?: string;
  groups?: Group[];
  teams?: {
    id: string;
    name: string;
    group: {
      id: string;
      name: string;
      description: string | null;
      is_default: boolean | null;
    };
  }[];
}

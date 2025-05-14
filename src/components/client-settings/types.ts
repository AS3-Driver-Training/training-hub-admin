
import { Database } from "@/integrations/supabase/types";

// Type Aliases from Supabase Database
export type ClientRole = Database["public"]["Enums"]["client_role"];
export type AppRole = Database["public"]["Enums"]["app_role"];

// Group structure that includes team information
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

export interface Group {
  id: string;
  name: string;
  description: string | null;
  is_default: boolean | null;
  client_id: string;
  teams: Team[];
}

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
    first_name: string | null;
    last_name: string | null;
  };
  groups: Group[];
  teams: Team[];
}

// Structure for client data
export interface ClientData {
  id: string;
  name: string;
  status: string;
  contact_email?: string | null;
  logo_url?: string | null;
  primary_color?: string | null;
  secondary_color?: string | null;
  created_at: string;
  updated_at: string;
}

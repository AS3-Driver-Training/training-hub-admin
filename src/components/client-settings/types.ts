
export interface ClientSettingsData {
  id: string;
  name: string;
  description: string;
  logo_url: string;
  website_url: string;
  support_email: string;
  support_phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  timezone: string;
  currency: string;
  date_format: string;
  time_format: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  groups: GroupData[];
}

// Base interface for shared group properties
export interface GroupBase {
  id: string;
  name: string;
  description: string;
  is_default: boolean;
  teams: TeamData[]; // Making teams required in the base interface
}

// GroupData is used in the ClientSettingsData interface
export interface GroupData extends GroupBase {
  client_id: string; // Required in GroupData
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
  groups: GroupData[];
  teams: TeamData[];
}

// Group is used elsewhere in the application
export interface Group extends GroupBase {
  client_id: string; // Required in Group as well
}

export interface Team {
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

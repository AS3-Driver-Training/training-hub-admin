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

export interface GroupData {
  id: string;
  name: string;
  description: string;
  is_default: boolean;
  teams: TeamData[];
}

export interface TeamData {
  id: string;
  name: string;
  group_id: string;
}

export interface UserData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  groups: GroupData[];
  teams: TeamData[];
}

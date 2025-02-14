
export interface UserData {
  id: string;
  role: string;
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
  groups: Array<{ id: string; name: string }>;
  teams: Array<{ id: string; name: string }>;
}

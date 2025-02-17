
export type AppRole = 'superadmin' | 'admin' | 'staff';

export interface InternalUser {
  id: string;
  email: string | null;
  role: AppRole;
  status: string;
  first_name: string;
  last_name: string;
  title: string;
  created_at: string;
  last_login: string | null;
}

export interface EditUserFormData {
  first_name: string;
  last_name: string;
  title: string;
  role: AppRole;
}

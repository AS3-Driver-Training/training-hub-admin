
export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  enrolled: boolean;
}

export interface Client {
  id: string;
  name: string;
}

export interface Group {
  id: string;
  name: string;
  client_id: string;
  is_default?: boolean;
}

export interface Team {
  id: string;
  name: string;
  group_id: string;
}

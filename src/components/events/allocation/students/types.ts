
export interface StudentFormValues {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  employee_number?: string;
  client_id?: string;
  status?: string; // Add the status field as optional
}

export interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  employee_number?: string;
  status: string;
  enrolled?: boolean;
}

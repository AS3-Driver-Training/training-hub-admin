
export interface Venue {
  id: string;
  name: string;
  short_name: string;  // Using snake_case for DB field names
  address: string;
  google_location: string;  // Using snake_case for DB field names 
  region: string;
}

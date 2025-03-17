
export interface Venue {
  id: string;
  name: string;
  short_name: string;  // Changed from shortName to match DB fields
  address: string;
  google_location: string;  // Changed from googleLocation to match DB fields
  region: string;
}



export interface Venue {
  id: string;
  name: string;
  short_name: string;  // Snake case for DB field names
  address: string;
  google_location: string;  // Snake case for DB field names 
  region: string;
  country: string;  // Added country field
}

// We'll add a client-side version of the venue with camelCase properties
export interface VenueDisplay {
  id: string;
  name: string;
  shortName: string;  // Camel case for client-side usage
  address: string;
  googleLocation: string;  // Camel case for client-side usage
  region: string;
  country: string;  // Added country field
}

// Utility function to convert between DB and display formats
export const toVenueDisplay = (venue: Venue): VenueDisplay => ({
  id: venue.id,
  name: venue.name,
  shortName: venue.short_name,
  address: venue.address,
  googleLocation: venue.google_location,
  region: venue.region,
  country: venue.country,
});

export const toVenueModel = (venue: VenueDisplay): Venue => ({
  id: venue.id,
  name: venue.name,
  short_name: venue.shortName,
  address: venue.address,
  google_location: venue.googleLocation,
  region: venue.region,
  country: venue.country,
});

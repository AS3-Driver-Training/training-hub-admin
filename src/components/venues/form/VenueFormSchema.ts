
import { z } from "zod";

export const venueSchema = z.object({
  place: z.string().min(1, "Place search is required"),
  name: z.string().min(1, "Venue name is required"),
  shortName: z.string().min(1, "Short name is required"),
  address: z.string().min(1, "Address is required"),
  googleLocation: z.string().optional(),
  region: z.string().min(1, "Region is required"),
  country: z.string().length(2, "Country must be a valid 2-letter code"),
});

export type VenueFormValues = z.infer<typeof venueSchema>;

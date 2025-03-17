
import { z } from "zod";

export const venueSchema = z.object({
  place: z.string().min(1, "Place name is required"),
  name: z.string().optional(),
  shortName: z.string().min(1, "Short name is required"),
  address: z.string().min(1, "Address is required"),
  googleLocation: z.string(),
  region: z.string().min(1, "Region is required"),
  country: z.string().optional(),
});

export type VenueFormValues = z.infer<typeof venueSchema>;


import { z } from "zod";

export const venueSchema = z.object({
  name: z.string().min(1, "Name is required"),
  shortName: z.string().min(1, "Short name is required"),
  address: z.string().min(1, "Address is required"),
  googleLocation: z.string(),
  region: z.string().min(1, "Region is required"),
});

export type VenueFormValues = z.infer<typeof venueSchema>;

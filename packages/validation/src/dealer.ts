import { z } from "zod";
import { addressSchema } from "./address";
import { emailSchema } from "./auth";

export const dealerRegistrationSchema = z.object({
  companyName: z.string().trim().min(1, "Firmenname erforderlich").max(150),
  legalForm: z.string().trim().max(50).optional(),
  contactFirstName: z.string().trim().min(1).max(100),
  contactLastName: z.string().trim().min(1).max(100),
  contactEmail: emailSchema,
  contactPhone: z.string().trim().min(1, "Telefonnummer erforderlich").max(30),
  website: z.string().trim().url("Ungültige URL").optional().or(z.literal("")),
  vatId: z.string().trim().max(20).optional(),
  address: addressSchema,
  description: z.string().trim().max(2000).optional(),
});
export type DealerRegistrationInput = z.infer<typeof dealerRegistrationSchema>;

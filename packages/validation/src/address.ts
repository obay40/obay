import { z } from "zod";

export const addressSchema = z.object({
  street: z.string().trim().min(1, "Straße erforderlich").max(150),
  houseNumber: z.string().trim().min(1, "Hausnummer erforderlich").max(20),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{5}$/, "PLZ muss aus 5 Ziffern bestehen"),
  city: z.string().trim().min(1, "Ort erforderlich").max(100),
  country: z.string().trim().min(2).max(2).default("DE"),
});
export type AddressInput = z.infer<typeof addressSchema>;

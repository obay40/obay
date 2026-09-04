import { z } from "zod";
import { addressSchema } from "./address";
import { emailSchema, passwordSchema } from "./auth";

export const dealerRegistrationSchema = z.object({
  companyName: z.string().trim().min(1, "Firmenname erforderlich").max(150),
  legalForm: z.string().trim().max(50).optional(),
  contactFirstName: z.string().trim().min(1).max(100),
  contactLastName: z.string().trim().min(1).max(100),
  contactEmail: emailSchema,
  contactPhone: z.string().trim().min(1, "Telefonnummer erforderlich").max(30),
  website: z.string().trim().url("Ungültige URL").optional().or(z.literal("")),
  vatId: z.string().trim().max(20).optional(),
  commercialRegisterNumber: z.string().trim().max(50).optional(),
  address: addressSchema,
  description: z.string().trim().max(2000).optional(),
});
export type DealerRegistrationInput = z.infer<typeof dealerRegistrationSchema>;

/**
 * Vollständige Händlerregistrierung = eigenes Login-Konto (E-Mail/Passwort,
 * getrennt vom einfachen Kunden-Registrierungsformular) + Firmendaten.
 * Bewusst kein Feld für den Gewerbenachweis selbst - die Datei kommt als
 * separater multipart/form-data-Teil (siehe
 * apps/web/src/app/api/v1/dealers/register/route.ts), nicht als JSON.
 */
export const dealerAccountRegistrationSchema = dealerRegistrationSchema.extend({
  password: passwordSchema,
  acceptedTerms: z.literal(true, {
    errorMap: () => ({ message: "Den AGB und der Datenschutzerklärung muss zugestimmt werden" }),
  }),
});
export type DealerAccountRegistrationInput = z.infer<typeof dealerAccountRegistrationSchema>;

/**
 * Gewerbenachweis-Upload (siehe Aufgabenstellung "GEWERBENACHWEIS IST
 * WICHTIG" / "DATEI-UPLOAD SICHERN"). Diese Grenzwerte werden sowohl vom
 * Formular (Client-Vorprüfung, bessere Fehlermeldung) als auch vom
 * API-Endpunkt (verbindliche Prüfung, siehe
 * apps/web/src/app/api/v1/dealers/register/route.ts) verwendet - eine
 * Client-Prüfung allein reicht nie aus.
 */
export const DEALER_VERIFICATION_DOCUMENT_MAX_SIZE_BYTES = 10 * 1024 * 1024;
export const DEALER_VERIFICATION_DOCUMENT_ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
] as const;

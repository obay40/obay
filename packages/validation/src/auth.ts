import { z } from "zod";

export const emailSchema = z.string().trim().toLowerCase().email("Ungültige E-Mail-Adresse");

export const passwordSchema = z
  .string()
  .min(10, "Passwort muss mindestens 10 Zeichen lang sein")
  .max(128, "Passwort ist zu lang")
  .refine((value) => /[a-z]/.test(value), "Passwort muss einen Kleinbuchstaben enthalten")
  .refine((value) => /[A-Z]/.test(value), "Passwort muss einen Großbuchstaben enthalten")
  .refine((value) => /[0-9]/.test(value), "Passwort muss eine Ziffer enthalten");

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z.string().trim().min(1, "Vorname erforderlich").max(100),
  lastName: z.string().trim().min(1, "Nachname erforderlich").max(100),
  phone: z.string().trim().max(30).optional(),
  acceptedTerms: z.literal(true, {
    errorMap: () => ({ message: "Den AGB und der Datenschutzerklärung muss zugestimmt werden" }),
  }),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Passwort erforderlich"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const requestPasswordResetSchema = z.object({
  email: emailSchema,
});
export type RequestPasswordResetInput = z.infer<typeof requestPasswordResetSchema>;

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

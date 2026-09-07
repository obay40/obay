export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Transaktionale E-Mails (Registrierung, Passwort-Reset, Angebotsbenachrichtigungen, ...).
 * TODO(email): Produktionsimplementierung an einen echten Anbieter anbinden
 * (z. B. Resend/Postmark) über EMAIL_PROVIDER_KEY.
 */
export interface EmailProvider {
  readonly id: string;
  send(params: SendEmailParams): Promise<void>;
}

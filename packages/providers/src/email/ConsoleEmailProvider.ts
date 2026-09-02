import type { EmailProvider, SendEmailParams } from "./EmailProvider";

/** Loggt E-Mails statt sie zu versenden – für lokale Entwicklung. */
export class ConsoleEmailProvider implements EmailProvider {
  readonly id = "console-v1";

  async send(params: SendEmailParams): Promise<void> {
    console.log(`[ConsoleEmailProvider] An: ${params.to} | Betreff: ${params.subject}`);
  }
}

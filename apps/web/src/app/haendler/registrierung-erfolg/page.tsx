import Link from "next/link";
import { Container } from "@/components/ui/Container";

export const metadata = { title: "Registrierung erhalten" };

/**
 * Statusseite direkt nach der Händlerregistrierung (siehe Aufgabenstellung
 * "NACH REGISTRIERUNG") - täuscht bewusst KEINE sofortige Freischaltung
 * vor, sondern beschreibt den tatsächlichen Prüf-Workflow.
 */
export default function DealerRegistrationSuccessPage() {
  return (
    <Container className="py-24">
      <div className="mx-auto max-w-lg text-center">
        <span className="bg-brand-50 text-brand-700 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium">
          Prüfung läuft
        </span>
        <h1 className="text-navy-900 mt-4 text-2xl font-bold">
          Vielen Dank für Ihre Registrierung.
        </h1>
        <p className="text-navy-600 mt-3">
          Ihre Händlerdaten werden von Autoklick24 geprüft. Sie erhalten eine Nachricht, sobald
          Ihr Händlerkonto freigeschaltet wurde.
        </p>
        <Link
          href="/haendler/login"
          className="text-brand-600 hover:text-brand-700 mt-6 inline-block text-sm font-medium"
        >
          Zum Händlerlogin
        </Link>
      </div>
    </Container>
  );
}

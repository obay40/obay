import { LegalPlaceholder } from "@/components/ui/LegalPlaceholder";

export const metadata = { title: "Cookie-Einstellungen" };

export default function CookiesPage() {
  return (
    <LegalPlaceholder title="Cookie-Einstellungen">
      <h2>Technisch notwendige Cookies</h2>
      <p>
        Diese Cookies sind für den Betrieb der Website erforderlich (z. B. Login-Sitzung) und können
        nicht deaktiviert werden.
      </p>
      <h2>Optionale Technologien</h2>
      <p>
        Nicht notwendige Tracking- oder Analysetechnologien werden erst nach ausdrücklicher
        Zustimmung geladen. Ein interaktives Consent-Banner mit granularer Auswahl wird in einer
        späteren Phase ergänzt.
      </p>
    </LegalPlaceholder>
  );
}

import { LegalPlaceholder } from "@/components/ui/LegalPlaceholder";

export const metadata = { title: "Datenschutz" };

export default function DatenschutzPage() {
  return (
    <LegalPlaceholder title="Datenschutzerklärung">
      <h2>1. Verantwortlicher</h2>
      <p>[Verantwortliche Stelle gemäß Art. 4 Nr. 7 DSGVO einsetzen]</p>
      <h2>2. Verarbeitete Daten</h2>
      <p>
        Bei der Nutzung von Autoklick24 werden u. a. folgende Datenkategorien verarbeitet:
        Kontaktdaten, Fahrzeugdaten, Kontodaten, Nutzungsdaten. [Details je Funktion final
        ausformulieren.]
      </p>
      <h2>3. Zwecke der Verarbeitung</h2>
      <p>[Zwecke wie Vertragsabwicklung, Kommunikation, Sicherheit final ausformulieren.]</p>
      <h2>4. Betroffenenrechte</h2>
      <p>
        Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit, Widerspruch gemäß
        Art. 15–21 DSGVO.
      </p>
      <h2>5. Cookies</h2>
      <p>
        Details zu eingesetzten Cookies und Trackingtechnologien siehe{" "}
        <a href="/cookies" className="text-brand-600 hover:text-brand-700">
          Cookie-Einstellungen
        </a>
        .
      </p>
    </LegalPlaceholder>
  );
}

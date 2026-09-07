import { LegalPlaceholder } from "@/components/ui/LegalPlaceholder";

export const metadata = { title: "AGB" };

export default function AgbPage() {
  return (
    <LegalPlaceholder title="Allgemeine Geschäftsbedingungen">
      <h2>1. Geltungsbereich</h2>
      <p>[Geltungsbereich für Privatkunden und Händler final ausformulieren.]</p>
      <h2>2. Vertragsgegenstand</h2>
      <p>
        Autoklick24 bietet Fahrzeughaltern den Direktankauf, die Vermittlung sowie das eigenständige
        Inserieren von Fahrzeugen an. [Details je Verkaufsweg final ausformulieren.]
      </p>
      <h2>3. Zustandekommen von Verträgen</h2>
      <p>[Final ausformulieren.]</p>
      <h2>4. Pflichten der Nutzer</h2>
      <p>[Final ausformulieren.]</p>
      <h2>5. Haftung</h2>
      <p>[Final ausformulieren.]</p>
    </LegalPlaceholder>
  );
}

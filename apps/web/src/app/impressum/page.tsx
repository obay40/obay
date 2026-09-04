import { LegalPlaceholder } from "@/components/ui/LegalPlaceholder";

export const metadata = { title: "Impressum" };

export default function ImpressumPage() {
  return (
    <LegalPlaceholder title="Impressum">
      <h2>Angaben gemäß § 5 TMG (Platzhalter)</h2>
      <p>
        [Firmenname Autoklick24]
        <br />
        [Straße, Hausnummer]
        <br />
        [PLZ, Ort]
      </p>
      <h2>Vertreten durch</h2>
      <p>[Name der Geschäftsführung]</p>
      <h2>Kontakt</h2>
      <p>
        Telefon: [Telefonnummer]
        <br />
        E-Mail: [E-Mail-Adresse]
      </p>
      <h2>Registereintrag</h2>
      <p>
        Eintragung im Handelsregister.
        <br />
        Registergericht: [Registergericht]
        <br />
        Registernummer: [Registernummer]
      </p>
      <h2>Umsatzsteuer-ID</h2>
      <p>[USt-IdNr. gemäß § 27 a Umsatzsteuergesetz]</p>
    </LegalPlaceholder>
  );
}

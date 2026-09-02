import { LegalPlaceholder } from "@/components/ui/LegalPlaceholder";

export const metadata = { title: "Widerruf" };

export default function WiderrufPage() {
  return (
    <LegalPlaceholder title="Widerrufsbelehrung">
      <h2>Widerrufsrecht</h2>
      <p>
        Verbraucherinnen und Verbrauchern steht unter den gesetzlichen Voraussetzungen ein
        Widerrufsrecht zu. [Frist, Bedingungen und Ausnahmen (z. B. bei individuell bewerteten
        Gebrauchtfahrzeugen) final rechtlich prüfen und ausformulieren.]
      </p>
      <h2>Muster-Widerrufsformular</h2>
      <p>[Final ergänzen.]</p>
    </LegalPlaceholder>
  );
}

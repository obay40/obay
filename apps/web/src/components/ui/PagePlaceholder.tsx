import { Container } from "./Container";

/**
 * Für Routen, die laut Entwicklungsplan (docs/ARCHITECTURE.md) erst in einer
 * späteren Phase gebaut werden. Verlinkt trotzdem schon aus der Navigation,
 * damit die Informationsarchitektur früh sichtbar/testbar ist – ohne
 * vorzutäuschen, dass die Funktion bereits funktioniert.
 */
export function PagePlaceholder({
  title,
  description,
  phase,
}: {
  title: string;
  description: string;
  phase: string;
}) {
  return (
    <Container className="py-24">
      <div className="mx-auto max-w-xl text-center">
        <span className="bg-brand-50 text-brand-700 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium">
          In Entwicklung – {phase}
        </span>
        <h1 className="text-navy-900 mt-4 text-3xl font-bold">{title}</h1>
        <p className="text-navy-600 mt-3">{description}</p>
      </div>
    </Container>
  );
}

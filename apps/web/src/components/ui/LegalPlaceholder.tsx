import { Container } from "./Container";

/**
 * Rechtstexte sind PLATZHALTER und rechtlich ungeprüft. Vor Live-Schaltung
 * MUSS ein Rechtsanwalt/eine Rechtsanwältin die finalen Texte erstellen oder
 * freigeben (siehe Punkt 30 der Produktanforderungen).
 */
export function LegalPlaceholder({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Container className="max-w-3xl py-16">
      <h1 className="text-navy-900 text-2xl font-bold">{title}</h1>
      <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Dieser Text ist ein <strong>rechtlich ungeprüfter Platzhalter</strong> und ersetzt keine
        rechtliche Beratung. Vor Veröffentlichung ist eine Prüfung/Erstellung durch eine
        Rechtsanwältin oder einen Rechtsanwalt erforderlich.
      </div>
      <div className="text-navy-700 [&_h2]:text-navy-900 mt-6 space-y-4 text-sm leading-relaxed [&_h2]:mt-6 [&_h2]:text-base [&_h2]:font-semibold">
        {children}
      </div>
    </Container>
  );
}

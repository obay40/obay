import { Container } from "@/components/ui/Container";

const points = [
  {
    title: "Transparente Abläufe",
    description:
      "Jeder Schritt – von der Bewertung bis zum Verkauf – ist nachvollziehbar dokumentiert.",
  },
  {
    title: "Persönliche Ansprechpartner",
    description: "Bei Ankauf und Vermittlung begleitet dich ein fester Ansprechpartner.",
  },
  {
    title: "Fahrzeugabholung",
    description: "Beim Direktverkauf organisieren wir die Abholung deines Fahrzeugs.",
  },
  {
    title: "Keine versteckten Kosten",
    description: "Konditionen werden vor jeder Zusage klar und verständlich kommuniziert.",
  },
];

export function TrustSection() {
  return (
    <section className="py-16">
      <Container>
        <h2 className="text-navy-900 text-center text-2xl font-bold">Sicherer Fahrzeugverkauf</h2>
        <div className="mx-auto mt-10 grid max-w-4xl gap-6 sm:grid-cols-2">
          {points.map((point) => (
            <div key={point.title} className="border-navy-100 shadow-card rounded-2xl border p-6">
              <h3 className="text-navy-900 font-semibold">{point.title}</h3>
              <p className="text-navy-600 mt-2 text-sm">{point.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

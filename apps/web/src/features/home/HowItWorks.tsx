import { Container } from "@/components/ui/Container";

const steps = [
  {
    title: "Fahrzeug erfassen",
    description: "Fahrzeugdaten, Ausstattung, Zustand und Fotos einmalig eingeben.",
  },
  {
    title: "Weg wählen",
    description: "Direkt verkaufen, vermitteln lassen oder selbst inserieren – du entscheidest.",
  },
  {
    title: "Bewertung erhalten",
    description: "Eine erste, klar als Schätzung gekennzeichnete Preiseinschätzung.",
  },
  {
    title: "Verkauf abschließen",
    description: "Autoklick24 begleitet dich bis zum erfolgreichen Verkauf.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-navy-100 bg-navy-50/50 border-t py-16">
      <Container>
        <h2 className="text-navy-900 text-center text-2xl font-bold">
          So funktioniert der Verkauf
        </h2>
        <ol className="mx-auto mt-10 grid max-w-5xl gap-6 sm:grid-cols-4">
          {steps.map((step, index) => (
            <li key={step.title} className="shadow-card rounded-2xl bg-white p-6">
              <span className="bg-brand-500 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-white">
                {index + 1}
              </span>
              <h3 className="text-navy-900 mt-4 font-semibold">{step.title}</h3>
              <p className="text-navy-600 mt-2 text-sm">{step.description}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

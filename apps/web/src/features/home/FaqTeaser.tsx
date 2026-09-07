import Link from "next/link";
import { Container } from "@/components/ui/Container";

const faqs = [
  {
    question: "Wie zuverlässig ist die Preiseinschätzung?",
    answer:
      "Die angezeigte Marktwert-Spanne ist eine Schätzung auf Basis der von dir angegebenen Fahrzeugdaten. Sie ersetzt keine verbindliche Begutachtung.",
  },
  {
    question: "Was kostet das Inserieren auf Autoklick24?",
    answer:
      "Details zu Konditionen für Privat- und Händlerinserate werden vor jeder Veröffentlichung klar kommuniziert.",
  },
  {
    question: "Kann ich mein Fahrzeug später noch anders verkaufen?",
    answer:
      "Ja. Deine einmal erfassten Fahrzeugdaten kannst du jederzeit für einen anderen Verkaufsweg nutzen.",
  },
];

export function FaqTeaser() {
  return (
    <section className="py-16">
      <Container>
        <h2 className="text-navy-900 text-center text-2xl font-bold">Häufige Fragen</h2>
        <div className="divide-navy-100 border-navy-100 mx-auto mt-10 max-w-2xl divide-y rounded-2xl border">
          {faqs.map((faq) => (
            <div key={faq.question} className="p-6">
              <h3 className="text-navy-900 font-semibold">{faq.question}</h3>
              <p className="text-navy-600 mt-2 text-sm">{faq.answer}</p>
            </div>
          ))}
        </div>
        <p className="text-navy-500 mt-6 text-center text-sm">
          Weitere Fragen?{" "}
          <Link href="/kontakt" className="text-brand-600 hover:text-brand-700 font-medium">
            Kontaktiere uns
          </Link>
          .
        </p>
      </Container>
    </section>
  );
}

import Link from "next/link";
import { Container } from "@/components/ui/Container";

const fields = ["Marke", "Modell", "Preis bis", "Standort"];

export function SearchTeaser() {
  return (
    <section className="border-navy-100 bg-navy-50/50 border-b py-16">
      <Container>
        <div className="border-navy-100 shadow-card mx-auto max-w-3xl rounded-2xl border bg-white p-6 sm:p-8">
          <h2 className="text-navy-900 text-xl font-bold sm:text-2xl">Autos kaufen</h2>
          <p className="text-navy-600 mt-1 text-sm">
            Finde dein nächstes Fahrzeug im Autoklick24 Marktplatz.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {fields.map((field) => (
              <div
                key={field}
                className="border-navy-200 bg-navy-50/60 text-navy-500 rounded-xl border px-3 py-2.5 text-sm"
              >
                {field}
              </div>
            ))}
          </div>

          <Link
            href="/autos"
            className="bg-navy-900 hover:bg-navy-800 mt-6 inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-white transition-colors"
          >
            Fahrzeuge suchen
          </Link>
        </div>
      </Container>
    </section>
  );
}

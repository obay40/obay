import Link from "next/link";
import { Container } from "@/components/ui/Container";

interface WayCard {
  href: string;
  title: string;
  description: string;
  cta: string;
}

const ways: WayCard[] = [
  {
    href: "/auto-verkaufen",
    title: "Auto verkaufen",
    description: "Erhalte ein unverbindliches Angebot von Autoklick24.",
    cta: "Auto verkaufen",
  },
  {
    href: "/auto-vermitteln",
    title: "Auto vermitteln",
    description: "Wir übernehmen die Vermarktung und unterstützen dich beim Verkauf.",
    cta: "Vermittlung starten",
  },
  {
    href: "/auto-inserieren",
    title: "Auto inserieren",
    description: "Verkaufe dein Fahrzeug selbst auf Autoklick24.",
    cta: "Fahrzeug inserieren",
  },
];

export function Hero() {
  return (
    <section className="bg-navy-950 relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(60% 50% at 80% 0%, rgba(47,191,219,0.25) 0%, rgba(47,191,219,0) 60%), radial-gradient(50% 40% at 10% 10%, rgba(43,111,224,0.35) 0%, rgba(43,111,224,0) 60%)",
        }}
        aria-hidden="true"
      />
      <Container className="relative py-16 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-300">
            Auto verkaufen. Klick. Fertig.
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Was möchtest du mit deinem Auto machen?
          </h1>
          <p className="text-navy-200 mt-4 text-base sm:text-lg">
            Ein Fahrzeug, drei Verkaufswege: Du entscheidest, wie du dein Auto verkaufst –
            Autoklick24 begleitet dich dabei.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-5 sm:grid-cols-3">
          {ways.map((way) => (
            <Link
              key={way.href}
              href={way.href}
              className="shadow-card hover:shadow-card-hover group flex flex-col rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-white/10"
            >
              <h2 className="text-lg font-semibold text-white">{way.title}</h2>
              <p className="text-navy-200 mt-2 flex-1 text-sm">{way.description}</p>
              <span className="mt-5 inline-flex items-center text-sm font-semibold text-cyan-300 group-hover:text-cyan-200">
                {way.cta}
                <span
                  aria-hidden="true"
                  className="ml-1 transition-transform group-hover:translate-x-0.5"
                >
                  →
                </span>
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

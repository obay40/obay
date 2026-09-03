import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";

interface FooterColumn {
  title: string;
  links: { href: string; label: string }[];
}

const columns: FooterColumn[] = [
  {
    title: "Autoklick24",
    links: [
      { href: "/ueber-uns", label: "Über uns" },
      { href: "/kontakt", label: "Kontakt" },
      { href: "/hilfe", label: "Hilfe" },
    ],
  },
  {
    title: "Fahrzeuge",
    links: [
      { href: "/autos", label: "Autos kaufen" },
      { href: "/auto-verkaufen", label: "Auto verkaufen" },
      { href: "/auto-vermitteln", label: "Auto vermitteln" },
      { href: "/auto-inserieren", label: "Auto inserieren" },
    ],
  },
  {
    title: "Händler",
    links: [
      { href: "/haendler", label: "Händler werden" },
      { href: "/anmelden", label: "Händlerlogin" },
    ],
  },
  {
    title: "Service",
    links: [
      { href: "/auto-verkaufen", label: "Fahrzeugbewertung" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "Rechtliches",
    links: [
      { href: "/impressum", label: "Impressum" },
      { href: "/datenschutz", label: "Datenschutz" },
      { href: "/agb", label: "AGB" },
      { href: "/widerruf", label: "Widerruf" },
      { href: "/cookies", label: "Cookie-Einstellungen" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-navy-100 bg-navy-950 text-navy-200 border-t">
      <Container className="py-14">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-semibold text-white">{column.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-navy-300 text-sm hover:text-cyan-300">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-navy-800 mt-12 flex flex-col items-start justify-between gap-4 border-t pt-6 sm:flex-row sm:items-center">
          <Logo variant="light" idSuffix="-footer" />
          <p className="text-navy-400 text-xs">
            © {new Date().getFullYear()} Autoklick24. Alle Angaben ohne Gewähr. Rechtstexte sind
            Platzhalter und juristisch zu prüfen.
          </p>
        </div>
      </Container>
    </footer>
  );
}

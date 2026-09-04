export interface NavLink {
  href: string;
  label: string;
}

/**
 * Zentrale Navigationsstruktur – von Desktop-Header und Mobile-Menü genutzt.
 * Händlerlogin ist bewusst NICHT hier drin: es steht als letzter, optisch
 * leicht hervorgehobener Punkt ganz rechts nach Anmelden (siehe
 * SiteHeader.tsx) und ist kein normaler Hauptnavigationspunkt.
 */
export const primaryNavLinks: NavLink[] = [
  { href: "/autos", label: "Autos kaufen" },
  { href: "/auto-verkaufen", label: "Auto verkaufen" },
  { href: "/auto-vermitteln", label: "Auto vermitteln" },
  { href: "/auto-inserieren", label: "Auto inserieren" },
];

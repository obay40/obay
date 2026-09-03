export interface NavLink {
  href: string;
  label: string;
}

/** Zentrale Navigationsstruktur – von Desktop-Header und Mobile-Menü genutzt. */
export const primaryNavLinks: NavLink[] = [
  { href: "/autos", label: "Autos kaufen" },
  { href: "/auto-verkaufen", label: "Auto verkaufen" },
  { href: "/auto-vermitteln", label: "Auto vermitteln" },
  { href: "/auto-inserieren", label: "Auto inserieren" },
  { href: "/haendler/login", label: "Händlerlogin" },
];

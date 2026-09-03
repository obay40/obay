"use client";

import { useState } from "react";
import Link from "next/link";
import { Autoklick24Brand } from "@/components/ui/Autoklick24Brand";
import { Container } from "@/components/ui/Container";
import { primaryNavLinks } from "./nav-links";

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="border-navy-100 sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
      {/*
        Eigener, voller Header-Container statt des sitebreiten Container-
        Bausteins: kein max-width, damit die Marke bei jeder Desktopbreite
        am tatsächlichen Browserrand (nur Padding) verankert bleibt statt
        in einer zentrierten Box zu "schwimmen" - Container.tsx bleibt für
        den Rest der Seite unangetastet.
        Grid (auto 1fr auto) statt flex justify-between: Brand links,
        Navigation zentriert im mittleren Bereich, Anmelden rechts.
      */}
      <div className="grid h-[90px] w-full grid-cols-[auto_1fr_auto] items-center px-5 sm:h-[132px] sm:px-6 lg:px-8 2xl:px-10 min-[1800px]:px-12">
        <Autoklick24Brand size="lg" className="col-start-1" />

        <nav
          className="col-start-2 hidden min-[1320px]:flex min-[1320px]:justify-self-center min-[1320px]:items-center min-[1320px]:gap-7"
          aria-label="Hauptnavigation"
        >
          {primaryNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-navy-700 hover:text-brand-600 whitespace-nowrap text-lg font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="col-start-3 hidden min-[1320px]:flex min-[1320px]:items-center min-[1320px]:justify-self-end">
          <Link
            href="/anmelden"
            className="text-navy-700 hover:text-brand-600 whitespace-nowrap text-lg font-medium transition-colors"
          >
            Anmelden
          </Link>
        </div>

        <button
          type="button"
          className="text-navy-700 col-start-3 inline-flex items-center justify-center justify-self-end rounded-lg p-2 min-[1320px]:hidden"
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          aria-label={mobileOpen ? "Menü schließen" : "Menü öffnen"}
          onClick={() => setMobileOpen((open) => !open)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            {mobileOpen ? (
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <nav
          id="mobile-nav"
          className="border-navy-100 border-t bg-white min-[1320px]:hidden"
          aria-label="Mobile Navigation"
        >
          <Container className="flex flex-col gap-1 py-3">
            {primaryNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-navy-700 hover:bg-navy-50 rounded-lg px-3 py-2.5 text-sm font-medium"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-navy-100 mt-2 flex flex-col gap-2 border-t pt-3">
              <Link
                href="/anmelden"
                className="text-navy-700 hover:bg-navy-50 rounded-lg px-3 py-2.5 text-sm font-medium"
                onClick={() => setMobileOpen(false)}
              >
                Anmelden
              </Link>
            </div>
          </Container>
        </nav>
      )}
    </header>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { Autoklick24Brand } from "@/components/ui/Autoklick24Brand";
import { Container } from "@/components/ui/Container";
import { primaryNavLinks } from "./nav-links";

/**
 * Dezente "Pill"-Optik für alle Navigationspunkte (siehe Aufgabenstellung
 * "NAVIGATION SOLL AUFFÄLLIGER WERDEN"): sehr helle Version der
 * Klick-Akzentfarbe aus dem Autoklick24-Logo (#3896F5, siehe
 * Autoklick24Brand.tsx Wortmarken-Gradient #3896F5 -> #1862E6) - bewusst
 * NICHT die allgemeine brand-500/600-Button-Farbe (#2B6FE0/#1E56B8), die
 * Aufgabe verlangt explizit die Logo-eigene Klick-Farbe.
 */
const NAV_PILL_CLASSES =
  "inline-flex items-center whitespace-nowrap rounded-xl bg-[rgba(56,150,245,0.07)] px-3 py-2 text-lg font-semibold text-navy-700 shadow-[0_2px_8px_rgba(56,150,245,0.05)] transition-colors duration-[180ms] hover:bg-[rgba(56,150,245,0.13)] hover:text-[#1862E6]";

/** Etwas kräftigerer Hintergrund als die normale Pill, aber weiterhin dezent (kein CTA-Button). */
const HAENDLERLOGIN_PILL_CLASSES =
  "inline-flex items-center whitespace-nowrap rounded-xl bg-[rgba(56,150,245,0.16)] px-3 py-2 text-lg font-semibold text-navy-700 shadow-[0_2px_8px_rgba(56,150,245,0.05)] transition-colors duration-[180ms] hover:bg-[rgba(56,150,245,0.22)] hover:text-[#1862E6]";

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="border-navy-100 sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
      {/*
        3-Spalten-Grid (1fr auto 1fr) statt Flex (siehe Aufgabenstellung
        "HAUPTNAVIGATION MITTIG AUSRICHTEN"): Marke in Spalte 1
        (justify-self-start), Hauptnavigation in Spalte 2 - die "auto"-Spalte
        ist exakt so breit wie ihr Inhalt, dadurch steht die Navigation
        wirklich in der Mitte des GESAMTEN Headers (nicht nur mittig im
        Freiraum zwischen Marke und Login), Account-Bereich in Spalte 3
        (justify-self-end). Account-Bereich und Burger teilen sich Spalte 3
        (col-start-3) - immer nur einer der beiden ist sichtbar.
        Eigener Container statt Container.tsx: width:calc(100%-64px),
        max-width 1600px, zentriert - nutzt fast die volle Breite, bleibt
        aber auf sehr breiten Monitoren nicht randlos.
      */}
      <div className="mx-auto grid h-[90px] w-[calc(100%-40px)] max-w-[1600px] grid-cols-[1fr_auto_1fr] items-center gap-2 sm:h-[132px] sm:w-[calc(100%-64px)] sm:gap-4">
        <Autoklick24Brand size="lg" className="col-start-1 justify-self-start" />

        <nav
          className="col-start-2 hidden justify-self-center min-[1530px]:flex min-[1530px]:items-center min-[1530px]:gap-4"
          aria-label="Hauptnavigation"
        >
          {primaryNavLinks.map((link) => (
            <Link key={link.href} href={link.href} className={NAV_PILL_CLASSES}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="col-start-3 hidden justify-self-end min-[1530px]:flex min-[1530px]:items-center min-[1530px]:gap-3.5">
          <Link href="/anmelden" className={NAV_PILL_CLASSES}>
            Anmelden
          </Link>
          <Link href="/haendler/login" className={HAENDLERLOGIN_PILL_CLASSES}>
            Händlerlogin
          </Link>
        </div>

        <button
          type="button"
          className="text-navy-700 col-start-3 inline-flex items-center justify-center justify-self-end rounded-lg p-2 min-[1530px]:hidden"
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
          className="border-navy-100 border-t bg-white min-[1530px]:hidden"
          aria-label="Mobile Navigation"
        >
          <Container className="flex flex-col gap-2 py-3">
            {primaryNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-navy-700 rounded-xl bg-[rgba(56,150,245,0.07)] px-4 py-3 text-base font-semibold"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-1 flex flex-col gap-2">
              <Link
                href="/anmelden"
                className="text-navy-700 rounded-xl bg-[rgba(56,150,245,0.07)] px-4 py-3 text-base font-semibold"
                onClick={() => setMobileOpen(false)}
              >
                Anmelden
              </Link>
              <Link
                href="/haendler/login"
                className="text-navy-700 rounded-xl bg-[rgba(56,150,245,0.16)] px-4 py-3 text-base font-semibold"
                onClick={() => setMobileOpen(false)}
              >
                Händlerlogin
              </Link>
            </div>
          </Container>
        </nav>
      )}
    </header>
  );
}

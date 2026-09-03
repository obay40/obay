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
      <Container className="flex h-[82px] items-center justify-between gap-4">
        <Autoklick24Brand size="lg" />

        <nav className="hidden items-center gap-4 min-[1320px]:flex" aria-label="Hauptnavigation">
          {primaryNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-navy-700 hover:text-brand-600 whitespace-nowrap text-base font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 min-[1320px]:flex">
          <Link
            href="/favoriten"
            className="text-navy-700 hover:text-brand-600 whitespace-nowrap text-base font-medium transition-colors"
          >
            Favoriten
          </Link>
          <Link
            href="/anmelden"
            className="text-navy-700 hover:text-brand-600 whitespace-nowrap text-base font-medium transition-colors"
          >
            Anmelden
          </Link>
          <Link
            href="/auto-verkaufen"
            className="bg-brand-500 shadow-card hover:bg-brand-600 whitespace-nowrap rounded-full px-5 py-2.5 text-base font-semibold text-white transition-colors"
          >
            Auto verkaufen
          </Link>
        </div>

        <button
          type="button"
          className="text-navy-700 inline-flex items-center justify-center rounded-lg p-2 min-[1320px]:hidden"
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
      </Container>

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
                href="/favoriten"
                className="text-navy-700 hover:bg-navy-50 rounded-lg px-3 py-2.5 text-sm font-medium"
                onClick={() => setMobileOpen(false)}
              >
                Favoriten
              </Link>
              <Link
                href="/anmelden"
                className="text-navy-700 hover:bg-navy-50 rounded-lg px-3 py-2.5 text-sm font-medium"
                onClick={() => setMobileOpen(false)}
              >
                Anmelden
              </Link>
              <Link
                href="/auto-verkaufen"
                className="bg-brand-500 rounded-full px-4 py-2.5 text-center text-sm font-semibold text-white"
                onClick={() => setMobileOpen(false)}
              >
                Auto verkaufen
              </Link>
            </div>
          </Container>
        </nav>
      )}
    </header>
  );
}

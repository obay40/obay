import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Autoklick24 – Auto verkaufen. Klick. Fertig.",
    template: "%s | Autoklick24",
  },
  description:
    "Autoklick24 – dein Fahrzeug direkt verkaufen, über Autoklick24 vermitteln lassen oder selbst inserieren. Ein Fahrzeug, drei Verkaufswege.",
  metadataBase: new URL(process.env["APP_URL"] ?? "http://localhost:3000"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <head>
        {/*
          Schriften per <link> statt next/font: next/font lädt die Dateien zur
          BUILD-Zeit herunter, was den Build ohne Netzzugang scheitern lässt.
          Montserrat ist die Schrift der Wortmarke (siehe Logo.tsx), Inter die
          Fließtextschrift (--font-sans in globals.css).

          no-page-custom-font zielt auf den Pages Router ("nur eine Seite
          betroffen"). Hier steht der Link im Root-Layout des App Routers und
          gilt damit für jede Seite - die Regel greift nicht.
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}

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
      <body className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}

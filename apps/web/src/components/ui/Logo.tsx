import Link from "next/link";

/**
 * Sobald die Logo-Datei unter /public/brand/autoklick24-logo.png liegt,
 * hier durch <Image src="/brand/autoklick24-logo.png" .../> ersetzen.
 * Bis dahin: Wortmarke in Markenfarben, damit kein kaputtes Bild angezeigt wird.
 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-0.5 text-xl font-bold tracking-tight ${className}`}
      aria-label="Autoklick24 Startseite"
    >
      <span className="text-navy-900">Autoklick</span>
      <span className="text-brand-500">24</span>
    </Link>
  );
}

import Link from "next/link";
import { AutoklickMark } from "./AutoklickMark";

/**
 * Sobald die Original-Logodatei unter /public/brand/autoklick24-logo.png
 * (oder .svg) liegt, kann sie hier per <Image> eingesetzt werden - siehe
 * public/brand/README.md. Bis dahin: als Code nachgebaute Bildmarke +
 * Wortmarke in Markenfarben, damit kein kaputtes Bild angezeigt wird.
 *
 * `variant="light"` kehrt die Wortmarkenfarben für dunkle Hintergründe um
 * (z. B. SiteFooter auf navy-950) - die Bildmarke selbst bleibt gleich, sie
 * ist als eigenständige Kachel für beide Hintergründe ausgelegt.
 */
export function Logo({
  className = "",
  variant = "dark",
  size = "md",
}: {
  className?: string;
  variant?: "dark" | "light";
  /** "md" (Standard, z. B. Footer) oder "lg" (Header - etwas größer, damit die Marke präsenter wirkt). */
  size?: "md" | "lg";
}) {
  const autoColor = variant === "light" ? "text-white" : "text-navy-900";
  const suffixColor = variant === "light" ? "text-brand-400" : "text-brand-600";
  const markSize = size === "lg" ? 48 : 40;
  const textSizeClass = size === "lg" ? "text-3xl" : "text-2xl";

  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2.5 ${className}`}
      aria-label="Autoklick24 Startseite"
    >
      <AutoklickMark size={markSize} />
      <span className={`inline-flex items-center ${textSizeClass} font-bold tracking-tight`}>
        <span className={autoColor}>Auto</span>
        <span className="text-cyan-400">klick</span>
        <span className={suffixColor}>24</span>
      </span>
    </Link>
  );
}

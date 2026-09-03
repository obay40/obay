import Link from "next/link";
import { AutoklickMark } from "./AutoklickMark";

/**
 * Zentrale Markendarstellung: [ Symbol ] Autoklick24
 *
 * Header und Footer benutzen ausschliesslich diese Komponente, damit es keine
 * zweite, abweichende Logo-Variante geben kann.
 *
 * ============================================================
 * TODO: offizielle Logo-Mark-Datei aus Original bereitstellen.
 * ============================================================
 * Das offizielle Symbol (dunkelblaues abgerundetes Quadrat, weisse
 * Fahrzeugfront, blauer Cursor, gruener Klick-Akzent) liegt diesem Repository
 * NICHT bei. In dieser Umgebung ist nie eine Bilddatei des Logos angekommen -
 * eingegangen sind ausschliesslich eine .xlsx (Fahrzeugkatalog) und ein .zip
 * eines Vorgaengerprojekts (enthaelt nur ein Sechseck-"A"-Icon, nicht dieses
 * Logo). Solange das so ist, rendert die Komponente die vorhandene
 * PLATZHALTER-Bildmarke aus AutoklickMark.tsx.
 *
 * Der Platzhalter ist ausdruecklich NICHT das Original und soll es auch nicht
 * darstellen. Er wird nicht weiter "verbessert" oder an das Original
 * angenaehert - jede weitere Nachzeichnung waere genau die improvisierte
 * Nachbildung, die vermieden werden soll.
 *
 * So wird das Original eingesetzt (einzige noetige Aenderung):
 *   1. Datei ablegen unter apps/web/public/brand/, z. B. autoklick24-symbol.png
 *      (nur das Symbol, ohne Schriftzug/Claim/weissen Hintergrund; PNG mit
 *      Transparenz oder SVG)
 *   2. unten OFFICIAL_SYMBOL_SRC auf "/brand/<dateiname>" setzen
 *   3. AutoklickMark.tsx und app/icon.svg loeschen bzw. durch das Original
 *      ersetzen
 * Header, Footer und alle weiteren Verwendungen ziehen automatisch nach.
 */
const OFFICIAL_SYMBOL_SRC: string | null = null;

/** Wortmarke - bewusst unveraendert uebernommen, diese Typografie ist abgenommen. */
const NAVY = "#0B1F3F";

const SIZES = {
  sm: { symbol: "h-9 w-9", word: "text-[1.15rem]" },
  /** Standard: 40px mobil, 48px ab sm - liegt in beiden geforderten Korridoren. */
  md: { symbol: "h-10 w-10 sm:h-12 sm:w-12", word: "text-[1.3rem] sm:text-[1.55rem]" },
  lg: { symbol: "h-11 w-11 sm:h-[54px] sm:w-[54px]", word: "text-[1.5rem] sm:text-[1.8rem]" },
} as const;

export function Autoklick24Brand({
  className = "",
  variant = "dark",
  size = "md",
  idSuffix = "",
  href = "/",
}: {
  className?: string;
  /** "light" dreht nur den Schriftzug auf Weiss - das Symbol bleibt unangetastet. */
  variant?: "dark" | "light";
  size?: "sm" | "md" | "lg";
  /** Haelt die SVG-Verlaufs-IDs eindeutig, wenn die Marke mehrfach auf einer Seite steht. */
  idSuffix?: string;
  href?: string;
}) {
  const s = SIZES[size];
  const wordColor = variant === "light" ? "#FFFFFF" : NAVY;

  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2.5 sm:gap-3 ${className}`}
      aria-label="Autoklick24"
    >
      {OFFICIAL_SYMBOL_SRC ? (
        /*
         * Bewusst <img> statt next/image: das Original soll unveraendert und
         * ohne Neukodierung ausgeliefert werden. Keine CSS-Filter, keine
         * Theme-Einfaerbung - die Originalfarben bleiben in beiden Varianten.
         */
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={OFFICIAL_SYMBOL_SRC}
          alt=""
          aria-hidden="true"
          className={`${s.symbol} shrink-0 object-contain`}
        />
      ) : (
        <AutoklickMark className={`${s.symbol} shrink-0`} idSuffix={idSuffix} />
      )}

      <span
        className={`font-display ${s.word} font-extrabold leading-none tracking-[-0.02em] whitespace-nowrap`}
        style={{ color: wordColor }}
      >
        Auto
        <span className="bg-gradient-to-r from-[#3896F5] to-[#1862E6] bg-clip-text text-transparent">
          klick
        </span>
        24
      </span>
    </Link>
  );
}

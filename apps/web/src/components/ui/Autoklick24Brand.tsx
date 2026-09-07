import Link from "next/link";

/**
 * Zentrale Markendarstellung: [ Original-Symbol ] Autoklick24
 *
 * Header und Footer benutzen ausschliesslich diese Komponente, damit es keine
 * zweite, abweichende Logo-Variante geben kann.
 *
 * Das Symbol ist das ECHTE Originallogo, kein Nachbau: freigestellt aus der
 * vom Auftraggeber gelieferten Datei (liegt daneben als
 * autoklick24-logo-original.webp). Es wird unveraendert als Bild-Asset
 * ausgeliefert - siehe public/brand/README.md.
 *
 * Die Wortmarke daneben bleibt Text in der abgenommenen Typografie
 * (Montserrat 800, "Auto"/"24" navy, "klick" im Blauverlauf).
 */
const SYMBOL_SRC = "/brand/autoklick24-symbol.png";

const NAVY = "#0B1F3F";

const SIZES = {
  sm: { symbol: "h-9 w-9", word: "text-[1.15rem]", gap: "gap-2.5 sm:gap-3" },
  /** Standard (Footer): 40px mobil, 48px ab sm. */
  md: {
    symbol: "h-10 w-10 sm:h-12 sm:w-12",
    word: "text-[1.3rem] sm:text-[1.55rem]",
    gap: "gap-2.5 sm:gap-3",
  },
  /** Header: 60px mobil, 102px ab sm - Wortmarke 26px mobil, 44px ab sm. */
  lg: {
    symbol: "h-[60px] w-[60px] sm:h-[102px] sm:w-[102px]",
    word: "text-[1.625rem] sm:text-[2.75rem]",
    gap: "gap-3 sm:gap-4",
  },
} as const;

export function Autoklick24Brand({
  className = "",
  variant = "dark",
  size = "md",
  href = "/",
}: {
  className?: string;
  /** "light" dreht nur den Schriftzug auf Weiss - das Symbol bleibt unangetastet. */
  variant?: "dark" | "light";
  size?: "sm" | "md" | "lg";
  href?: string;
}) {
  const s = SIZES[size];
  const wordColor = variant === "light" ? "#FFFFFF" : NAVY;

  return (
    <Link
      href={href}
      className={`inline-flex items-center ${s.gap} ${className}`}
      aria-label="Autoklick24"
    >
      {/*
        Bewusst <img> statt next/image: das Original soll unveraendert und ohne
        Neukodierung ausgeliefert werden. Keine CSS-Filter, keine
        Theme-Einfaerbung - die Originalfarben bleiben in beiden Varianten.
      */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={SYMBOL_SRC}
        alt=""
        aria-hidden="true"
        width={302}
        height={302}
        className={`${s.symbol} shrink-0 object-contain`}
      />

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

import Link from "next/link";
import { AutoklickMark } from "./AutoklickMark";

/**
 * Vollständige Logo-Sperrung nach der Vorlage des Auftraggebers:
 * Bildmarke + Wortmarke "Autoklick24" (Montserrat ExtraBold, "klick" im
 * Blauverlauf, "Auto"/"24" in Navy) + Tagline "Auto verkaufen. Klick.
 * Fertig.". Die Bilddatei selbst ließ sich nicht übertragen, deshalb ist die
 * Marke als Code nachgebaut - siehe public/brand/README.md, dort steht auch,
 * wie die Originaldatei später eingesetzt wird.
 *
 * `variant="light"` dreht die dunklen Textteile auf Weiß für dunkle
 * Hintergründe (SiteFooter auf navy-950); Bildmarke und Blautöne bleiben, sie
 * funktionieren auf beiden Untergründen.
 */
const NAVY = "#0B1F3F";

export function Logo({
  className = "",
  variant = "dark",
  size = "md",
  withTagline = true,
  idSuffix = "",
}: {
  className?: string;
  variant?: "dark" | "light";
  /** "md" (Footer) oder "lg" (Header). */
  size?: "md" | "lg";
  withTagline?: boolean;
  /** Hält die SVG-Verlaufs-IDs eindeutig, wenn das Logo mehrfach auf einer Seite steht. */
  idSuffix?: string;
}) {
  const isLight = variant === "light";
  const darkTextColor = isLight ? "#FFFFFF" : NAVY;
  const taglineColor = isLight ? "#C7D6EC" : "#14294F";

  const markSize = size === "lg" ? 50 : 44;
  const wordmarkClass = size === "lg" ? "text-[1.75rem]" : "text-[1.4rem]";
  const taglineClass = size === "lg" ? "text-[0.72rem]" : "text-[0.62rem]";

  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-3 ${className}`}
      aria-label="Autoklick24 – Auto verkaufen. Klick. Fertig."
    >
      <AutoklickMark size={markSize} idSuffix={idSuffix} />

      <span className="font-display inline-flex flex-col justify-center leading-none">
        <span className={`${wordmarkClass} font-extrabold tracking-[-0.02em]`}>
          <span style={{ color: darkTextColor }}>Auto</span>
          <span className="bg-gradient-to-r from-[#3896F5] to-[#1862E6] bg-clip-text text-transparent">
            klick
          </span>
          <span style={{ color: darkTextColor }}>24</span>
        </span>

        {withTagline && (
          <span className={`${taglineClass} mt-1.5 font-medium`} style={{ color: taglineColor }}>
            Auto verkaufen. <span className="font-bold text-[#1E70EA]">Klick.</span> Fertig.
          </span>
        )}
      </span>
    </Link>
  );
}

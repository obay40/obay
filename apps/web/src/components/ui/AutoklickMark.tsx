/**
 * Bildmarke (App-Icon-Kachel): dunkles, abgerundetes Quadrat mit
 * Auto-Frontansicht + Klick-Cursor. Als Code nachgebaut nach der vom
 * Auftraggeber bereitgestellten Logo-Vorlage (Bildübertragung in dieser
 * Sitzung technisch nicht möglich, siehe public/brand/README.md) -
 * originalgetreu in Form/Farbwelt, aber kein Pixel-Export der Originaldatei.
 * Sobald die Originaldatei vorliegt, kann sie unter public/brand/ abgelegt
 * und hier per <Image> eingebunden werden, ohne dass Aufrufer dieser
 * Komponente sich ändern müssen.
 */
export function AutoklickMark({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label="Autoklick24 Symbol"
    >
      <defs>
        <linearGradient id="ak-cursor" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#5CD3E8" />
          <stop offset="100%" stopColor="#1E56B8" />
        </linearGradient>
      </defs>

      <rect width="100" height="100" rx="22" fill="#0A1626" />

      {/* Auto, Frontansicht */}
      <g fill="none" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 44 Q22 30 34 30 H66 Q78 30 78 44 V60 Q78 66 72 66 H28 Q22 66 22 60 Z" />
        <path d="M30 38 H70" strokeWidth="2.5" opacity="0.7" />
        <rect x="26" y="45" width="14" height="9" rx="3" />
        <rect x="60" y="45" width="14" height="9" rx="3" />
        <path d="M44 52 H56" strokeWidth="3" />
        <path d="M43 58 H57" strokeWidth="3" />
      </g>

      {/* Klick-Funken */}
      <g stroke="#2FAE7A" strokeWidth="3" strokeLinecap="round">
        <path d="M16 62 L23 60" />
        <path d="M18 70 L25 66.5" />
        <path d="M23 77 L28 72" />
      </g>

      {/* Cursor */}
      <path
        d="M33 55 L33 82 L40.5 75.5 L45.5 86 L51.5 83 L46.5 72.5 L56 72.5 Z"
        fill="url(#ak-cursor)"
        stroke="#0A1626"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Bildmarke (App-Icon-Kachel) des Autoklick24-Logos: dunkelblaues,
 * abgerundetes Quadrat mit weißer Auto-Frontansicht, blauem Klick-Cursor und
 * grünen Klick-Funken. Als SVG nachgebaut nach der Logo-Vorlage des
 * Auftraggebers (die Bilddatei selbst ließ sich in dieser Umgebung nicht
 * übertragen, siehe public/brand/README.md) - Formen und Farbwerte sind an
 * der Vorlage abgenommen, nicht an der übrigen UI-Palette.
 *
 * Identische Geometrie liegt zusätzlich als statische Datei in
 * apps/web/src/app/icon.svg (Favicon) - beide zusammen ändern.
 *
 * `idSuffix` hält die Verlaufs-IDs eindeutig, wenn die Marke mehrfach auf
 * derselben Seite steht (Header + Footer).
 */
const NAVY = "#12264A";

export function AutoklickMark({
  size = 48,
  idSuffix = "",
  className = "",
}: {
  size?: number;
  idSuffix?: string;
  className?: string;
}) {
  const cursorGradientId = `ak-cursor${idSuffix}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={className}
      role="img"
      aria-label="Autoklick24 Symbol"
    >
      <defs>
        <linearGradient id={cursorGradientId} x1="15%" y1="0%" x2="85%" y2="100%">
          <stop offset="0%" stopColor="#63B3F9" />
          <stop offset="100%" stopColor="#1A6ADF" />
        </linearGradient>
      </defs>

      <rect width="200" height="200" rx="52" fill={NAVY} />

      {/* Auto-Frontansicht: geschlossene weiße Silhouette ... */}
      <path
        d="M40 116 L40 90 Q40 79 50 75 L60 71 Q64 55 76 48 Q87 42 100 42 Q113 42 124 48 Q136 55 140 71 L150 75 Q160 79 160 90 L160 116 Q160 126 150 126 L50 126 Q40 126 40 116 Z"
        fill="#FFFFFF"
      />
      {/* ... mit Windschutzscheibe als Navy-Aussparung ... */}
      <path d="M71 76 Q76 56 100 56 Q124 56 129 76 Z" fill={NAVY} />
      {/* ... Außenspiegeln ... */}
      <path d="M40 86 L25 90 Q21 91 22 95 L23 98 Q24 102 28 101 L40 97 Z" fill="#FFFFFF" />
      <path d="M160 86 L175 90 Q179 91 178 95 L177 98 Q176 102 172 101 L160 97 Z" fill="#FFFFFF" />
      {/* ... Scheinwerfern ... */}
      <path d="M50 88 L86 94 L86 101 L50 95 Z" fill={NAVY} />
      <path d="M150 88 L114 94 L114 101 L150 95 Z" fill={NAVY} />
      {/* ... und Kühlergrill. */}
      <rect x="76" y="110" width="48" height="9" rx="4.5" fill={NAVY} />

      {/* Klick-Funken links neben dem Cursor */}
      <g stroke="#5CC22B" strokeWidth="7" strokeLinecap="round">
        <path d="M36 133 L50 136" />
        <path d="M33 150 L48 149" />
        <path d="M40 166 L52 160" />
      </g>

      {/* Cursor, mit der Spitze auf der Fahrzeugfront */}
      <path
        d="M84 106 L84 152 L95 143 L103 161 L114 156 L106 139 L121 139 Z"
        fill={`url(#${cursorGradientId})`}
        stroke="#FFFFFF"
        strokeWidth="7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Bildmarke (App-Icon-Kachel) des Autoklick24-Logos: dunkelblaues,
 * abgerundetes Quadrat mit weißer Auto-Frontansicht, blauem Klick-Cursor und
 * grünen Klick-Funken. Als SVG nachgebaut nach der Logo-Vorlage des
 * Auftraggebers (die Bilddatei selbst ließ sich in dieser Umgebung nicht
 * übertragen, siehe public/brand/README.md) - Formen und Farbwerte sind an
 * der Vorlage abgenommen, nicht an der übrigen UI-Palette.
 *
 * Die Geometrie ist auf Lesbarkeit bis ~32px optimiert und dabei bewusst
 * gesetzt:
 * - Dach breit und flach (nicht hoch/schmal), sonst liest es sich als Turm.
 * - Spiegel klein und tief angesetzt, sonst bilden sie mit der Motorhaube
 *   eine durchgehende Flügellinie und das Ganze wirkt wie ein Flugzeug.
 * - Scheinwerfer waagerecht statt angeschrägt (angeschrägt = "böse Augen").
 * - Cursorspitze sitzt UNTER dem Kühlergrill: beide Formen bleiben intakt,
 *   der Cursor schneidet die Silhouette nicht auf.
 *
 * Identische Geometrie liegt zusätzlich als statische Datei in
 * apps/web/src/app/icon.svg (Favicon) und in der Demo-Seite auf dem
 * gh-pages-Branch - alle drei zusammen ändern.
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

      {/* Außenspiegel - liegen hinter der Karosserie, damit die Kante sauber bleibt */}
      <path d="M32 94 L21 96 Q16 97 16 102 Q16 106 21 106 L32 104 Z" fill="#FFFFFF" />
      <path d="M168 94 L179 96 Q184 97 184 102 Q184 106 179 106 L168 104 Z" fill="#FFFFFF" />

      {/* Dach/Kabine */}
      <path d="M55 92 L61 66 Q63 57 74 56 L126 56 Q137 57 139 66 L145 92 Z" fill="#FFFFFF" />
      {/* Windschutzscheibe als Navy-Aussparung */}
      <path d="M66 87 L71 70 Q72 64 79 63 L121 63 Q128 64 129 70 L134 87 Z" fill={NAVY} />

      {/* Karosserie */}
      <path
        d="M28 122 L28 99 Q28 90 38 88 L55 86 L145 86 L162 88 Q172 90 172 99 L172 122 Q172 133 161 133 L39 133 Q28 133 28 122 Z"
        fill="#FFFFFF"
      />

      {/* Scheinwerfer */}
      <rect x="37" y="98" width="34" height="10" rx="5" fill={NAVY} />
      <rect x="129" y="98" width="34" height="10" rx="5" fill={NAVY} />
      {/* Kühlergrill */}
      <rect x="68" y="114" width="64" height="10" rx="5" fill={NAVY} />

      {/* Klick-Funken, strahlen vom Cursor weg */}
      <g stroke="#5CC22B" strokeWidth="7" strokeLinecap="round">
        <path d="M80 148 L67 144" />
        <path d="M76 161 L62 161" />
        <path d="M81 173 L70 179" />
      </g>

      {/* Cursor, Spitze auf der Fahrzeugfront unterhalb des Grills */}
      <path
        d="M100 130 L100 167 L109 160 L115 174 L124 170 L118 156 L130 156 Z"
        fill={`url(#${cursorGradientId})`}
        stroke="#FFFFFF"
        strokeWidth="7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

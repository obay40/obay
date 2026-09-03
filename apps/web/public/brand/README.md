# Brand Assets

## ⚠️ TODO: offizielle Logo-Mark-Datei aus Original bereitstellen

**Das offizielle Autoklick24-Symbol liegt diesem Repository nicht bei.**

In dieser Arbeitsumgebung ist nie eine Bilddatei des Logos angekommen.
Nachweislich eingegangen sind ausschließlich zwei Uploads:

| Datei | Inhalt |
|---|---|
| `…-mobile_de_automarken_modelle_hierarchie_car.xlsx` | Fahrzeugkatalog |
| `…-autocorp244.zip` | Vorgängerprojekt, enthält nur `icon-192/512.png` — ein Sechseck-„A", **nicht** dieses Logo |

Solange keine Originaldatei vorliegt, rendert `Autoklick24Brand` die
**Platzhalter**-Bildmarke aus `AutoklickMark.tsx`. Diese ist eine Eigenzeichnung,
ausdrücklich **nicht** das Original, und wird bewusst nicht weiter an das
Original angenähert — jede weitere Nachzeichnung wäre eine improvisierte
Nachbildung.

### Original einsetzen — drei Schritte

1. **Datei ablegen** in diesem Ordner, z. B. `autoklick24-symbol.png`
   Nur das Symbol: ohne Schriftzug, ohne Claim, ohne weißen Hintergrund.
   PNG mit Transparenz (≥ 512 px) oder SVG.
   Optional zusätzlich das vollständige Original als
   `autoklick24-logo-original.png` zur Ablage.
2. **Eine Zeile ändern** in `apps/web/src/components/ui/Autoklick24Brand.tsx`:
   ```ts
   const OFFICIAL_SYMBOL_SRC: string | null = "/brand/autoklick24-symbol.png";
   ```
   Header, Footer und alle weiteren Verwendungen ziehen automatisch nach.
3. **Platzhalter entfernen**: `AutoklickMark.tsx` und `app/icon.svg` löschen
   bzw. durch das Original ersetzen. Auch die Demo-Seite auf `gh-pages`
   (`index.html`, zwei eingebettete SVGs) ersetzen — dort steht ein
   entsprechender TODO-Kommentar.

> **GitHub Pages:** Die Demo läuft unter `https://obay40.github.io/obay/`.
> Dort muss der Bildpfad **relativ** sein (`brand/autoklick24-symbol.png`),
> ein führender Slash (`/brand/…`) liefert dort 404. In der Next.js-App ist
> `/brand/…` dagegen korrekt.

## Wortmarke (abgenommen, unverändert lassen)

| Eigenschaft | Wert |
|---|---|
| Schrift | **Montserrat**, Fallback `Inter` → `ui-sans-serif`/`system-ui` |
| Font Weight | **800** (ExtraBold) |
| Letter Spacing | `-0.02em` |
| Größe Desktop | `1.55rem` (≈ 24,8 px) |
| Größe Mobile | `1.3rem` (≈ 20,8 px) |
| „Auto" und „24" | Navy `#0B1F3F` (hell: `#FFFFFF`) |
| „klick" | Blauverlauf `#3896F5` → `#1862E6` via `bg-clip-text` |
| Schreibweise | immer `Autoklick24` — nie `Autoklick 24`, `AutoKlick24` |

Montserrat wird als Google-Fonts-`<link>` in `apps/web/src/app/layout.tsx`
geladen — bewusst **nicht** über `next/font/google`, das lädt die Dateien zur
Build-Zeit herunter und bricht Builds ohne Netzzugang. Verfügbar als
CSS-Variable `--font-display` und als Tailwind-Utility `font-display`.

## Symbolgrößen

| Kontext | Größe |
|---|---|
| Desktop (ab 640 px) | 48 px |
| Mobile | 40 px |
| `size="sm"` | 36 px |
| `size="lg"` | 44 px mobil / 54 px Desktop |

Das Symbol behält immer seine Originalfarben. **Keine** CSS-Filter
(`brightness`, `hue-rotate`, `invert`, `grayscale`), keine Theme-Einfärbung —
`variant="light"` dreht ausschließlich den Schriftzug auf Weiß.

## Dateien

| Datei | Rolle |
|---|---|
| `components/ui/Autoklick24Brand.tsx` | **einzige** Markendarstellung (Header + Footer) |
| `components/ui/AutoklickMark.tsx` | Platzhalter-Symbol, siehe oben |
| `app/icon.svg` | Favicon, gleiche Geometrie wie der Platzhalter |
| gh-pages `index.html` | Demo-Seite, zwei eingebettete Kopien |

# Brand Assets

## Symbol

Das Header-/Footer-Symbol ist das **Originallogo des Auftraggebers**, kein
Nachbau. Es wurde aus der gelieferten Datei freigestellt:

| Datei | Rolle |
|---|---|
| `autoklick24-symbol.png` | freigestelltes Symbol, 302×302, RGBA — **das wird ausgeliefert** |
| `autoklick24-logo-original.webp` | die gelieferte Originaldatei (Symbol + Schriftzug + Claim) zur Ablage |

**Freistellung** (reproduzierbar, ohne Neuzeichnen): quadratischer Zuschnitt auf
die Kachel (Originalpixel x 81–375, y 380–680), Hintergrund per Flood-Fill vom
Bildrand entfernt — dadurch bleibt die weiße Fahrzeugfront *innerhalb* der
Kachel erhalten — und die Kantenglättung auf Alpha zurückgerechnet, damit auf
dem dunklen Footer kein weißer Saum entsteht.

Verwendet wird es über `components/ui/Autoklick24Brand.tsx` (Konstante
`SYMBOL_SRC`). Das gleiche Bild liegt als `app/icon.png` (Favicon) und auf
`gh-pages` unter `assets/autoklick24-symbol.png`.

> **GitHub Pages:** Die Demo läuft unter `https://obay40.github.io/obay/`.
> Dort ist der Pfad **relativ** (`./assets/autoklick24-symbol.png`), ein
> führender Slash würde 404 liefern. In der Next.js-App ist `/brand/…` korrekt.

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
| `app/icon.png` | Favicon, dasselbe freigestellte Symbol |
| gh-pages `index.html` + `assets/` | Demo-Seite, Header und Footer |

# Brand Assets

Die vom Auftraggeber bereitgestellte Logo-Vorlage konnte in der jeweiligen
Sitzung nicht als Datei übertragen werden (Bild-Uploads kamen technisch
nicht im Dateisystem an). Deshalb ist die komplette Logo-Sperrung aktuell als
Code nachgebaut.

## Bestandteile der Sperrung

1. **Bildmarke** – dunkelblaue, abgerundete Kachel (`#12264A`) mit weißer
   Auto-Frontansicht (Windschutzscheibe als Navy-Aussparung, Außenspiegel,
   schräge Scheinwerfer, Kühlergrill), blauem Klick-Cursor mit weißer Kontur
   (Verlauf `#63B3F9` → `#1A6ADF`) und drei grünen Klick-Funken (`#5CC22B`).
2. **Wortmarke** – „Auto" (Navy `#0B1F3F`) + „klick" (Blauverlauf `#3896F5` →
   `#1862E6`, per `bg-clip-text`) + „24" (Navy). Wichtig: die „24" ist **navy**,
   nicht blau.
3. **Tagline** – „Auto verkaufen. **Klick.** Fertig." – „Klick." fett in
   `#1E70EA`, der Rest in `#14294F` (bzw. `#C7D6EC` auf dunklem Grund).

## Schrift

Die Wortmarke nutzt **Montserrat ExtraBold (800)** – die geometrische Grotesk
aus der Vorlage. Eingebunden ist sie als Google-Fonts-`<link>` in
`apps/web/src/app/layout.tsx` (bewusst **nicht** über `next/font/google`: das
lädt die Schriftdateien zur Build-Zeit herunter und bricht damit Builds ohne
Netzzugang). Verfügbar ist sie über:

- CSS-Variable `--font-display` in `apps/web/src/app/globals.css`
- Tailwind-Utility `font-display` (siehe `apps/web/tailwind.config.ts`)

Wird die Schrift nicht geladen, greift der Fallback `Inter` →
`ui-sans-serif`/`system-ui`.

## Dateien

- `apps/web/src/components/ui/AutoklickMark.tsx` – die Bildmarke als
  Inline-SVG (`viewBox="0 0 200 200"`), `idSuffix` hält die Verlaufs-IDs
  eindeutig, wenn das Logo mehrfach auf einer Seite steht
- `apps/web/src/components/ui/Logo.tsx` – die volle Sperrung
  (Bildmarke + Wortmarke + Tagline). Props: `variant="light"` für dunkle
  Hintergründe (SiteFooter), `size="lg"` für den Header, `withTagline`
- `apps/web/src/app/icon.svg` – **dieselbe Geometrie** als
  Next.js-Favicon. Bei Änderungen an `AutoklickMark.tsx` immer mitziehen.

Die statische Demo-Seite (`gh-pages`-Branch, `index.html`) enthält denselben
Aufbau als reines HTML/CSS und muss bei Logo-Änderungen ebenfalls angepasst
werden.

## Original-Datei später einsetzen

1. Datei hier ablegen als `autoklick24-logo.svg` (bevorzugt) oder `.png`
2. `Logo.tsx` von `<AutoklickMark />` auf
   `<Image src="/brand/autoklick24-logo.svg" .../>` umstellen (Wortmarke
   bleibt ggf. Teil der Datei oder weiterhin als Text)
3. `app/icon.svg` durch die Originaldatei ersetzen (oder `app/icon.png`
   anlegen, Next.js erkennt beide automatisch)

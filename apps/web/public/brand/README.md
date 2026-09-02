# Brand Assets

Die vom Auftraggeber bereitgestellte Logo-Vorlage konnte in der jeweiligen
Sitzung nicht als Datei übertragen werden (Bild-Uploads kamen technisch
nicht im Dateisystem an). Deshalb ist die Bildmarke aktuell als Code
nachgebaut:

- `apps/web/src/components/ui/AutoklickMark.tsx` – die Bildmarke (Auto +
  Klick-Cursor im abgerundeten Quadrat) als Inline-SVG
- `apps/web/src/components/ui/Logo.tsx` – Bildmarke + Wortmarke
  ("Auto"/"klick"/"24" in Markenfarben), mit `variant="light"` für dunkle
  Hintergründe (siehe SiteFooter)
- `apps/web/src/app/icon.svg` – dieselbe Bildmarke als Next.js-Favicon

Um stattdessen die exakte Originaldatei zu verwenden:

1. Datei hier ablegen als `autoklick24-logo.svg` (bevorzugt) oder `.png`
2. `Logo.tsx` von `<AutoklickMark />` auf `<Image src="/brand/autoklick24-logo.svg" .../>`
   umstellen (Wortmarke bleibt ggf. Teil der Datei oder weiterhin als Text)
3. `app/icon.svg` durch die Originaldatei ersetzen (oder `app/icon.png`
   anlegen, Next.js erkennt beide automatisch)

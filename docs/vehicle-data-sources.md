# Fahrzeugdatenquellen

Dieses Dokument beschreibt, woher der Autoklick24-Fahrzeugkatalog
(`VehicleManufacturer`/`VehicleModel`) stammt, unter welcher Lizenz er steht,
und wie er importiert/aktualisiert wird. Es ist die verbindliche Antwort auf
"Woher kommt dieser Datensatz?".

## Primärquelle

- **Projekt:** [VehiclesDB](https://vehiclesdb.com) ([GitHub: `vehiclesdb/vehiclesdb`](https://github.com/vehiclesdb/vehiclesdb))
- **Verwendete Dateien:** `catalog/car/makes.json`, `catalog/car/models.json`
  (nur Fahrzeugtyp `car` – Motorräder, Mopeds, Busse, LKW werden bewusst
  **nicht** importiert; Transporter/Vans (`kind: van`) werden getrennt
  behandelt und sind aktuell noch nicht importiert, siehe „Bekannte
  Lücken/Nicht-Ziele" unten)
- **Dataset-Version:** `2026.08.2` (`manifest.json` / `VERSION` im Quell-Repo,
  Build vom 2026-08-02)
- **Abrufdatum:** 2026-09-02
- **Umfang bei Abruf:** 277 PKW-Hersteller, 4.895 PKW-Modelle
- **Herkunft der Rohdaten:** amtliche Zulassungs-/Typgenehmigungs-/
  Statistikregister aus 14 Ländern (DE, NL, GB, ES, FI, LU, IE, US, CA, NZ,
  MY, TH, UA, AR); jedes Modell ist durch mindestens zwei unabhängige
  Quellen belegt (siehe `SOURCES.md` im Quell-Repo)

## Lizenz

Der VehiclesDB-Datensatz (`catalog/**`, `dist/**`, `manifest.json`) steht
unter **CC BY 4.0**. Die Upstream-Register behalten ihre eigenen Lizenzen
(u. a. CC0-1.0, OGL-UK-3.0, OGL-Canada-2.0, DL-DE-BY-2.0) – diese Hinweise
dürfen laut Lizenzbedingungen nicht entfernt werden.

Der Code des VehiclesDB-Repositories (Scripts, Workflows) ist MIT-lizenziert
und wird von Autoklick24 nicht übernommen (nur die Datendateien).

### Notwendige Attribution

> Vehicle data by VehiclesDB (vehiclesdb.com), CC-BY 4.0, built from
> official public registers – see ATTRIBUTION.md for source notices.

Die vollständigen, je Release generierten Quellenhinweise liegen unverändert
in [`packages/database/vendor/vehiclesdb/ATTRIBUTION.md`](../packages/database/vendor/vehiclesdb/ATTRIBUTION.md),
der Lizenztext in [`packages/database/vendor/vehiclesdb/LICENSE`](../packages/database/vendor/vehiclesdb/LICENSE).
Beide Dateien sind 1:1-Kopien aus dem Quell-Repository und dürfen nicht
verändert oder entfernt werden. Eine öffentliche Credits-/Datenquellen-Seite
für die Autoklick24-Website ist vorzubereiten, sobald der Fahrzeugkatalog live
für Endnutzer sichtbar ist.

## Warum kein Live-Zugriff zur Laufzeit?

Die Website fragt beim Öffnen des Marken-/Modell-Dropdowns **nicht** die
VehiclesDB-GitHub-Quelle ab. Stattdessen:

```
VehiclesDB (GitHub, Version 2026.08.2)
        ↓  (einmalig, manuell ausgelöst)
packages/database/vendor/vehiclesdb/car/*.json   (unveränderte Rohkopie, in Git versioniert)
        ↓  pnpm vehicle-catalog:import
Postgres (VehicleManufacturer / VehicleModel / *Alias)
        ↓
/api/v1/vehicle-manufacturers (gecacht)
        ↓
Website (später iOS/Android)
```

Damit ist Autoklick24 zu jedem Zeitpunkt mit dem zuletzt erfolgreich
importierten eigenen Katalog lauffähig, auch wenn VehiclesDB nicht
erreichbar ist.

## Importprozess

Script: [`packages/database/scripts/import-vehicle-catalog.ts`](../packages/database/scripts/import-vehicle-catalog.ts)
(`pnpm vehicle-catalog:import`)

1. Vendorte `makes.json`/`models.json` einlesen
2. Gegen erwartetes Schema validieren
3. Autoklick24-Overrides anwenden (`packages/database/src/vehicle-catalog/overrides.ts`):
   Anzeigenamen, zusätzliche Aliase, Ausblendungen – **ohne** die Rohdaten zu
   verändern
4. Hersteller-/Modellnamen normalisieren (Slug, Diakritika-Faltung für die
   Suche)
5. Dubletten anhand des normalisierten Namens erkennen
6. Slugs erzeugen (stabil, SEO-tauglich)
7. Datenbank aktualisieren: `upsert` je `(source, sourceId)`. Datensätze, die
   beim aktuellen Import in der Quelle fehlen, werden **nicht gelöscht**,
   sondern auf `sourceActive = false` gesetzt (Referenzintegrität für bereits
   verknüpfte Fahrzeuginserate)
8. Importstatistik ausgeben (importiert/aktualisiert/unverändert/Warnungen/Fehler)
9. Fehler/Auffälligkeiten protokollieren

### Update-Strategie

Ein künftiges Update (`pnpm vehicle-catalog:update`, noch nicht automatisiert)
folgt demselben Ablauf wie oben, plus vorgeschaltet: neue Release-Version aus
VehiclesDB vendoren → Diff gegen den aktuellen Stand erzeugen und anzeigen
(neue/umbenannte/upstream entfernte Datensätze) → erst nach Prüfung
übernehmen. Es gibt **keine** automatische Produktionsänderung ohne diesen
Zwischenschritt.

## Datenherkunft je Datensatz

Jeder `VehicleManufacturer`/`VehicleModel` trägt `source`, `sourceId` und
`sourceVersion`:

- `source: VEHICLES_DB` – aus obigem Import, `sourceId` = VehiclesDB-`id`
  (z. B. `"bmw"`, `"bmw/3-series"`)
- `source: MANUAL` – von Autoklick24 manuell gepflegt (z. B. künftige
  Admin-Ergänzungen), `sourceId` ist `null`
- `source: EXTERNAL_PROVIDER` – vorgesehen für einen künftigen kommerziellen
  Fahrzeugdaten-Provider, aktuell ungenutzt

## Aliase

Zwei Ebenen, beide durchsuchbar:

1. **Von VehiclesDB veröffentlichte Aliase** (`makes.json[].aliases`, z. B.
   `volkswagen → ["VW", "Vdub"]`, `mercedes-benz → ["Merc", "Benz", "MB"]`) –
   werden 1:1 übernommen.
2. **Autoklick24-Overrides** (`overrides.ts`) für Fälle, die die Quelle nicht
   abdeckt, u. a.:
   - Deutsche Baureihen-Bezeichnungen, wo die Quelle englische Namen führt
     (BMW `"1er"` → `1 Series` … `"8er"` → `8 Series`; Mercedes `"A-Klasse"`
     → `A-Class` … `"V-Klasse"` → `V-Class`)
   - Audi `"Q4 e-tron"` → `Q4`, `"Q6 e-tron"` → `Q6` (die Quelle führt den
     Antriebszusatz nicht separat)
   - `"Mercedes"`/`"Mercedes Benz"` zusätzlich zu den bereits vorhandenen
     `Merc`/`Benz`/`MB`
   - Markenübergreifend: `"KGM"` ↔ `"SsangYong"` (echte Markenumbenennung
     2023; beide bleiben als eigenständige Hersteller bestehen, da die Quelle
     unterschiedliche Zulassungshistorien führt – Suche funktioniert in
     beide Richtungen)
   - MINI `"Hatch"` → `Cooper` (UK-Marketingbegriff für die 3-Türer-Baureihe,
     keine eigene Nameplate in der Quelle)

   Reine Diakritika-/Schreibvarianten (`Škoda`/`Skoda`, `Citroën`/`Citroen`,
   `CUPRA`/`Cupra`, `MINI`/`Mini`) benötigen **keinen** expliziten Alias-Eintrag:
   die Suche normalisiert (Kleinschreibung + NFKD-Diakritika-Faltung) sowohl
   Katalogname als auch Sucheingabe.

## Bekannte Lücken / Nicht-Ziele (Stand Dataset 2026.08.2)

Beim Abgleich der vom Auftraggeber vorgegebenen Spot-Check-Liste (330
Modelle über ~40 Hersteller) gegen die echten Rohdaten wurden folgende
**echte** Lücken identifiziert, für die es **keine** Alias-/Klassifikations-
Erklärung gibt. Sie wurden **nicht** manuell aus dem Gedächtnis ergänzt,
sondern bleiben bis zu einer verifizierten Quelle bewusst offen:

- **Polestar 1** – Nischen-Kleinserie (ca. 1.500 Fahrzeuge weltweit,
  2019–2021), unterhalb der Erfassungsschwelle der 14 abgedeckten Register.
- **Dacia Lodgy** – 2022 eingestellt, nie im Vereinigten Königreich verkauft,
  in keinem der abgedeckten Register mit ausreichender Zulassungszahl
  vertreten.
- **NIO EL7** – die Quelle führt NIO `EL6`/`EL8`/`ET5`/`ET7`, aber (noch)
  kein `EL7` in den abgedeckten Märkten.

Diese drei Fahrzeuge sind in Autoklick24 aktuell nur über den Freitext-
Fallback „Sonstige Marke"/„Sonstiges Modell" erfassbar. Eine spätere manuelle
Ergänzung (`source: MANUAL`) ist über das Datenmodell vorbereitet, aber
bewusst nicht ungeprüft vorgenommen worden.

**Nicht importiert (bewusst, siehe Aufgabenstellung):** Transporter/Vans
(`kind: van`, u. a. VW Caddy/Transporter/Multivan, Mercedes Vito/Sprinter,
Renault Kangoo/Trafic, Citroën Berlingo/Jumpy, Fiat Ducato) – diese sind in
der Quelle korrekt als eigener `kind` von PKW getrennt und werden in einem
späteren Schritt eigenständig importiert, sobald Autoklick24 diese Fahrzeug-
klasse anbietet. Ebenso nicht importiert: Motorräder, Mopeds, Busse, LKW.

## Reproduzierbarkeit

Die verwendeten Rohdateien liegen unverändert in
[`packages/database/vendor/vehiclesdb/`](../packages/database/vendor/vehiclesdb/)
und sind Teil des Git-Repositories – ein Import ist damit jederzeit
deterministisch reproduzierbar, unabhängig vom aktuellen Stand des externen
GitHub-Repositories.

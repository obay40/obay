# Fahrzeugdatenquellen

Dieses Dokument beschreibt, woher der Autoklick24-Fahrzeugkatalog
(`VehicleManufacturer`/`VehicleModel`) stammt, unter welcher Lizenz er steht,
und wie er importiert/aktualisiert wird. Es ist die verbindliche Antwort auf
"Woher kommt dieser Datensatz?".

**Kurzfassung:** Die aktive Quelle ist seit 2026-09-02 **mobile.de**
(`source: MOBILE_DE`, siehe unten). Der zuvor genutzte VehiclesDB-Import
(`source: VEHICLES_DB`) bleibt vollständig in der Datenbank erhalten –
nichts wurde gelöscht –, ist aber nicht mehr Teil der Standardsicht
(`queries.ts` filtert alle Lesezugriffe explizit auf `source: MOBILE_DE`).
Grund für den Wechsel: Der Auftraggeber hat die konkreten Marken-/Modelldaten
der VehiclesDB-Quelle abgelehnt und stattdessen eine selbst erhobene
mobile.de-Marken-/Modell-Hierarchie vorgegeben.

## Aktive Quelle: mobile.de

- **Herkunft:** manuell erhobene Abschrift der öffentlichen
  mobile.de-Gebrauchtwagen-Sitemap (Automarken und die dort gelisteten
  Modelle), ergänzt um das offizielle mobile.de Make/Model-Changelog
  (`services.mobile.de`) für neuere, in der Sitemap noch nicht sichtbare
  Car-Marken.
  - Sitemap: <https://www.mobile.de/sitemap/gebrauchtwagen/>
  - Changelog: <https://services.mobile.de/manual/makemodelupdate.html>
- **Scope:** ausschließlich der Auto-/Car-Bereich von mobile.de. Es wurden
  **keine** separaten mobile.de-Portale für Motorräder, E-Bikes, LKW oder
  Wohnmobile als Quelle verwendet (siehe "Hinweise & Quellen"-Sheet der
  vendorten Excel-Datei). Einzelne Vans/Pick-ups, die mobile.de selbst unter
  "Car" führt, bleiben enthalten – dieselbe Nutzfahrzeug-/PKW-Grauzone wie
  beim vorherigen VehiclesDB-Import (siehe
  [`vehicle-catalog-curation.md`](./vehicle-catalog-curation.md)).
- **Stand/Abrufdatum:** 2026-09-02
- **Umfang bei Abruf:** 153 Hersteller (inkl. 2 nur im Changelog genannte,
  ohne eigene Modellzeile: LEVC, Zhidou), 2.572 rohe Modellzeilen
- **Kein direkter API-/XML-Export:** Die Datei bildet die öffentlich
  sichtbare Sitemap plus die ausgewerteten Changelog-Ergänzungen ab, ist aber
  kein Export der internen mobile.de Reference-Data-API.
- **Lizenz:** mobile.de veröffentlicht für diese öffentlich zugänglichen
  Sitemap-/Referenzseiten keine explizite Datenlizenz. Es handelt sich um
  eine faktische Auflistung (Marken-/Modellnamen), keine urheberrechtlich
  geschützte Datenbank im Sinne einer CC-Lizenz wie bei VehiclesDB. Die Quelle
  wird trotzdem durchgängig benannt (dieses Dokument, Commit-Historie,
  vendorte Rohdatei).

### Rohdaten-Ablage

```
packages/database/vendor/mobile-de/
  mobile-de-automarken-modelle-2026-09-02.xlsx   (Originaldatei, unverändert)
  catalog.json                                    (daraus extrahiert: {marke, modellgruppe, modell, ebene, anzeige, quelletyp, quelleUrl}[])
```

### Modellgruppen-Hierarchie (Marke → Modellgruppe → Modell)

mobile.de führt für **6 Marken** eine zweistufige Hierarchie in den
Rohdaten: BMW, Ford, Lexus, MINI, Mercedes-Benz, Porsche. Beispiel:
Mercedes-Benz "B-Klasse" ist eine Modellgruppe, "B 180" darunter ein
konkretes Modell (Motorisierung). Bei allen anderen 147 Marken ist jede
Zeile bereits ein flaches Einzelmodell. Autoklick24 bildet diese Hierarchie
auf zwei unterschiedliche Arten ab, je nachdem wie detailliert die
Baureihen-Auswahl für die jeweilige Marke sein soll:

**BMW und Mercedes-Benz: echte 3-Ebenen-Hierarchie.** Für diese zwei Marken
bekommt jede Baureihe eine eigene `VehicleModelGroup` (z. B. "3er Reihe
(alle)", "C-Klasse (alle)"), und JEDE Motorisierung bleibt ein eigenes,
einzeln auswählbares `VehicleModel` mit `groupId` auf diese Gruppe (z. B.
"320", "C 200" – keine Kollabierung zu Aliasen). Die Fahrzeugsuche zeigt
dafür drei abhängige Felder (Marke → Baureihe → Modell); die Baureihe ist
optional wählbar ("3er Reihe (alle)" ohne konkretes Modell). Realisiert wird
das direkt über das `modellgruppe`-Feld der Rohdaten (10 echte BMW-Gruppen:
1er–7er Reihe, M-Modelle, X-Reihe, Z-Reihe; 27 echte Mercedes-Klassen:
A-Klasse–X-Klasse) plus ein paar synthetischen Gruppen für Baureihen ohne
eigene mobile.de-Modellgruppen-Zeile (BMW 8er Reihe, BMW i, BMW
Hybrid-Sondermodelle, Mercedes AMG GT, Mercedes Historische Modelle). Alle
Details, Begründungen und Sonderfälle (u. a. Ausschlüsse, Alias-Konsolidierung
bei Dubletten wie Mercedes "T-Klasse") stehen in
[`packages/database/src/vehicle-catalog/mobile-de-model-groups.ts`](../packages/database/src/vehicle-catalog/mobile-de-model-groups.ts).
Diese Struktur ist bewusst nicht auf BMW/Mercedes-Benz beschränkt – jeder
Hersteller kann künftig dieselbe Gruppen-Hierarchie bekommen, ohne
Schemaänderung (`VehicleModel.groupId` ist für alle Hersteller nullable).

**Ford, Lexus, MINI, Porsche: Alias-Kollabierung ("Modell vs.
Variante"-Prinzip).** Für diese vier Marken würde eine 1:1-Übernahme jeder
Zeile als eigenständiges `VehicleModel` die Modellauswahl mit hunderten
Motorisierungscodes zumüllen, ohne dass eine Baureihen-Zwischenebene in der
UI gewünscht ist. Deshalb entsteht pro Baureihe genau **ein** kanonisches
`VehicleModel` (z. B. Porsche "911", Lexus "ES"), die einzelnen
Motorisierungs-/Trim-Codes werden als **Aliase** angehängt (durchsuchbar,
aber nicht als eigene Zeile in der Auswahl sichtbar). Modellgruppen, die
mehrere **echte, unterschiedliche** Nameplates bündeln (Ford "Tourneo
(alle)" → Tourneo, Grand Tourneo, Tourneo Connect, Tourneo Courier, Tourneo
Custom), werden anhand ihrer Kind-Zeilen aufgesplittet. Details in
[`packages/database/src/vehicle-catalog/mobile-de-groupings.ts`](../packages/database/src/vehicle-catalog/mobile-de-groupings.ts).

### Importprozess

Script: [`packages/database/scripts/import-mobile-de-catalog.ts`](../packages/database/scripts/import-mobile-de-catalog.ts)
(`pnpm mobile-de-catalog:import`)

1. `catalog.json` einlesen
2. Modellgruppen-Hierarchie auflösen (siehe oben): für BMW/Mercedes-Benz
   `VehicleModelGroup`-Zeilen anlegen und jede Motorisierung als eigenes,
   gruppenzugeordnetes `VehicleModel` importieren (`mobile-de-model-groups.ts`);
   für Ford/Lexus/MINI/Porsche Rohwert → kanonisches Modell auflösen,
   Split-Modellgruppen-Wrapper überspringen (`mobile-de-groupings.ts`); für
   alle Marken zusätzlich unspezifische Sammelwerte ausschließen und
   Nutzfahrzeug-Modell-Overrides anwenden
3. Hersteller-Kategorie-Overrides anwenden (reine Nutzfahrzeugmarken wie
   Barkas/Piaggio/MAN/Iveco trotz "Auto/Car"-Scoping bei mobile.de; echte
   Dubletten wie "Bovensiepen" = ALPINA ausblenden)
4. Datenbank aktualisieren: `upsert` je `(source, sourceId)`, Aliase je
   kanonischem Modell synchronisieren. Datensätze, die beim aktuellen Import
   fehlen, werden **nicht gelöscht**, sondern auf `sourceActive = false`
   gesetzt
5. Importstatistik ausgeben (importiert/aktualisiert/unverändert/übersprungen/
   Warnungen/Fehler)

### PKW-Kuratierung

mobile.de liefert bereits nahezu ausschließlich Auto/Car-Daten (siehe Scope
oben). Ein systematischer Stichprobenscan gegen bekannte LKW-/Wohnmobil-/
Motorrad-Begriffe über den vollständigen Datensatz ergab nur wenige echte
Treffer, die konsistent mit der bereits im VehiclesDB-Import getroffenen
Einstufung kuratiert wurden (siehe
[`vehicle-catalog-curation.md`](./vehicle-catalog-curation.md) für die
vollständige Methodik):

- **Barkas** (COMMERCIAL_VEHICLE) – ehemaliger DDR-Nutzfahrzeughersteller,
  einziges Modell "B1000" ist ein Kleintransporter
- **Piaggio** (COMMERCIAL_VEHICLE) – nur "Ape"/"Ape TM" (Kleintransporter)
  und "Porter" (Kleinlaster), kein PKW
- **MAN** (TRUCK) – reiner LKW-Hersteller, einziges Modell "TGE" ist ein
  Nutzfahrzeug
- **Iveco** (TRUCK) – reiner LKW-Hersteller, einziges Modell "Massif" ist ein
  Nutzfahrzeug-Geländewagen auf LKW-Chassis-Basis
- **Bovensiepen** (ausgeblendet, Dublette) – bürgerlicher Name der Alpina
  Burkard Bovensiepen GmbH & Co. KG, bereits vollständig unter "ALPINA"
  vorhanden

Alle vier Zuordnungen sind mit Begründung in
`mobile-de-groupings.ts` (`MANUFACTURER_CATEGORY_OVERRIDES`,
`MANUFACTURER_HIDDEN_DUPLICATES`) dokumentiert.

### Bekannte Lücken (Stand 2026-09-02)

- **LEVC**, **Zhidou** – nur im Changelog-Sheet als Marke genannt, aber ohne
  eine einzige Modellzeile in der ausgewerteten Sitemap. Erscheinen als
  Hersteller, liefern aber (korrekt) eine leere Modellauswahl.

## Frühere Quelle (inaktiv): VehiclesDB

Bis 2026-09-02 aktiv, seither vollständig in der Datenbank erhalten
(`source: VEHICLES_DB`), aber nicht mehr Teil der von `queries.ts`
gelieferten Standardsicht.

- **Projekt:** [VehiclesDB](https://vehiclesdb.com) ([GitHub: `vehiclesdb/vehiclesdb`](https://github.com/vehiclesdb/vehiclesdb))
- **Verwendete Dateien:** `catalog/car/makes.json`, `catalog/car/models.json`
- **Dataset-Version:** `2026.08.2`, Abrufdatum 2026-09-02
- **Umfang bei Abruf:** 277 PKW-Hersteller, 4.895 PKW-Modelle
- **Lizenz:** CC BY 4.0 (siehe
  [`packages/database/vendor/vehiclesdb/ATTRIBUTION.md`](../packages/database/vendor/vehiclesdb/ATTRIBUTION.md)
  und [`LICENSE`](../packages/database/vendor/vehiclesdb/LICENSE); beide
  Dateien bleiben unverändert im Repository, da die Attribution laut
  Lizenzbedingungen nicht entfernt werden darf, auch wenn die Quelle
  inaktiv ist)
- **Importer:** [`packages/database/scripts/import-vehicle-catalog.ts`](../packages/database/scripts/import-vehicle-catalog.ts)
  (`pnpm vehicle-catalog:import`) – funktioniert weiterhin, aktualisiert aber
  nur die inaktive Quelle
- **Bekannte, damals dokumentierte Lücken:** Polestar 1, Dacia Lodgy, NIO
  EL7, Volkswagen Multivan (siehe Git-Historie dieses Dokuments für Details) –
  gegenstandslos, seit diese Quelle nicht mehr aktiv ist.

## Datenherkunft je Datensatz

Jeder `VehicleManufacturer`/`VehicleModel` trägt `source`, `sourceId` und
`sourceVersion`:

- `source: MOBILE_DE` – **aktive Quelle**, aus obigem mobile.de-Import,
  `sourceId` = `slugify(Marke)` bzw. `slugify(Marke)/slugify(kanonisches Modell)`
  (z. B. `"bmw"`, `"bmw/3er"`)
- `source: VEHICLES_DB` – frühere Quelle, vollständig erhalten aber inaktiv,
  `sourceId` = VehiclesDB-`id` (z. B. `"bmw"`, `"bmw/3-series"`)
- `source: MANUAL` – von Autoklick24 manuell gepflegt, `sourceId` ist `null`
- `source: EXTERNAL_PROVIDER` – vorgesehen für einen künftigen kommerziellen
  Fahrzeugdaten-Provider, aktuell ungenutzt

`VehicleManufacturer.slug` ist **nicht** global eindeutig, sondern nur je
`source` (`@@unique([source, slug])`, siehe `schema.prisma`) – derselbe Slug
(z. B. `"bmw"`) existiert gleichzeitig unter `VEHICLES_DB` und `MOBILE_DE`.
Alle Lesefunktionen in `queries.ts` filtern deshalb immer zusätzlich nach
`source`, sodass Nutzer nie eine Kollision sehen.

## Warum kein Live-Zugriff zur Laufzeit?

Die Website fragt beim Öffnen des Marken-/Modell-Dropdowns **nicht** live bei
mobile.de oder VehiclesDB ab. Stattdessen:

```
mobile.de (Sitemap + Changelog, Stand 2026-09-02)
        ↓  (einmalig, manuell erhoben)
packages/database/vendor/mobile-de/catalog.json   (Rohkopie, in Git versioniert)
        ↓  pnpm mobile-de-catalog:import
Postgres (VehicleManufacturer / VehicleModel / *Alias, source=MOBILE_DE)
        ↓
/api/v1/vehicle-manufacturers (gecacht)
        ↓
Website (später iOS/Android)
```

Damit ist Autoklick24 zu jedem Zeitpunkt mit dem zuletzt erfolgreich
importierten eigenen Katalog lauffähig, auch wenn mobile.de nicht erreichbar
ist.

## Reproduzierbarkeit

Die verwendeten Rohdateien liegen unverändert in
[`packages/database/vendor/mobile-de/`](../packages/database/vendor/mobile-de/)
(aktive Quelle) bzw.
[`packages/database/vendor/vehiclesdb/`](../packages/database/vendor/vehiclesdb/)
(frühere Quelle) und sind Teil des Git-Repositories – ein Import ist damit
jederzeit deterministisch reproduzierbar, unabhängig vom aktuellen Stand der
externen Quellen.

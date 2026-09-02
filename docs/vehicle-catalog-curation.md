# Fahrzeugkatalog-Kuratierung (PKW-Filter)

Ergänzt [`vehicle-data-sources.md`](./vehicle-data-sources.md) um die zweite
Stufe der Pipeline: aus dem vollständigen VehiclesDB-Import wird der
kuratierte **Autoklick24-PKW-Katalog**, den die normale Fahrzeugsuche zeigt.

## Zwei Ebenen, ein Import

```
RAW / SOURCE DATA                    AUTOKLICK24 CURATED CATALOG
(vollständiger VehiclesDB-Import,    (dieselben Zeilen + category/
 277 Hersteller, 4.895 Modelle,       vehicleCategory/
 NIE verändert oder gelöscht)         isVisibleInPassengerCarSearch)
        │                                       │
        └──────────── EIN Import ───────────────┘
                (scripts/import-vehicle-catalog.ts)
```

Kein Datensatz wird beim Kuratieren gelöscht. `VehicleManufacturer.category`
und `VehicleModel.vehicleCategory`/`isVisibleInPassengerCarSearch` sind
zusätzliche Spalten – die Rohdaten (Name, Slug, Herkunft) bleiben
unverändert abrufbar. Eine falsche Kuratierungsentscheidung ist daher
jederzeit rückgängig zu machen: den betreffenden Override in
`packages/database/src/vehicle-catalog/overrides.ts` entfernen und
`pnpm vehicle-catalog:import` erneut laufen lassen.

## Pipeline

```
SOURCE DATA (VehiclesDB, catalog/car/*.json)
   ↓
TYPE FILTER            – nur kind: "car" (bereits beim Vendoring geschehen)
   ↓
MANUFACTURER NORMALIZATION  – Slug, Diakritika-Faltung, Aliase
   ↓
MODEL NORMALIZATION         – Slug, deutsche displayName, Aliase
   ↓
CATEGORY FILTER         – category/vehicleCategory aus Overrides
   ↓
OVERRIDES                – manufacturerOverrides/modelOverrides (overrides.ts)
   ↓
DEDUPLICATION            – Slug-Eindeutigkeit je Hersteller, Dubletten-Hides
   ↓
GERMAN DISPLAY NAMES     – BMW "1er" …, Mercedes "…-Klasse"
   ↓
AUTOKLICK24 CURATED CATALOG  (isVisibleInPassengerCarSearch=true)
   ↓
API  (/api/v1/vehicle-manufacturers, .../:slug/models)
   ↓
WEB / MOBILE  (dieselbe API für Website und künftige Apps)
```

## Warum diese sechs Hersteller? (Wohnmobil-Funde)

Fiat, Mercedes-Benz, Ford, Citroën, Volkswagen und Renault sind die
gängigen Basisfahrzeug-Hersteller für Wohnmobile (Ducato, Sprinter,
Transit, Jumper, Transporter/Crafter, Master). Deshalb kommen genau dort
Aufbauhersteller-Namen (Hymer, Carthago, Frankia, Bürstner, Rapido, Elnagh
…) als fälschliche "Modelle" vor – bei keinem anderen der 277 Hersteller.

## Kategorien

`VehicleCategory` (Prisma-Enum): `PASSENGER_CAR`, `MOTORCYCLE`,
`COMMERCIAL_VEHICLE`, `MOTORHOME`, `TRUCK`, `BUS`, `TRAILER`,
`AGRICULTURAL`, `SPECIAL_VEHICLE`, `OTHER`, `MULTI_CATEGORY`.

Die normale PKW-Suche zeigt nur:

- Hersteller mit `category IN (PASSENGER_CAR, MULTI_CATEGORY)`
- UND Modelle mit `isVisibleInPassengerCarSearch = true`

`isVisibleInPassengerCarSearch` wird beim Import abgeleitet (nicht manuell
gepflegt): `false`, sobald der Hersteller nicht PASSENGER_CAR/MULTI_CATEGORY
ist, das Modell selbst eine andere `vehicleCategory` hat, oder ein
Override `excludeFromPassengerCarSearch` setzt (z. B. bei
Marken-Fehlzuordnungen wie MINI-Modellen unter BMW, wo keine eigene
Kategorie nötig ist – das Fahrzeug ist ja ein PKW, nur unter der falschen
Marke).

## Fund-Zusammenfassung (Dataset 2026.08.2)

Der komplette Katalog (alle 277 Hersteller, alle 4.895 Modelle) wurde
geprüft, nicht nur die Beispiele aus der Aufgabenstellung. Details mit
Fundort je Eintrag: `packages/database/src/vehicle-catalog/overrides.ts`.

| Fund | Hersteller | Modelle |
|---|---:|---:|
| Wohnmobil-/Aufbauhersteller als Modell unter Chassis-Marke | – | 57 |
| Sonderfahrzeuge (Bestatter/Krankenwagen) als Modell | – | 2 |
| Mercedes-Benz-LKW-Baureihen als Modell | – | 3 |
| MINI-/Alpina-Modelle fälschlich unter BMW | – | 15 |
| VW-interne Typ-/Aufbaucodes als Modell | – | 16 |
| Ram-Kastenwagen (Promaster/Promaster City) | – | 2 |
| Reine Wohnmobil-/Sonderfahrzeug-/Nutzfahrzeug-Hersteller | 17 | (kaskadiert, s. u.) |
| Echte Hersteller-Dublette (Bmw Alpina ≡ Alpina) | 1 | – |

Modelle, die allein durch Hersteller-Kategorie kaskadiert ausgeblendet
werden (z. B. alle Modelle von Nilsson, Bürstner GmbH, LDV, Barkas, Bedford
…), kommen zu den 95 direkt kuratierten Modellen hinzu – macht insgesamt
124 von 4.895 Modellen (~2,5 %), die nicht in der PKW-Suche erscheinen.

## Bewusst nicht entschieden (curation-review.json)

Sieben Fälle sind echte Grauzonen (z. B. VW Iltis – militärnah, aber auch
zivil verkauft; Austin-Morris/Innocenti/Leyland Cars "Mini" – historisch
korrekte Vorgängermarken des heutigen Mini). Sie bleiben **sichtbar**, bis
sie manuell geprüft wurden – siehe
`packages/database/src/vehicle-catalog/curation-review.json`.

## Historische Modelle

`isHistoric` markiert nicht mehr produzierte, aber weiterhin gebraucht
gehandelte PKW (BMW Z3/Z8/i8, Audi TT/R8, VW Phaeton/Scirocco/Corrado,
Opel Adam/Calibra/Omega/Vectra, Ford Mondeo/Sierra/Scorpio, Mercedes-Benz
SLK/CLK/CLC, Saab 9-3/9-5, Peugeot RCZ, Renault Laguna – siehe
`HISTORIC_MODEL_SOURCE_IDS` in overrides.ts). Sie werden **nicht**
ausgeblendet, sondern in der Modellauswahl in einen eigenen Abschnitt
"Weitere / historische Modelle" einsortiert, damit sie die aktuelle Auswahl
nicht überfrachten, aber weiterhin auffindbar bleiben.

Die Liste ist bewusst auf die in der Aufgabenstellung genannten Beispiele
beschränkt statt spekulativ auf alle 4.895 Modelle ausgeweitet – welche
Modelle "historisch" sind, ist ohne verlässliche `productionEnd`-Daten aus
der Quelle nicht seriös automatisch bestimmbar.

## Bekannte zusätzliche Datenlücke

Neben den bereits in `vehicle-data-sources.md` dokumentierten Lücken
(Polestar 1, Dacia Lodgy, NIO EL7) fehlt **Volkswagen Multivan** vollständig
in der Quelle (weder unter `car` noch unter `van`) – nicht falsch
klassifiziert, schlicht nicht katalogisiert. Nicht manuell ergänzt, siehe
Prinzip "keine Daten aus dem Gedächtnis erfinden".

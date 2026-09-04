/**
 * Autoklick24-Overrides für den VehiclesDB-Import.
 *
 * Zweck: Korrekturen/Ergänzungen vornehmen, OHNE die vendorten Rohdaten in
 * packages/database/vendor/vehiclesdb/ zu verändern. Jeder Eintrag braucht
 * eine `note`, die begründet, WARUM er existiert – reine "sieht besser aus"-
 * Änderungen ohne nachvollziehbaren Grund gehören nicht hierher.
 *
 * `sourceId` referenziert jeweils die VehiclesDB-`id` aus
 * catalog/car/{makes,models}.json (z. B. Hersteller `"bmw"`, Modell
 * `"bmw/3-series"`) – NICHT unsere eigene interne id.
 *
 * ---------------------------------------------------------------------------
 * PKW-KURATIERUNG (siehe docs/vehicle-catalog-curation.md)
 * ---------------------------------------------------------------------------
 * Zwei getrennte Ebenen bleiben immer erhalten:
 *   1. RAW/SOURCE DATA   – der unveränderte VehiclesDB-Import (alle Zeilen).
 *   2. CURATED CATALOG   – dieselben Zeilen, zusätzlich mit `category` /
 *      `vehicleCategory` / `isVisibleInPassengerCarSearch` versehen. Die
 *      normale Autoklick24-Suche liest NUR Zeilen mit
 *      category=PASSENGER_CAR (Hersteller) UND
 *      isVisibleInPassengerCarSearch=true (Modell).
 * Nichts wird dafür gelöscht – nur als "nicht PKW" markiert. Das ist
 * jederzeit rückgängig zu machen, indem der jeweilige Override entfernt
 * wird (siehe DECISIONS unten je Fund).
 *
 * Systematik der Recherche: der komplette importierte Katalog (277
 * Hersteller, 4.895 Modelle) wurde gegen kuratierte Wohnmobil-/
 * Aufbauhersteller-, Sonderfahrzeug- und Cross-Marken-Muster geprüft (nicht
 * nur Stichproben aus der Aufgabenstellung). Ergebnis: ~2 % der Modelle
 * (94 von 4.895) und 17 von 277 Herstellern sind betroffen – die
 * VehiclesDB-eigene "car"-Kategorie war bereits weitgehend sauber (reine
 * Motorrad-/LKW-/Bus-/Landmaschinen-HERSTELLER sind gar nicht erst
 * importiert, da sie nur in VehiclesDBs motorcycle/truck/bus/agricultural-
 * Dateien stehen, die wir nie eingelesen haben).
 *
 * Echte Grauzonen werden NICHT geraten, sondern in curation-review.json
 * dokumentiert und bleiben bis zur manuellen Prüfung sichtbar (siehe unten).
 */
import type { VehicleCategory, VehicleCurationStatus } from "../../generated/client/index";

export interface ManufacturerOverride {
  /** VehiclesDB make-id, z. B. "mercedes-benz". */
  sourceId: string;
  /** Abweichender Anzeigename, falls die Quelle nicht passt (selten nötig). */
  displayName?: string;
  /** Zusätzliche, von Autoklick24 kuratierte Such-Aliase (über die Quelle hinaus). */
  aliases?: string[];
  /** Popularität für die UI-Sortierung in Deutschland (kein Quellen-Ranking). */
  isPopular?: boolean;
  /** Hersteller aus dem Import ausblenden (isActive=false), z. B. echte Dubletten. */
  hidden?: boolean;
  /**
   * Fahrzeugkategorie (siehe VehicleCategory-Enum im Prisma-Schema).
   * Standard PASSENGER_CAR. Nur PASSENGER_CAR (und MULTI_CATEGORY, dort
   * entscheidet die Modell-Kategorie) erscheint in der normalen PKW-Suche.
   */
  category?: VehicleCategory;
  /** Pflichtbegründung für Auditierbarkeit. */
  note: string;
}

export interface ModelOverride {
  /** VehiclesDB model-id, z. B. "bmw/3-series". */
  sourceId: string;
  displayName?: string;
  aliases?: string[];
  isPopular?: boolean;
  /** Modell aus dem Import ausblenden (isActive=false) – für echte Dubletten. */
  hidden?: boolean;
  /** Fahrzeugkategorie des Modells, falls abweichend vom Hersteller-Standard. */
  vehicleCategory?: VehicleCategory;
  /**
   * Explizit aus der PKW-Suche ausblenden, OHNE die Kategorie zu ändern –
   * für Fälle wie Marken-Fehlzuordnungen (MINI-Modelle unter BMW) oder
   * interne Typcodes: das Fahrzeug ist real und PASSENGER_CAR, soll aber
   * nicht als eigenständiges Modell in der normalen Auswahl erscheinen.
   */
  excludeFromPassengerCarSearch?: boolean;
  /** Nicht mehr produziert, aber weiterhin gebraucht gehandelt (siehe Aufgabenstellung §13). */
  isHistoric?: boolean;
  curationStatus?: VehicleCurationStatus;
  /** Pflichtbegründung für Auditierbarkeit. */
  note: string;
}

/**
 * Für Deutschland manuell kuratierte "Beliebte Marken"-Reihenfolge (reine
 * UI-Sortierung, siehe Aufgabenstellung – alle anderen Marken bleiben
 * vollständig erreichbar). In dieser Reihenfolge auch als isPopular=true
 * markiert.
 */
export const POPULAR_MANUFACTURER_SOURCE_IDS = [
  "volkswagen",
  "mercedes-benz",
  "bmw",
  "audi",
  "skoda",
  "opel",
  "ford",
  "toyota",
  "hyundai",
  "porsche",
] as const;

// -----------------------------------------------------------------------
// FUND 1: Hersteller, die vollständig Wohnmobil-/Aufbau-/Sonderfahrzeug-/
// Nutzfahrzeugmarken sind (nicht nur einzelne Modelle). Alle 17 wurden im
// vollständigen 277-Hersteller-Katalog identifiziert, nicht nur anhand der
// Beispiele aus der Aufgabenstellung.
// -----------------------------------------------------------------------
const NON_PASSENGER_CAR_MANUFACTURERS: { sourceId: string; category: VehicleCategory; note: string }[] = [
  { sourceId: "nilsson", category: "SPECIAL_VEHICLE", note: "Reiner Bestattungswagen-Aufbauhersteller (Volvo-S80-Basis)." },
  { sourceId: "binz", category: "SPECIAL_VEHICLE", note: "Bestattungswagen-/Krankenwagen-Aufbauhersteller." },
  { sourceId: "superior", category: "SPECIAL_VEHICLE", note: "Bestattungswagen-Aufbauhersteller (Cadillac-Basis)." },
  { sourceId: "polaris", category: "SPECIAL_VEHICLE", note: "UTV/Side-by-Side (nicht straßenzulassungspflichtig als PKW), vergleichbar Quad/ATV." },
  { sourceId: "bravia", category: "MOTORHOME", note: "Wohnmobilhersteller." },
  { sourceId: "burstner-gmbh", category: "MOTORHOME", note: "Wohnmobilhersteller (separater Hersteller-Eintrag zu den Burstner-Modell-Treffern unter Fiat/Mercedes-Benz)." },
  { sourceId: "campereve", category: "MOTORHOME", note: "Wohnmobilhersteller." },
  { sourceId: "font-vendome", category: "MOTORHOME", note: "Wohnmobilhersteller." },
  { sourceId: "julia-camper", category: "MOTORHOME", note: "Wohnmobilhersteller." },
  { sourceId: "vanster", category: "MOTORHOME", note: "Campervan-Ausbauhersteller." },
  { sourceId: "westfalia-mobil-gmbh", category: "MOTORHOME", note: "Wohnmobilhersteller (separater Hersteller-Eintrag zum Westfalia-Modell-Treffer unter Volkswagen)." },
  { sourceId: "mitsubishi-fuso", category: "TRUCK", note: "Reiner LKW-Hersteller (Fuso Canter), keine PKW-Modelle." },
  { sourceId: "ldv", category: "COMMERCIAL_VEHICLE", note: "Reiner Nutzfahrzeughersteller (Kastenwagen), keine PKW-Modelle." },
  { sourceId: "barkas", category: "COMMERCIAL_VEHICLE", note: "Ehemaliger DDR-Nutzfahrzeughersteller (Kleintransporter), keine PKW-Modelle." },
  { sourceId: "commer", category: "COMMERCIAL_VEHICLE", note: "Britischer Nutzfahrzeughersteller, keine PKW-Modelle." },
  { sourceId: "piaggio", category: "COMMERCIAL_VEHICLE", note: "Nur das Nutzfahrzeug \"Ape\" (dreirädriger Kleintransporter), kein PKW." },
  { sourceId: "bedford", category: "COMMERCIAL_VEHICLE", note: "Britischer Nutzfahrzeughersteller (Transporter/LKW), keine PKW-Modelle." },
];

// -----------------------------------------------------------------------
// FUND 2: Mischhersteller – überwiegend PKW, aber mit einzelnen
// Nutzfahrzeugmodellen. Hersteller bleibt PASSENGER_CAR bzw. wird
// MULTI_CATEGORY, die betroffenen Modelle werden einzeln ausgeblendet
// (siehe modelOverrides unten).
// -----------------------------------------------------------------------
const MULTI_CATEGORY_MANUFACTURERS: { sourceId: string; note: string }[] = [
  {
    sourceId: "ram",
    note:
      "Ram 1500 ist ein regulär an Privatkunden verkaufter Pickup (PKW-nah), Promaster/" +
      "Promaster City sind reine Kastenwagen. Hersteller bleibt MULTI_CATEGORY, die zwei " +
      "Nutzfahrzeugmodelle werden einzeln ausgeblendet.",
  },
];

export const manufacturerOverrides: ManufacturerOverride[] = [
  {
    sourceId: "mercedes-benz",
    aliases: ["Mercedes", "Mercedes Benz"],
    note:
      'Quelle liefert bereits Aliase ["Merc","Benz","MB"], aber nicht die im deutschen ' +
      'Sprachgebrauch häufigste Kurzform "Mercedes" bzw. "Mercedes Benz" ohne Bindestrich.',
  },
  {
    sourceId: "kgm",
    aliases: ["SsangYong"],
    note:
      "KGM ist die 2023 umbenannte SsangYong-Marke. Beide bleiben als eigenständige " +
      "Hersteller bestehen (unterschiedliche Zulassungshistorien in der Quelle), aber " +
      "die Suche soll in beide Richtungen funktionieren (siehe auch ssangyong unten).",
  },
  {
    sourceId: "ssangyong",
    aliases: ["KGM"],
    note: "Gegenstück zum kgm-Override oben – siehe dort.",
  },
  {
    sourceId: "bmw-alpina",
    hidden: true,
    note:
      'Echte Dublette: separater Hersteller-Eintrag "Bmw Alpina" mit nur einem Modell ' +
      '("B7"), das bereits unter dem eigenständigen Hersteller "Alpina" korrekt vorhanden ' +
      "ist (dort inkl. B7/B7 Biturbo Allrad). Ausgeblendet statt gelöscht (siehe Deduplikate).",
  },
  ...NON_PASSENGER_CAR_MANUFACTURERS.map(
    ({ sourceId, category, note }): ManufacturerOverride => ({ sourceId, category, note }),
  ),
  ...MULTI_CATEGORY_MANUFACTURERS.map(
    ({ sourceId, note }): ManufacturerOverride => ({ sourceId, category: "MULTI_CATEGORY", note }),
  ),
  ...POPULAR_MANUFACTURER_SOURCE_IDS.map(
    (sourceId): ManufacturerOverride => ({
      sourceId,
      isPopular: true,
      note:
        "Manuell kuratierte Autoklick24-Popularität für den deutschen Markt (reine " +
        "UI-Sortierung, siehe POPULAR_MANUFACTURER_SOURCE_IDS).",
    }),
  ),
];

/**
 * Deutsche BMW-Baureihen-Bezeichnungen. Die Quelle führt ausschließlich die
 * englischen Namen ("1 Series" … "8 Series") – displayName wird auf die in
 * Deutschland übliche Kurzform gesetzt, sourceName ("1 Series") bleibt
 * erhalten (Feld `name`) und wandert zusätzlich in die Aliase (siehe
 * Aufgabenstellung §8/§9: Lokalisierung darf den Originalnamen nicht
 * verlieren).
 */
const BMW_SERIES_DISPLAY_NAMES: ModelOverride[] = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({
  sourceId: `bmw/${n}-series`,
  displayName: `${n}er`,
  aliases: [`${n} Series`, `BMW ${n} Series`, `BMW ${n}er`],
  note: `Deutsche Bezeichnung "${n}er" für "${n} Series" – im deutschen Markt die gängigere Baureihen-Bezeichnung.`,
}));

/**
 * Deutsche Mercedes-Baureihen-Bezeichnungen. Gleiches Prinzip wie bei BMW
 * oben: displayName auf die deutsche "-Klasse"-Form, Originalname bleibt in
 * `name` und als Alias erhalten.
 */
const MERCEDES_KLASSE_DISPLAY_NAMES: ModelOverride[] = ["A", "B", "C", "E", "S", "G", "V", "R", "T"].map(
  (letter) => ({
    sourceId: `mercedes-benz/${letter.toLowerCase()}-class`,
    displayName: `${letter}-Klasse`,
    aliases: [`${letter}-Class`, `${letter} Class`, `Mercedes ${letter}-Klasse`],
    note: `Deutsche Bezeichnung "${letter}-Klasse" für "${letter}-Class".`,
  }),
);

/**
 * FUND 3: Wohnmobil-/Aufbauhersteller-Namen, die als "Modell" unter einem
 * Fahrzeug-Chassishersteller stehen (Fiat Ducato, Mercedes Sprinter, Ford
 * Transit, Citroën Jumper, VW Transporter/Crafter, Renault Master sind die
 * gängigen Wohnmobil-Basisfahrzeuge – das erklärt, warum genau diese sechs
 * Hersteller betroffen sind und keine anderen). 57 Treffer, siehe
 * docs/vehicle-catalog-curation.md für die vollständige Liste mit Fundort.
 */
const MOTORHOME_MODEL_SOURCE_IDS = [
  "citroen/adria",
  "citroen/burstner",
  "citroen/dethleffs",
  "citroen/possl",
  "fiat/adria-mobil",
  "fiat/adria-twin",
  "fiat/adria-win",
  "fiat/adriatik",
  "fiat/benimar",
  "fiat/burstner",
  "fiat/chausson",
  "fiat/chausson-welcome-95",
  "fiat/dethleffs",
  "fiat/elnagh",
  "fiat/elnagh-p250",
  "fiat/eura-mobil",
  "fiat/eura-mobil-sport",
  "fiat/hobby-600",
  "fiat/hymer",
  "fiat/hymer-b-584",
  "fiat/hymer-b544",
  "fiat/hymer-camp-544",
  "fiat/knaus",
  "fiat/lmc-liberty",
  "fiat/lmc-liberty-6900i",
  "fiat/mclouis",
  "fiat/rapido",
  "fiat/rapido-709f",
  "fiat/rapido-9095df",
  "fiat/rimor",
  "fiat/trigano-fi1",
  "fiat/weinsberg",
  "ford/benimar",
  "ford/chausson",
  "ford/eura-mobil",
  "ford/rimor-arf54s3",
  "ford/trigano",
  "mercedes-benz/adriatik",
  "mercedes-benz/binz",
  "mercedes-benz/bravia",
  "mercedes-benz/burstner",
  "mercedes-benz/carthago",
  "mercedes-benz/elnagh",
  "mercedes-benz/eura",
  "mercedes-benz/explorateur",
  "mercedes-benz/frankia",
  "mercedes-benz/hymer",
  "mercedes-benz/hymermobil",
  "mercedes-benz/lmc",
  "mercedes-benz/rapido",
  "mercedes-benz/rimor",
  "renault/adriatik",
  "renault/burstner-t625",
  "volkswagen/california",
  "volkswagen/grand-california",
  "volkswagen/joker",
  "volkswagen/westfalia",
] as const;

/** FUND 4: Sonderfahrzeuge (Bestattungs-/Krankenwagen) als Modell unter einer sonst normalen PKW-Marke. */
const SPECIAL_VEHICLE_MODEL_SOURCE_IDS = ["cadillac/hearse", "mercedes-benz/ambulance"] as const;

/** FUND 5: Mercedes-Benz-LKW-/Nutzfahrzeugbaureihen im PKW-Modellbestand. */
const MB_TRUCK_MODEL_SOURCE_IDS = ["mercedes-benz/atego", "mercedes-benz/unimog", "mercedes-benz/vario"] as const;

/**
 * FUND 6: MINI- und Alpina-Modelle, die fälschlich unter BMW stehen, obwohl
 * MINI und Alpina im Datenbestand als eigenständige Hersteller mit den
 * korrekten (und vollständigeren) Modelllisten existieren. Werden hier
 * NICHT gelöscht oder umgehängt (echte Reassignment würde die bereits
 * korrekten MINI-/Alpina-Einträge duplizieren), sondern nur unter BMW aus
 * der PKW-Suche ausgeblendet.
 */
const BMW_MINI_ALPINA_DUPE_SOURCE_IDS = [
  "bmw/alpina",
  "bmw/alpina-b3",
  "bmw/alpina-b5",
  "bmw/alpina-b6",
  "bmw/alpina-b7",
  "bmw/alpina-b8-gran",
  "bmw/alpina-roadster-s",
  "bmw/alpina-xb7",
  "bmw/clubman-cooper",
  "bmw/cooper",
  "bmw/cooper-s",
  "bmw/john-cooper-works",
  "bmw/mini",
  "bmw/mini-cooper",
  "bmw/mini-one",
] as const;

/**
 * FUND 7: VW-interne Typ-/Aufbaucodes, die in der Quelle als "Modell"
 * geführt werden, obwohl sie kein Kunde als eigenständige Baureihe kennt
 * (z. B. "3BG" = interner Typcode des Passat B6, nie als Verkaufsname
 * verwendet). Nachvollzogen anhand von VWs tatsächlicher Modellhistorie –
 * NICHT pauschal alle numerischen VW-Modellnamen entfernt: "411", "412",
 * "K70", "181", "Type 3" etc. sind echte, historisch verkaufte VW-Nameplates
 * und bleiben unangetastet.
 */
const VW_TYPECODE_MODEL_SOURCE_IDS = [
  "volkswagen/166",
  "volkswagen/18",
  "volkswagen/19-e",
  "volkswagen/204",
  "volkswagen/211",
  "volkswagen/221",
  "volkswagen/224",
  "volkswagen/241",
  "volkswagen/251",
  "volkswagen/253",
  "volkswagen/28",
  "volkswagen/3bg",
  "volkswagen/7hk",
  "volkswagen/wg2211",
  "volkswagen/kasten",
  "volkswagen/tourer-van-500-mq",
] as const;

/** FUND 8: Ram-Kastenwagen (siehe MULTI_CATEGORY_MANUFACTURERS oben). */
const RAM_COMMERCIAL_MODEL_SOURCE_IDS = ["ram/promaster", "ram/promaster-city"] as const;

/**
 * Historische, nicht mehr produzierte, aber weiterhin gebraucht gehandelte
 * PKW – NICHT ausgeblendet, nur für die 3-stufige UI-Gruppierung
 * (Beliebt/Aktuell/Historisch, siehe Aufgabenstellung §13/§14) markiert.
 * Liste bewusst auf die in der Aufgabenstellung explizit genannten
 * Beispiele beschränkt statt geraten, welche der 4.895 Modelle "historisch"
 * sind – die übrigen bleiben reguläre (nicht-historische) Modelle.
 */
const HISTORIC_MODEL_SOURCE_IDS = [
  "bmw/z3",
  "bmw/z8",
  "bmw/i8",
  "audi/tt",
  "audi/r8",
  "volkswagen/phaeton",
  "volkswagen/scirocco",
  "volkswagen/corrado",
  "opel/adam",
  "opel/calibra",
  "opel/omega",
  "opel/vectra",
  "ford/mondeo",
  "ford/sierra",
  "ford/scorpio",
  "mercedes-benz/slk",
  "mercedes-benz/clk",
  "mercedes-benz/clc",
  "saab/9-3",
  "saab/9-5",
  "peugeot/rcz",
  "renault/laguna",
] as const;

function excludeFromPassengerCarSearch(sourceIds: readonly string[], note: string): ModelOverride[] {
  return sourceIds.map((sourceId) => ({ sourceId, excludeFromPassengerCarSearch: true, note }));
}

export const modelOverrides: ModelOverride[] = [
  ...BMW_SERIES_DISPLAY_NAMES,
  ...MERCEDES_KLASSE_DISPLAY_NAMES,
  {
    sourceId: "audi/q4",
    aliases: ["Q4 e-tron"],
    note:
      "Die Quelle führt das Modell als \"Q4\" ohne Antriebszusatz (aktuell einzige " +
      'Antriebsvariante). Alias auf die im Handel übliche Bezeichnung "Q4 e-tron".',
  },
  {
    sourceId: "audi/q6",
    aliases: ["Q6 e-tron"],
    note: 'Siehe audi/q4 – gleiche Begründung für "Q6 e-tron".',
  },
  {
    sourceId: "mini/cooper",
    aliases: ["Hatch"],
    note:
      '"MINI Hatch" ist ein UK-Marketingbegriff für die 3-Türer-Baureihe, keine eigene ' +
      "Nameplate in der Quelle. Nächstliegender tatsächlicher Datensatz ist \"Cooper\" " +
      "(Basis-Baureihe). Aus dem Spot-Check der Aufgabenstellung, nicht 1:1 deckungsgleich " +
      "– dokumentiert statt stillschweigend als eigenes Modell erfunden.",
  },
  ...[2, 3, 4].map(
    (n): ModelOverride => ({
      sourceId: `polestar/polestar-${n}`,
      aliases: [`${n}`],
      note:
        `Die Quelle führt das Modell als "Polestar ${n}" (Herstellername im Modellnamen ` +
        `wiederholt). Alias auf die bloße Zahl "${n}", wie sie innerhalb der bereits nach ` +
        "Polestar gefilterten Modellauswahl typischerweise erwartet wird.",
    }),
  ),

  // --- PKW-Kuratierung: FUND 3-8, siehe Konstanten + Kommentare oben ---
  ...MOTORHOME_MODEL_SOURCE_IDS.map(
    (sourceId): ModelOverride => ({
      sourceId,
      vehicleCategory: "MOTORHOME",
      note:
        "Wohnmobil-/Aufbauhersteller-Name, der unter dem Chassishersteller als Modell " +
        "registriert wurde (gängige Praxis bei campingausgebauten Fahrzeugen). Kein PKW.",
    }),
  ),
  ...SPECIAL_VEHICLE_MODEL_SOURCE_IDS.map(
    (sourceId): ModelOverride => ({
      sourceId,
      vehicleCategory: "SPECIAL_VEHICLE",
      note: "Sonderfahrzeug (Bestattungs-/Krankenwagen), kein für den normalen Gebrauchtwagenkäufer relevanter PKW.",
    }),
  ),
  ...MB_TRUCK_MODEL_SOURCE_IDS.map(
    (sourceId): ModelOverride => ({
      sourceId,
      vehicleCategory: "TRUCK",
      note: "Mercedes-Benz-LKW-/Nutzfahrzeugbaureihe, kein PKW.",
    }),
  ),
  ...excludeFromPassengerCarSearch(
    BMW_MINI_ALPINA_DUPE_SOURCE_IDS,
    "MINI- bzw. Alpina-Modell, das fälschlich unter BMW statt unter der eigenständigen " +
      "Marke (MINI/Alpina) geführt wird. Dort bereits korrekt vorhanden – hier ausgeblendet " +
      "statt dupliziert dargestellt (siehe Markenzuordnung-Korrektur).",
  ),
  ...excludeFromPassengerCarSearch(
    VW_TYPECODE_MODEL_SOURCE_IDS,
    "Interner VW-Typ-/Aufbaucode, keine dem Käufer bekannte Modellbezeichnung (z. B. \"3BG\" " +
      "= Passat B6 Typcode). Kein anderes reales VW-Modell dahinter, das erhalten bleiben " +
      "müsste – daher ausgeblendet statt umbenannt.",
  ),
  ...RAM_COMMERCIAL_MODEL_SOURCE_IDS.map(
    (sourceId): ModelOverride => ({
      sourceId,
      vehicleCategory: "COMMERCIAL_VEHICLE",
      note: "Ram-Kastenwagen (Promaster/Promaster City), kein PKW – Ram 1500 bleibt sichtbar.",
    }),
  ),
  ...HISTORIC_MODEL_SOURCE_IDS.map(
    (sourceId): ModelOverride => ({
      sourceId,
      isHistoric: true,
      note:
        "Nicht mehr produziert, aber auf dem Gebrauchtwagenmarkt weiterhin gehandelt " +
        "(siehe Aufgabenstellung §13) – bleibt sichtbar, wird in der UI nur als " +
        '"weiteres/historisches Modell" statt als aktuelles Modell einsortiert.',
    }),
  ),
];

/**
 * Manuell von Autoklick24 gepflegte Hersteller (source: MANUAL), die in
 * VehiclesDB nicht vorkommen. Aktuell bewusst leer – siehe "Bekannte
 * Lücken" in docs/vehicle-data-sources.md: Datensätze wie Polestar 1 oder
 * Dacia Lodgy wurden NICHT aus dem Gedächtnis ergänzt, weil sie sich in der
 * gewählten Quelle nicht verifizieren ließen. Architektur unterstützt
 * manuelle Ergänzungen (source: MANUAL), sobald sie durch eine verifizierte
 * Quelle belegt sind.
 */
export interface ManualManufacturer {
  slug: string;
  name: string;
  country?: string;
  isPopular?: boolean;
  aliases?: string[];
  note: string;
}
export const manualManufacturers: ManualManufacturer[] = [];

export interface ManualModel {
  /** Slug des Ziel-Herstellers (entweder aus VehiclesDB oder aus manualManufacturers). */
  manufacturerSlug: string;
  slug: string;
  name: string;
  productionStart?: number;
  productionEnd?: number;
  isPopular?: boolean;
  aliases?: string[];
  note: string;
}
export const manualModels: ManualModel[] = [];

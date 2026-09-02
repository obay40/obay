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
 * Herkunft der Einträge unten: systematischer Abgleich der vom Auftraggeber
 * vorgegebenen Spot-Check-Liste (330 Modelle über ~40 Hersteller) gegen die
 * echten VehiclesDB-Rohdaten (Dataset 2026.08.2), siehe
 * docs/vehicle-data-sources.md. 26 Abweichungen wurden gefunden; 22 davon
 * sind hier als Alias dokumentiert, 4 sind echte Datenlücken (siehe
 * "Bekannte Lücken" in docs/vehicle-data-sources.md) und werden bewusst
 * NICHT ergänzt.
 */

export interface ManufacturerOverride {
  /** VehiclesDB make-id, z. B. "mercedes-benz". */
  sourceId: string;
  /** Abweichender Anzeigename, falls die Quelle nicht passt (selten nötig). */
  displayName?: string;
  /** Zusätzliche, von Autoklick24 kuratierte Such-Aliase (über die Quelle hinaus). */
  aliases?: string[];
  /** Popularität für die UI-Sortierung in Deutschland (kein Quellen-Ranking). */
  isPopular?: boolean;
  /** Hersteller aus dem Import ausblenden (isActive=false), z. B. Dubletten. */
  hidden?: boolean;
  /** Pflichtbegründung für Auditierbarkeit. */
  note: string;
}

export interface ModelOverride {
  /** VehiclesDB model-id, z. B. "bmw/3-series". */
  sourceId: string;
  displayName?: string;
  aliases?: string[];
  isPopular?: boolean;
  hidden?: boolean;
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
 * Deutsche BMW-Baureihen-Bezeichnungen ("1er" … "8er"): die Quelle führt
 * ausschließlich die englischen Namen ("1 Series" … "8 Series").
 */
const BMW_SERIES_ALIASES: ModelOverride[] = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({
  sourceId: `bmw/${n}-series`,
  aliases: [`${n}er`],
  note: `Deutsche Kurzform "${n}er" für "${n} Series" – im deutschen Markt die gängigere Bezeichnung.`,
}));

/**
 * Deutsche Mercedes-Baureihen-Bezeichnungen ("A-Klasse" … "V-Klasse"): die
 * Quelle führt ausschließlich die englischen Namen ("A-Class" … "V-Class").
 */
const MERCEDES_KLASSE_ALIASES: ModelOverride[] = ["A", "B", "C", "E", "S", "G", "V", "R", "T"].map(
  (letter) => ({
    sourceId: `mercedes-benz/${letter.toLowerCase()}-class`,
    aliases: [`${letter}-Klasse`, `${letter} Klasse`],
    note: `Deutsche Bezeichnung "${letter}-Klasse" für "${letter}-Class".`,
  }),
);

export const modelOverrides: ModelOverride[] = [
  ...BMW_SERIES_ALIASES,
  ...MERCEDES_KLASSE_ALIASES,
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

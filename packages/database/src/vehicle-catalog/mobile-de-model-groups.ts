/**
 * Echte 3-Ebenen-Fahrzeughierarchie (Marke → Modellgruppe/Baureihe →
 * konkretes Modell) für BMW und Mercedes-Benz. Anders als
 * mobile-de-groupings.ts (das für Ford/Lexus/MINI/Porsche
 * Motorisierungscodes zu Aliasen EINES kanonischen Modells kollabiert)
 * bleibt hier jede Motorisierung ein eigenständiges, auswählbares
 * VehicleModel - nur zusätzlich einer VehicleModelGroup zugeordnet.
 * Auftrag: "Marke → Modellgruppe/Baureihe → konkretes Modell", z. B.
 * Mercedes-Benz "B-Klasse (alle)" → "B 180".
 *
 * mobile.de liefert für BEIDE Marken bereits ein `modellgruppe`-Feld pro
 * Katalogzeile, das für die meisten Baureihen 1:1 der gewünschten
 * Gruppierung entspricht (10 echte BMW-Gruppen: 1er..7er Reihe,
 * M-Modelle, X-Reihe, Z-Reihe; 27 echte Mercedes-Klassen: A-Klasse..
 * X-Klasse). Der Importer nutzt dieses Feld DIREKT (siehe
 * import-mobile-de-catalog.ts) - hier werden nur die Fälle definiert, für
 * die die Quelle KEINE eigene Modellgruppen-Zeile führt (SYNTHETIC_GROUPS,
 * z. B. BMW "8er Reihe": 840/850 stehen in der Quelle flach ohne
 * modellgruppe) sowie ein paar Sonderfälle (Alias-Konsolidierung,
 * Dublette). Alle Zuordnungen sind anhand der echten mobile.de-Rohdaten
 * geprüft (siehe docs/vehicle-data-sources.md) - keine geraten.
 */

export interface SyntheticModelGroup {
  marke: string;
  /** Rohname der Gruppe, wie er auch als VehicleModelGroup.name gespeichert wird. */
  name: string;
  /** UI-Anzeigename, z. B. "8er Reihe (alle)". */
  displayName: string;
  /** Rohe mobile.de-`modell`-Werte, die dieser Gruppe zugeordnet werden. */
  childModelNames: string[];
  /** Setzt VehicleModel.isHistoric=true für alle Kinder (siehe "Historische Modelle" unten). */
  markChildrenHistoric?: boolean;
  note: string;
}

/**
 * Gruppen ohne eigene mobile.de-Modellgruppen-Zeile (Datenlücke in der
 * Quelle) - die Kinder stehen dort flach (modellgruppe: null).
 */
export const SYNTHETIC_GROUPS: SyntheticModelGroup[] = [
  {
    marke: "BMW",
    name: "8er Reihe",
    displayName: "8er Reihe (alle)",
    childModelNames: ["840", "850"],
    note: "mobile.de führt für die 8er-Reihe keine eigene Modellgruppe; 840/850 stehen flach ohne modellgruppe-Feld.",
  },
  {
    marke: "BMW",
    name: "BMW i",
    displayName: "BMW i (alle)",
    childModelNames: ["i3", "i4", "i5", "i7", "i8", "iX", "iX1", "iX2", "iX3"],
    note: "Elektro-Baureihe ohne eigene mobile.de-Modellgruppe; alle i-Modelle stehen flach ohne modellgruppe-Feld.",
  },
  {
    marke: "BMW",
    name: "Hybrid-Sondermodelle",
    displayName: "Hybrid-Sondermodelle",
    childModelNames: ["ActiveHybrid 3", "ActiveHybrid 5", "ActiveHybrid 7", "ActiveHybrid X6"],
    note:
      "Frühere Hybridvarianten der 3er/5er/7er-Reihe und X6, in der Quelle flach ohne modellgruppe-Feld. " +
      "Bewusst NICHT auf die vier Basis-Baureihen verteilt (siehe Aufgabenstellung Abschnitt 15: " +
      "\"nicht flach zwischen normalen Modellgruppen verteilen\"), sondern als eigene Gruppe geführt.",
  },
  {
    marke: "Mercedes-Benz",
    name: "AMG GT",
    displayName: "AMG GT (alle)",
    childModelNames: ["AMG GT", "AMG GT C", "AMG GT R", "AMG GT S"],
    note: "Eigenständiges AMG-Modell ohne mobile.de-Modellgruppe; alle Varianten stehen flach ohne modellgruppe-Feld.",
  },
  {
    marke: "Mercedes-Benz",
    name: "Historische Modelle",
    displayName: "Historische / klassische Mercedes-Benz Modelle (alle)",
    childModelNames: [
      "190",
      "200",
      "220",
      "230",
      "240",
      "250",
      "260",
      "270",
      "280",
      "290",
      "300",
      "320",
      "350",
      "380",
      "400",
      "416",
      "420",
      "450",
      "500",
      "560",
      "600",
    ],
    markChildrenHistoric: true,
    note:
      "Vorfusionäre Mercedes-Nomenklatur ohne Buchstaben-Klasse (z. B. \"200\" = 200 D/E der W123/W124-Ära), " +
      "in der Quelle flach ohne modellgruppe-Feld. Zusätzlich isHistoric=true (siehe Importer), damit sie auch " +
      "in der bestehenden 3-Stufen-UI-Gruppierung (Beliebt/Aktuell/Historisch) korrekt einsortiert werden.",
  },
];

/**
 * Rohe mobile.de-`modell`-Werte, die trotz eigenem Katalogeintrag NICHT als
 * eigenständiges Modell/Gruppen-Mitglied übernommen werden (unspezifische
 * Sammelwerte/Dubletten). Ergänzt EXCLUDE_MODEL_NAMES aus
 * mobile-de-groupings.ts um hierarchie-spezifische Fälle.
 */
export const HIERARCHY_EXCLUDE_MODEL_NAMES: ReadonlyArray<{ marke: string; modell: string; note: string }> = [
  {
    marke: "Mercedes-Benz",
    modell: "GT-Klasse",
    note:
      "Unspezifischer mobile.de-Sammelwert ohne eigene Motorisierungsangabe - dieselbe Nameplate wie \"AMG GT\" " +
      "(siehe SYNTHETIC_GROUPS), hier aber ohne Zusatzinformation. Wird nicht als fünftes AMG-GT-Mitglied geführt.",
  },
];

/**
 * Rohe mobile.de-`modell`-Werte, die statt eines eigenen Modells als Alias
 * eines bestehenden, standalone (gruppenlosen) Modells geführt werden -
 * echte Dubletten derselben Baureihe ohne Gruppen-Charakter.
 */
export const HIERARCHY_ALIAS_ATTACHMENTS: ReadonlyArray<{
  marke: string;
  targetModelName: string;
  aliasModelName: string;
  note: string;
}> = [
  {
    marke: "Mercedes-Benz",
    targetModelName: "T-Klasse",
    aliasModelName: "T model",
    note: "Dieselbe historische Kombi-/T-Modell-Variante (W124 \"T-Modell\") wie \"T-Klasse\".",
  },
  {
    marke: "Mercedes-Benz",
    targetModelName: "T-Klasse",
    aliasModelName: "T modell",
    note: "Dieselbe historische Kombi-/T-Modell-Variante (W124 \"T-Modell\") wie \"T-Klasse\".",
  },
  {
    marke: "Mercedes-Benz",
    targetModelName: "T-Klasse",
    aliasModelName: "W124 t modell",
    note: "Dieselbe historische Kombi-/T-Modell-Variante (W124 \"T-Modell\") wie \"T-Klasse\".",
  },
];

/**
 * BMW-M-Performance-Trims der X-Reihe (X3 M, X5 M, ...) stehen in der
 * mobile.de-Quelle unter modellgruppe="X-Reihe" (siehe catalog.json) - dort
 * bleiben sie auch (ihre "jeweilige Baureihe", siehe Aufgabenstellung
 * Abschnitt 12). Eine zusätzliche Zuordnung zur M-Modelle-Gruppe würde eine
 * Dublette in der UI erzeugen ("keine Duplikate", Abschnitt 12) und wird
 * deshalb bewusst NICHT vorgenommen; die reinen M-Nameplates (M2, M3, M4,
 * M5, M6, M8) und die M-Performance-Trims der nummerierten Baureihen
 * (M135, M140i, M235, ...) stehen bereits nativ unter modellgruppe=
 * "M-Modelle" in der Quelle.
 */
export const MAKES_WITH_MODEL_GROUP_HIERARCHY: ReadonlySet<string> = new Set(["BMW", "Mercedes-Benz"]);

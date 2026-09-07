/**
 * mobile.de liefert seine Katalogzeilen in einer zweistufigen Hierarchie
 * (Marke → Modellgruppe → Modell). Für Ford, Lexus, MINI und Porsche nutzt
 * mobile.de diese Gruppierung, bei allen anderen sind alle Zeilen bereits
 * flache Einzelmodelle.
 *
 * WICHTIG: BMW und Mercedes-Benz werden NICHT hier behandelt, sondern über
 * eine echte 3-Ebenen-Hierarchie (Marke → VehicleModelGroup → VehicleModel,
 * siehe mobile-de-model-groups.ts + import-mobile-de-catalog.ts) - dort
 * bleibt jede Motorisierung ein eigenständiges, auswählbares Modell statt
 * zu einem Alias zu kollabieren. Für die vier hier verbleibenden Marken gilt
 * weiterhin: naive Übernahme jeder Zeile als eigenständiges VehicleModel
 * würde die Modellauswahl mit Motorisierungscodes zumüllen - deshalb wird
 * für jede Modellgruppe EIN kanonisches VehicleModel erzeugt (die Baureihe/
 * Nameplate, z. B. "ES", "911"), ihre Modell-Kinder (Motorisierungen/Trims
 * wie "ES 300", "996") werden zu ALIASEN dieses kanonischen Modells -
 * durchsuchbar, aber nicht als eigene Zeile in der Modellauswahl sichtbar.
 *
 * Ausnahme: manche Modellgruppen fassen mehrere ECHTE, unterschiedliche
 * Nameplates unter einem Sammelbegriff zusammen (Ford "Tourneo (alle)"
 * enthält mehrere eigenständige Nameplates). Diese werden hier explizit
 * aufgesplittet.
 *
 * Alle Zuordnungen wurden manuell anhand der tatsächlichen mobile.de-Daten
 * geprüft (siehe docs/vehicle-data-sources.md) - keine geraten.
 */

export interface MobileDeGrouping {
  marke: string;
  /** Kanonischer Modellname, wie er in der Modellauswahl erscheint. */
  canonicalModel: string;
  /**
   * Rohe mobile.de-`modell`-Werte, die zu Aliasen dieses kanonischen
   * Modells werden (inkl. ggf. der Modellgruppen-Zeile selbst, falls ihr
   * Name vom canonicalModel abweicht, z. B. "1er Reihe" → "1er").
   */
  memberModelNames: string[];
  note: string;
}

/**
 * Modellgruppen, die mehrere eigenständige Nameplates bündeln (nicht nur
 * Motorisierungen EINER Baureihe) - werden nicht 1:1 kollabiert, sondern
 * anhand ihrer Kind-Zeilen aufgeteilt (siehe GROUPINGS unten, wo jedes
 * Kind wie X1/X2/.../X7 sein eigenes kanonisches Modell bekommt).
 */
export const SPLIT_MODELLGRUPPEN: ReadonlySet<string> = new Set(["Ford::Tourneo (alle)"]);

export const GROUPINGS: MobileDeGrouping[] = [
  // --- Ford: Tourneo-Sammelgruppe enthält mehrere echte Nameplates ---
  { marke: "Ford", canonicalModel: "Tourneo", memberModelNames: ["Tourneo"], note: "Basis-Nameplate innerhalb der \"Tourneo (alle)\"-Sammelgruppe." },
  { marke: "Ford", canonicalModel: "Grand Tourneo", memberModelNames: ["Grand Tourneo"], note: "Eigenständige Nameplate innerhalb der Tourneo-Familie." },
  { marke: "Ford", canonicalModel: "Tourneo Connect", memberModelNames: ["Tourneo Connect"], note: "Eigenständige Nameplate innerhalb der Tourneo-Familie." },
  { marke: "Ford", canonicalModel: "Tourneo Courier", memberModelNames: ["Tourneo Courier"], note: "Eigenständige Nameplate innerhalb der Tourneo-Familie." },
  { marke: "Ford", canonicalModel: "Tourneo Custom", memberModelNames: ["Tourneo Custom"], note: "Eigenständige Nameplate innerhalb der Tourneo-Familie." },
  // Rohdaten-Casing-Korrekturen (Model a/b/t -> korrekte historische Schreibweise):
  { marke: "Ford", canonicalModel: "Model A", memberModelNames: ["Model a"], note: "Case-Korrektur: mobile.de-Rohwert \"Model a\" -> historisch korrekt \"Model A\"." },
  { marke: "Ford", canonicalModel: "Model B", memberModelNames: ["Model b"], note: "Case-Korrektur: mobile.de-Rohwert \"Model b\" -> historisch korrekt \"Model B\"." },
  { marke: "Ford", canonicalModel: "Model T", memberModelNames: ["Model t"], note: "Case-Korrektur: mobile.de-Rohwert \"Model t\" -> historisch korrekt \"Model T\"." },

  // --- Lexus: alle Modellgruppen sind einfache 1:1-Baureihen ---
  { marke: "Lexus", canonicalModel: "ES", memberModelNames: ["ES-Serie", "ES 300", "ES 330", "ES 350"], note: "mobile.de-Modellgruppe \"ES-Serie\" + Motorisierungs-Kinder." },
  { marke: "Lexus", canonicalModel: "GS", memberModelNames: ["GS-Serie", "GS 250", "GS 300", "GS 350", "GS 430", "GS 450", "GS 460", "GS F"], note: "mobile.de-Modellgruppe \"GS-Serie\" + Motorisierungs-Kinder inkl. Performance-Trim GS F." },
  { marke: "Lexus", canonicalModel: "GX", memberModelNames: ["GX Series", "GX 460", "GX 470", "GX 550"], note: "mobile.de-Modellgruppe \"GX Series\" + Motorisierungs-Kinder." },
  { marke: "Lexus", canonicalModel: "IS", memberModelNames: ["IS-Serie", "IS 200", "IS 220", "IS 250", "IS 300", "IS 350", "IS-F"], note: "mobile.de-Modellgruppe \"IS-Serie\" + Motorisierungs-Kinder inkl. Performance-Trim IS-F." },
  { marke: "Lexus", canonicalModel: "LS", memberModelNames: ["LS-Serie", "LS 400", "LS 430", "LS 460", "LS 500", "LS 600"], note: "mobile.de-Modellgruppe \"LS-Serie\" + Motorisierungs-Kinder." },
  { marke: "Lexus", canonicalModel: "LX", memberModelNames: ["LX-Serie", "LX 450", "LX 470", "LX 500", "LX 570", "LX 600", "LX 700"], note: "mobile.de-Modellgruppe \"LX-Serie\" + Motorisierungs-Kinder." },
  { marke: "Lexus", canonicalModel: "NX", memberModelNames: ["NX-Serie", "NX 200", "NX 300", "NX 350h", "NX 450h"], note: "mobile.de-Modellgruppe \"NX-Serie\" + Motorisierungs-Kinder." },
  { marke: "Lexus", canonicalModel: "RC", memberModelNames: ["RC-Serie", "RC 200", "RC 300", "RC 350", "RC F"], note: "mobile.de-Modellgruppe \"RC-Serie\" + Motorisierungs-Kinder inkl. Performance-Trim RC F." },
  { marke: "Lexus", canonicalModel: "RX", memberModelNames: ["RX-Serie", "RX 200", "RX 300", "RX 330", "RX 350", "RX 400", "RX 450", "RX 500"], note: "mobile.de-Modellgruppe \"RX-Serie\" + Motorisierungs-Kinder." },

  // --- MINI: Modellgruppen sind einfache 1:1-Baureihen ---
  { marke: "MINI", canonicalModel: "Cabrio", memberModelNames: ["Cabrio Serie", "Cooper Cabrio", "Cooper D Cabrio", "Cooper S Cabrio", "Cooper SD Cabrio", "John Cooper Works Cabrio", "One Cabrio"], note: "mobile.de-Modellgruppe \"Cabrio Serie\" + Trim-Kinder." },
  { marke: "MINI", canonicalModel: "Clubman", memberModelNames: ["Clubman Serie", "Cooper D Clubman", "Cooper S Clubman", "John Cooper Works Clubman", "One Clubman", "One D Clubman", "COOPER CLUBMAN", "COOPER SD CLUBMAN"], note: "mobile.de-Modellgruppe \"Clubman Serie\" + Trim-Kinder. Die zwei GROSSGESCHRIEBENEN Einträge stammen aus dem mobile.de-Changelog (andere Quelle als die Sitemap) und bezeichnen dieselben Trims wie \"Cooper Clubman\"/\"Cooper SD Clubman\"." },
  { marke: "MINI", canonicalModel: "Countryman", memberModelNames: ["Countryman Serie", "Cooper C Countryman", "Cooper Countryman", "Cooper D Countryman", "Cooper E Countryman", "Cooper S Countryman", "Cooper SD Countryman", "Cooper SE Countryman", "Countryman C (Cooper)", "Countryman D (Cooper)", "Countryman E (Cooper)", "Countryman S (Cooper)", "Countryman SE (Cooper)", "John Cooper Works Countryman", "One Countryman", "One D Countryman"], note: "mobile.de-Modellgruppe \"Countryman Serie\" + Trim-Kinder." },
  { marke: "MINI", canonicalModel: "Coupé", memberModelNames: ["Coupe Serie", "Cooper Coupé", "Cooper S Coupé", "Cooper SD Coupé", "John Cooper Works Coupé"], note: "mobile.de-Modellgruppe \"Coupe Serie\" + Trim-Kinder." },
  { marke: "MINI", canonicalModel: "Paceman", memberModelNames: ["Paceman Serie", "Cooper D Paceman", "Cooper Paceman", "Cooper S Paceman", "Cooper SD Paceman", "John Cooper Works Paceman"], note: "mobile.de-Modellgruppe \"Paceman Serie\" + Trim-Kinder." },
  { marke: "MINI", canonicalModel: "Roadster", memberModelNames: ["Roadster Serie", "Cooper Roadster", "Cooper S Roadster", "Cooper SD Roadster", "John Cooper Works Roadster"], note: "mobile.de-Modellgruppe \"Roadster Serie\" + Trim-Kinder." },
  // Basis-Hatch: hat KEINE eigene Modellgruppe bei mobile.de, "Cooper" ist die Basis-Nameplate selbst.
  { marke: "MINI", canonicalModel: "Cooper", memberModelNames: ["Cooper", "Cooper C", "Cooper D", "Cooper E", "Cooper S", "Cooper SD", "Cooper SE", "John Cooper Works", "ONE"], note: "Basis-3-Türer-Hatch: \"Cooper\" ist die mobile.de-Nameplate selbst (keine eigene Modellgruppe), Cooper C/D/E/S/SD/SE und John Cooper Works sind Antriebs-/Performance-Trims. \"ONE\" (Großschreibung, Changelog-Quelle) ist derselbe Trim wie \"One\" unten." },
  { marke: "MINI", canonicalModel: "One", memberModelNames: ["One D", "One First"], note: "\"One\" ist die eigenständige Basis-Trim-Nameplate (unterhalb Cooper); One D/One First sind ihre Antriebs-/Ausstattungsvarianten." },
  { marke: "MINI", canonicalModel: "Aceman", memberModelNames: ["Aceman", "Aceman E", "Aceman SE", "John Cooper Works Aceman"], note: "Aktuelle Nameplate ohne eigene mobile.de-Modellgruppe (Datenlücke, analog BMW 8er); E/SE/JCW sind Antriebs-/Performance-Trims." },

  // --- Porsche: eine Modellgruppe (911), Kinder = Generationscodes ---
  { marke: "Porsche", canonicalModel: "911", memberModelNames: ["911er Reihe", "911 f modell", "F modell", "911 jubiläumsmodell", "911 model", "911 Urmodell", "930", "964", "991", "992", "993", "996", "997", "Modell 911"], note: "mobile.de-Modellgruppe \"911er Reihe\" + ihre Generationscode-Kinder (930/964/991-997 sind Porsches eigene interne 911-Generationsbezeichnungen, keine eigenen Nameplates)." },
];

/** Nicht-spezifische mobile.de-Sammelwerte ohne zuordenbare Nameplate - werden übersprungen, nicht als Modell importiert. */
export const EXCLUDE_MODEL_NAMES: ReadonlyArray<{ marke: string; modell: string; note: string }> = [
  { marke: "BMW", modell: "Sondermodell", note: "Unspezifischer mobile.de-Sammelwert ohne erkennbare Baureihe." },
  { marke: "Kia", modell: "Mini", note: "Unspezifischer mobile.de-Sammelwert (Kia führt kein Modell namens \"Mini\")." },
  { marke: "Kia", modell: "Model", note: "Unspezifischer mobile.de-Sammelwert ohne erkennbare Nameplate." },
];

/** Modelle, die zwar bei mobile.de im Auto-/Car-Scope stehen, aber Nutzfahrzeug-Baureihen sind (siehe docs/vehicle-catalog-curation.md, Präzedenzfall aus dem VehiclesDB-Import). */
export const COMMERCIAL_MODEL_OVERRIDES: ReadonlyArray<{ marke: string; modell: string; note: string }> = [
  { marke: "Mercedes-Benz", modell: "Vario", note: "Leichte/mittlere LKW-Baureihe, kein PKW (bereits im VehiclesDB-Import mit derselben Begründung ausgeblendet)." },
];

/** Toyota "Aygo sondermodell" ist modellbezogen genug, um als Alias statt Ausschluss geführt zu werden. */
export const EXTRA_ALIAS_ATTACHMENTS: ReadonlyArray<{ marke: string; canonicalModel: string; aliasModelName: string; note: string }> = [
  { marke: "Toyota", canonicalModel: "Aygo (X)", aliasModelName: "Aygo sondermodell", note: "Sondermodell-Variante des Aygo, kein eigenständiges Modell." },
];

/**
 * Nicht-spezifische mobile.de-Platzhalterwerte ("Other"/"OTHER"), die
 * mobile.de für Marken ohne feinere Modellaufschlüsselung verwendet -
 * dasselbe Muster wie BMW "Sondermodell" oder Kia "Mini"/"Model" oben,
 * hier aber über viele (v. a. seltene/historische) Marken verteilt. Werden
 * übersprungen statt als Modell "Other" in der Auswahl zu erscheinen.
 */
const GENERIC_PLACEHOLDER_MAKES = [
  "Auto Union",
  "Bovensiepen",
  "Changan",
  "Dallara",
  "DFM",
  "Estrima",
  "Foton",
  "Geely",
  "Invicta",
  "Jetour",
  "Messerschmitt",
  "Packard",
  "Riley",
  "Rimac",
  "Togg",
  "Voyah",
  "Zeekr",
] as const;

export const EXCLUDE_MODEL_NAMES_EXTRA: ReadonlyArray<{ marke: string; modell: string; note: string }> = [
  ...GENERIC_PLACEHOLDER_MAKES.map((marke) => ({
    marke,
    modell: "Other",
    note: 'Unspezifischer mobile.de-Platzhalterwert ("Other") ohne erkennbare Nameplate.',
  })),
  { marke: "TYN-e", modell: "OTHER", note: 'Unspezifischer mobile.de-Platzhalterwert ("OTHER") ohne erkennbare Nameplate.' },
];

/**
 * Hersteller-Kategorie-Overrides: reine Nutzfahrzeug-/Kleintransporter-
 * Marken, die trotz mobile.de "Auto/Car"-Scoping im Datensatz stehen (weil
 * mobile.de sie in derselben Gebrauchtwagen-Sitemap führt). Gleiche
 * Kategorien wie beim VehiclesDB-Import für dieselben Marken (siehe
 * overrides.ts, NON_PASSENGER_CAR_MANUFACTURERS) - hier erneut anhand der
 * tatsächlichen mobile.de-Modell-Zeilen verifiziert, nicht übernommen.
 */
export const MANUFACTURER_CATEGORY_OVERRIDES: ReadonlyArray<{
  marke: string;
  category: "COMMERCIAL_VEHICLE" | "TRUCK";
  note: string;
}> = [
  { marke: "Barkas", category: "COMMERCIAL_VEHICLE", note: 'Ehemaliger DDR-Nutzfahrzeughersteller (einziges Modell: "B1000"-Kleintransporter), keine PKW-Modelle. Gleiche Einstufung wie im VehiclesDB-Import.' },
  { marke: "Piaggio", category: "COMMERCIAL_VEHICLE", note: 'Nur Nutzfahrzeuge ("Ape"/"Ape TM" dreirädriger Kleintransporter, "Porter" Kleinlaster), kein PKW. Gleiche Einstufung wie im VehiclesDB-Import.' },
  { marke: "MAN", category: "TRUCK", note: 'Reiner LKW-Hersteller; einziges Modell "TGE" ist ein Nutzfahrzeug (baugleich zum VW Crafter), kein PKW.' },
  { marke: "Iveco", category: "TRUCK", note: 'Reiner LKW-Hersteller; einziges Modell "Massif" ist ein Nutzfahrzeug-Geländewagen auf LKW-Chassis-Basis, kein PKW.' },
];

/**
 * Echte Dublette: "Bovensiepen" ist der bürgerliche Name der Alpina Burkard
 * Bovensiepen GmbH & Co. KG und im Datensatz nur mit dem generischen
 * Platzhalter "Other" vertreten (siehe EXCLUDE_MODEL_NAMES_EXTRA oben) -
 * derselbe Hersteller steht bereits vollständig unter "ALPINA". Ausgeblendet
 * statt gelöscht, analog zum "Bmw Alpina"-Dublettenfund im VehiclesDB-Import.
 */
export const MANUFACTURER_HIDDEN_DUPLICATES: ReadonlyArray<{ marke: string; note: string }> = [
  {
    marke: "Bovensiepen",
    note: 'Bürgerlicher Name von "ALPINA" (Alpina Burkard Bovensiepen GmbH & Co. KG), einziges Modell ist der generische Platzhalter "Other" - echte Dublette.',
  },
];

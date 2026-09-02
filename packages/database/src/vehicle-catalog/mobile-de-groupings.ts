/**
 * mobile.de liefert seine Katalogzeilen in einer zweistufigen Hierarchie
 * (Marke → Modellgruppe → Modell). Für 6 Marken (BMW, Ford, Lexus, MINI,
 * Mercedes-Benz, Porsche) nutzt mobile.de diese Gruppierung tatsächlich –
 * bei allen anderen sind alle Zeilen bereits flache Einzelmodelle.
 *
 * Naive Übernahme jeder Zeile als eigenständiges VehicleModel würde die
 * Modellauswahl mit Motorisierungscodes zumüllen (BMW hätte statt ~50
 * Baureihen plötzlich 173 Einträge: "114","116","118"... statt "1er") -
 * genau das Problem, vor dem die Aufgabenstellung ausdrücklich warnt
 * ("Modell vs. Variante", Abschnitt 12).
 *
 * Deshalb: für jede Modellgruppe wird EIN kanonisches VehicleModel erzeugt
 * (die Baureihe/Nameplate, z. B. "1er", "C-Klasse", "911"), ihre
 * Modell-Kinder (Motorisierungen/Trims wie "320", "C 200", "996") werden zu
 * ALIASEN dieses kanonischen Modells - durchsuchbar, aber nicht als eigene
 * Zeile in der Modellauswahl sichtbar.
 *
 * Ausnahme: manche Modellgruppen fassen mehrere ECHTE, unterschiedliche
 * Nameplates unter einem Sammelbegriff zusammen (BMW "X-Reihe" enthält X1
 * bis X7 - das sind unterschiedliche Fahrzeuge, keine Motorisierungen
 * derselben Baureihe). Diese werden hier explizit aufgesplittet.
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
export const SPLIT_MODELLGRUPPEN: ReadonlySet<string> = new Set([
  "BMW::X-Reihe",
  "BMW::Z-Reihe",
  "BMW::M-Modelle",
  "Ford::Tourneo (alle)",
]);

export const GROUPINGS: MobileDeGrouping[] = [
  // --- BMW: Baureihen 1er-7er (jeweils EINE Baureihe, Kinder = Motorisierungen) ---
  { marke: "BMW", canonicalModel: "1er", memberModelNames: ["1er Reihe", "114", "116", "118", "120", "123", "125", "128", "130", "135", "1er M Coupé"], note: "mobile.de-Modellgruppe \"1er Reihe\" + ihre Motorisierungs-Kinder." },
  { marke: "BMW", canonicalModel: "2er", memberModelNames: ["2er Reihe", "2er Gran Coupé", "2002", "214 Active Tourer", "214 Gran Tourer", "216", "216 Active Tourer", "216 Gran Coupé", "216 Gran Tourer", "218", "218 Active Tourer", "218 Gran Coupé", "218 Gran Tourer", "220", "220 Active Tourer", "220 Gran Coupé", "220 Gran Tourer", "223", "223 Active Tourer", "223 Gran Coupé", "225", "225 Active Tourer", "228", "230", "230 Active Tourer"], note: "mobile.de-Modellgruppe \"2er Reihe\" + Motorisierungs-Kinder. \"2002\" ist historisch die Vorgänger-Baureihe des 2er (bekanntester BMW-Klassiker), hier als Alias mitgeführt statt eigener Zeile." },
  { marke: "BMW", canonicalModel: "3er", memberModelNames: ["3er Reihe", "315", "316", "318", "318 Gran Turismo", "320", "320 Gran Turismo", "323", "324", "325", "325 Gran Turismo", "328", "328 Gran Turismo", "330", "330 Gran Turismo", "335", "335 Gran Turismo", "340", "340 Gran Turismo"], note: "mobile.de-Modellgruppe \"3er Reihe\" + Motorisierungs-Kinder." },
  { marke: "BMW", canonicalModel: "4er", memberModelNames: ["4er Reihe", "418", "418 Gran Coupé", "420", "420 Gran Coupé", "425", "425 Gran Coupé", "428", "428 Gran Coupé", "430", "430 Gran Coupé", "435", "435 Gran Coupé", "440", "440 Gran Coupé"], note: "mobile.de-Modellgruppe \"4er Reihe\" + Motorisierungs-Kinder." },
  { marke: "BMW", canonicalModel: "5er", memberModelNames: ["5er Reihe", "518", "520", "520 Gran Turismo", "523", "524", "525", "528", "530", "530 Gran Turismo", "535", "535 Gran Turismo", "540", "545", "550", "550 Gran Turismo"], note: "mobile.de-Modellgruppe \"5er Reihe\" + Motorisierungs-Kinder." },
  { marke: "BMW", canonicalModel: "6er", memberModelNames: ["6er Reihe", "620 Gran Turismo", "628", "630", "630 Gran Turismo", "633", "635", "640", "640 Gran Coupé", "640 Gran Turismo", "645", "650", "650 Gran Coupé"], note: "mobile.de-Modellgruppe \"6er Reihe\" + Motorisierungs-Kinder." },
  { marke: "BMW", canonicalModel: "7er", memberModelNames: ["7er Reihe", "725", "728", "730", "732", "735", "740", "745", "750", "760"], note: "mobile.de-Modellgruppe \"7er Reihe\" + Motorisierungs-Kinder." },
  // 8er hat KEINE eigene mobile.de-Modellgruppe (Datenlücke) - 840/850 stehen flach.
  { marke: "BMW", canonicalModel: "8er", memberModelNames: ["840", "850"], note: "mobile.de führt für die 8er-Reihe keine eigene Modellgruppe (Datenlücke); 840/850 werden hier synthetisch zur Baureihe \"8er\" zusammengefasst, analog zu 1er-7er." },
  // X-Reihe/Z-Reihe: Sammelgruppe für MEHRERE echte Nameplates, nicht Motorisierungen einer Baureihe.
  { marke: "BMW", canonicalModel: "X1", memberModelNames: ["X1"], note: "Eigenständige Nameplate innerhalb der \"X-Reihe\"-Sammelgruppe." },
  { marke: "BMW", canonicalModel: "X2", memberModelNames: ["X2"], note: "Eigenständige Nameplate innerhalb der \"X-Reihe\"-Sammelgruppe." },
  { marke: "BMW", canonicalModel: "X3", memberModelNames: ["X3", "X3 M", "X3 M40", "X3 M50"], note: "Eigenständige Nameplate; M/M40/M50 sind Performance-Trims des X3, nicht eigene Modelle." },
  { marke: "BMW", canonicalModel: "X4", memberModelNames: ["X4", "X4 M", "X4 M40"], note: "Eigenständige Nameplate; M/M40 sind Performance-Trims des X4." },
  { marke: "BMW", canonicalModel: "X5", memberModelNames: ["X5", "X5 M", "X5 M50", "X5 M60"], note: "Eigenständige Nameplate; M/M50/M60 sind Performance-Trims des X5." },
  { marke: "BMW", canonicalModel: "X6", memberModelNames: ["X6", "X6 M", "X6 M50", "X6 M60", "ActiveHybrid X6"], note: "Eigenständige Nameplate; M/M50/M60 sind Performance-Trims des X6, ActiveHybrid X6 die frühere Hybridvariante." },
  { marke: "BMW", canonicalModel: "X7", memberModelNames: ["X7", "X7 M50", "X7 M60"], note: "Eigenständige Nameplate; M50/M60 sind Performance-Trims des X7." },
  { marke: "BMW", canonicalModel: "XM", memberModelNames: ["XM"], note: "Eigenständige Nameplate innerhalb der \"X-Reihe\"-Sammelgruppe." },
  { marke: "BMW", canonicalModel: "Z1", memberModelNames: ["Z1"], note: "Eigenständige Nameplate innerhalb der \"Z-Reihe\"-Sammelgruppe." },
  { marke: "BMW", canonicalModel: "Z3", memberModelNames: ["Z3", "Z3 M"], note: "Eigenständige Nameplate; Z3 M ist ein Performance-Trim des Z3." },
  { marke: "BMW", canonicalModel: "Z4", memberModelNames: ["Z4", "Z4 M", "Z4 M40", "Z4 M40i"], note: "Eigenständige Nameplate; M/M40/M40i sind Performance-Trims des Z4." },
  { marke: "BMW", canonicalModel: "Z8", memberModelNames: ["Z8"], note: "Eigenständige Nameplate innerhalb der \"Z-Reihe\"-Sammelgruppe." },
  // M-Modelle: echte M-Nameplates vs. M-Performance-Trims der Basisbaureihen.
  { marke: "BMW", canonicalModel: "M2", memberModelNames: ["M2"], note: "Eigenständige M-Nameplate." },
  { marke: "BMW", canonicalModel: "M3", memberModelNames: ["M3"], note: "Eigenständige M-Nameplate." },
  { marke: "BMW", canonicalModel: "M4", memberModelNames: ["M4"], note: "Eigenständige M-Nameplate." },
  { marke: "BMW", canonicalModel: "M5", memberModelNames: ["M5"], note: "Eigenständige M-Nameplate." },
  { marke: "BMW", canonicalModel: "M6", memberModelNames: ["M6"], note: "Eigenständige M-Nameplate." },
  { marke: "BMW", canonicalModel: "M8", memberModelNames: ["M8", "M850"], note: "Eigenständige M-Nameplate; M850 ist der Performance-Trim des 8er, der M8-Nameplate am nächsten." },
  // M135/M140i etc. sind Performance-Trims der jeweiligen Basisbaureihe, keine eigenen Nameplates:
  { marke: "BMW", canonicalModel: "1er", memberModelNames: ["M135", "M140i"], note: "M-Performance-Trims des 1er, keine eigene Nameplate (ergänzt die 1er-Gruppierung oben)." },
  { marke: "BMW", canonicalModel: "2er", memberModelNames: ["M235", "M240i"], note: "M-Performance-Trims des 2er." },
  { marke: "BMW", canonicalModel: "3er", memberModelNames: ["M340d", "M340i", "ActiveHybrid 3"], note: "M-Performance-Trims bzw. frühere Hybridvariante des 3er." },
  { marke: "BMW", canonicalModel: "4er", memberModelNames: ["M440"], note: "M-Performance-Trim des 4er." },
  { marke: "BMW", canonicalModel: "5er", memberModelNames: ["M550", "ActiveHybrid 5"], note: "M-Performance-Trim bzw. frühere Hybridvariante des 5er." },
  { marke: "BMW", canonicalModel: "7er", memberModelNames: ["M760", "ActiveHybrid 7"], note: "M-Performance-Trim bzw. frühere Hybridvariante des 7er." },

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

  // --- Mercedes-Benz: Modellgruppen sind einfache 1:1-Baureihen (deutsche "-Klasse"-Namen bereits nativ) ---
  { marke: "Mercedes-Benz", canonicalModel: "A-Klasse", memberModelNames: ["A 140", "A 150", "A 160", "A 170", "A 180", "A 190", "A 200", "A 210", "A 220", "A 250", "A 35 AMG", "A 45 AMG"], note: "mobile.de-Modellgruppe \"A-Klasse\" + Motorisierungs-Kinder." },
  { marke: "Mercedes-Benz", canonicalModel: "B-Klasse", memberModelNames: ["B 150", "B 160", "B 170", "B 180", "B 200", "B 220", "B 250", "B Electric Drive"], note: "mobile.de-Modellgruppe \"B-Klasse\" + Motorisierungs-Kinder." },
  { marke: "Mercedes-Benz", canonicalModel: "C-Klasse", memberModelNames: ["C 160", "C 180", "C 200", "C 220", "C 230", "C 240", "C 250", "C 270", "C 280", "C 30 AMG", "C 300", "C 32 AMG", "C 320", "C 350", "C 36 AMG", "C 400", "C 43 AMG", "C 450 AMG", "C 55 AMG", "C 63 AMG"], note: "mobile.de-Modellgruppe \"C-Klasse\" + Motorisierungs-Kinder." },
  { marke: "Mercedes-Benz", canonicalModel: "CE-Klasse", memberModelNames: ["CE 200", "CE 220", "CE 230", "CE 280", "CE 300"], note: "mobile.de-Modellgruppe \"CE-Klasse\" (historische Baureihe vor der CLK-Umbenennung) + Motorisierungs-Kinder." },
  { marke: "Mercedes-Benz", canonicalModel: "CL-Klasse", memberModelNames: ["CL 160", "CL 180", "CL 200", "CL 220", "CL 230", "CL 320", "CL 420", "CL 500", "CL 55 AMG", "CL 600", "CL 63 AMG", "CL 65 AMG"], note: "mobile.de-Modellgruppe \"CL-Klasse\" + Motorisierungs-Kinder." },
  { marke: "Mercedes-Benz", canonicalModel: "CLA-Klasse", memberModelNames: ["CLA 180", "CLA 180 Shooting Brake", "CLA 200", "CLA 200 Shooting Brake", "CLA 220", "CLA 220 Shooting Brake", "CLA 250", "CLA 250 Shooting Brake", "CLA 35 AMG", "CLA 35 AMG Shooting Brake", "CLA 350", "CLA 45 AMG", "CLA 45 AMG Shooting Brake", "CLA Shooting Brake"], note: "mobile.de-Modellgruppe \"CLA-Klasse\" + Motorisierungs-/Karosserie-Kinder." },
  { marke: "Mercedes-Benz", canonicalModel: "CLC-Klasse", memberModelNames: ["CLC 160", "CLC 180", "CLC 200", "CLC 220", "CLC 230", "CLC 250", "CLC 350"], note: "mobile.de-Modellgruppe \"CLC-Klasse\" + Motorisierungs-Kinder." },
  { marke: "Mercedes-Benz", canonicalModel: "CLE-Klasse", memberModelNames: ["CLE 180", "CLE 200", "CLE 220", "CLE 300", "CLE 450", "CLE 53 AMG"], note: "mobile.de-Modellgruppe \"CLE-Klasse\" + Motorisierungs-Kinder." },
  { marke: "Mercedes-Benz", canonicalModel: "CLK-Klasse", memberModelNames: ["CLK 200", "CLK 220", "CLK 230", "CLK 240", "CLK 270", "CLK 280", "CLK 320", "CLK 350", "CLK 430", "CLK 500", "CLK 55 AMG", "CLK 63 AMG"], note: "mobile.de-Modellgruppe \"CLK-Klasse\" + Motorisierungs-Kinder." },
  { marke: "Mercedes-Benz", canonicalModel: "CLS-Klasse", memberModelNames: ["CLS 220", "CLS 220 Shooting Brake", "CLS 250", "CLS 250 Shooting Brake", "CLS 280", "CLS 300", "CLS 320", "CLS 350", "CLS 350 Shooting Brake", "CLS 400", "CLS 400 Shooting Brake", "CLS 450", "CLS 500", "CLS 500 Shooting Brake", "CLS 53 AMG", "CLS 55 AMG", "CLS 63 AMG", "CLS 63 AMG Shooting Brake", "CLS Shooting Brake"], note: "mobile.de-Modellgruppe \"CLS-Klasse\" + Motorisierungs-/Karosserie-Kinder." },
  { marke: "Mercedes-Benz", canonicalModel: "E-Klasse", memberModelNames: ["E 200", "E 220", "E 230", "E 240", "E 250", "E 260", "E 270", "E 280", "E 290", "E 300", "E 320", "E 350", "E 36 AMG", "E 400", "E 420", "E 43 AMG", "E 430", "E 450", "E 50", "E 500", "E 53 AMG", "E 55 AMG", "E 60 AMG", "E 63 AMG"], note: "mobile.de-Modellgruppe \"E-Klasse\" + Motorisierungs-Kinder." },
  { marke: "Mercedes-Benz", canonicalModel: "G-Klasse", memberModelNames: ["G 230", "G 240", "G 250", "G 270", "G 280", "G 290", "G 300", "G 320", "G 350", "G 400", "G 450", "G 500", "G 55 AMG", "G 580", "G 63 AMG", "G 65 AMG"], note: "mobile.de-Modellgruppe \"G-Klasse\" + Motorisierungs-Kinder." },
  { marke: "Mercedes-Benz", canonicalModel: "GL-Klasse", memberModelNames: ["GL 320", "GL 350", "GL 400", "GL 420", "GL 450", "GL 500", "GL 55 AMG", "GL 63 AMG"], note: "mobile.de-Modellgruppe \"GL-Klasse\" + Motorisierungs-Kinder." },
  { marke: "Mercedes-Benz", canonicalModel: "GLA-Klasse", memberModelNames: ["GLA 180", "GLA 200", "GLA 220", "GLA 250", "GLA 35 AMG", "GLA 45 AMG"], note: "mobile.de-Modellgruppe \"GLA-Klasse\" + Motorisierungs-Kinder." },
  { marke: "Mercedes-Benz", canonicalModel: "GLB-Klasse", memberModelNames: ["GLB 180", "GLB 200", "GLB 220", "GLB 250", "GLB 35 AMG", "GLB 350"], note: "mobile.de-Modellgruppe \"GLB-Klasse\" + Motorisierungs-Kinder." },
  { marke: "Mercedes-Benz", canonicalModel: "GLC-Klasse", memberModelNames: ["GLC 200", "GLC 220", "GLC 250", "GLC 300", "GLC 350", "GLC 400", "GLC 43 AMG", "GLC 450", "GLC 63 AMG"], note: "mobile.de-Modellgruppe \"GLC-Klasse\" + Motorisierungs-Kinder." },
  { marke: "Mercedes-Benz", canonicalModel: "GLE-Klasse", memberModelNames: ["GLE 250", "GLE 300", "GLE 350", "GLE 400", "GLE 43 AMG", "GLE 450", "GLE 500", "GLE 53 AMG", "GLE 580", "GLE 63 AMG"], note: "mobile.de-Modellgruppe \"GLE-Klasse\" + Motorisierungs-Kinder." },
  { marke: "Mercedes-Benz", canonicalModel: "GLK-Klasse", memberModelNames: ["GLK 200", "GLK 220", "GLK 250", "GLK 280", "GLK 300", "GLK 320", "GLK 350"], note: "mobile.de-Modellgruppe \"GLK-Klasse\" + Motorisierungs-Kinder." },
  { marke: "Mercedes-Benz", canonicalModel: "GLS-Klasse", memberModelNames: ["GLS 350", "GLS 400", "GLS 450", "GLS 500", "GLS 580", "GLS 600", "GLS 63"], note: "mobile.de-Modellgruppe \"GLS-Klasse\" + Motorisierungs-Kinder." },
  { marke: "Mercedes-Benz", canonicalModel: "ML-Klasse", memberModelNames: ["ML 230", "ML 250", "ML 270", "ML 280", "ML 300", "ML 320", "ML 350", "ML 400", "ML 420", "ML 430", "ML 450", "ML 500", "ML 55 AMG", "ML 63 AMG"], note: "mobile.de-Modellgruppe \"ML-Klasse\" + Motorisierungs-Kinder." },
  { marke: "Mercedes-Benz", canonicalModel: "R-Klasse", memberModelNames: ["R 280", "R 300", "R 320", "R 350", "R 500", "R 63 AMG"], note: "mobile.de-Modellgruppe \"R-Klasse\" + Motorisierungs-Kinder." },
  { marke: "Mercedes-Benz", canonicalModel: "S-Klasse", memberModelNames: ["S 250", "S 260", "S 280", "S 300", "S 320", "S 350", "S 400", "S 420", "S 430", "S 450", "S 500", "S 55", "S 550", "S 560", "S 580", "S 600", "S 63 AMG", "S 65 AMG", "S 650", "S 680"], note: "mobile.de-Modellgruppe \"S-Klasse\" + Motorisierungs-Kinder." },
  { marke: "Mercedes-Benz", canonicalModel: "SL-Klasse", memberModelNames: ["SL 230", "SL 250", "SL 320", "SL 350", "SL 380", "SL 400", "SL 420", "SL 43 AMG", "SL 450", "SL 500", "SL 55 AMG", "SL 560", "SL 60 AMG", "SL 600", "SL 63 AMG", "SL 65 AMG", "SL 680", "SL 70 AMG", "SL 73 AMG"], note: "mobile.de-Modellgruppe \"SL-Klasse\" + Motorisierungs-Kinder." },
  { marke: "Mercedes-Benz", canonicalModel: "SLC-Klasse", memberModelNames: ["SLC 180", "SLC 200", "SLC 250", "SLC 300", "SLC 43 AMG"], note: "mobile.de-Modellgruppe \"SLC-Klasse\" + Motorisierungs-Kinder." },
  { marke: "Mercedes-Benz", canonicalModel: "SLK-Klasse", memberModelNames: ["SLK 200", "SLK 230", "SLK 250", "SLK 280", "SLK 300", "SLK 32 AMG", "SLK 320", "SLK 350", "SLK 55 AMG"], note: "mobile.de-Modellgruppe \"SLK-Klasse\" + Motorisierungs-Kinder." },
  { marke: "Mercedes-Benz", canonicalModel: "V-Klasse", memberModelNames: ["V 200", "V 220", "V 230", "V 250", "V 280", "V 300"], note: "mobile.de-Modellgruppe \"V-Klasse\" + Motorisierungs-Kinder." },
  { marke: "Mercedes-Benz", canonicalModel: "X-Klasse", memberModelNames: ["X 220", "X 250", "X 350"], note: "mobile.de-Modellgruppe \"X-Klasse\" (Pickup) + Motorisierungs-Kinder." },
  // Flache Lücken/Zusammenfassungen ohne eigene Modellgruppe:
  { marke: "Mercedes-Benz", canonicalModel: "AMG GT", memberModelNames: ["AMG GT C", "AMG GT R", "AMG GT S", "GT-Klasse"], note: "\"AMG GT\" ist die mobile.de-Basisnameplate selbst; C/R/S sind Performance-Trims. \"GT-Klasse\" ist derselbe Sammelwert wie \"AMG GT\" ohne eigene Motorisierungsangabe." },
  { marke: "Mercedes-Benz", canonicalModel: "T-Klasse", memberModelNames: ["T model", "T modell", "W124 t modell"], note: "Alle drei Rohwerte bezeichnen dieselbe historische Kombi-/T-Modell-Variante (W124 \"T-Modell\") - zu \"T-Klasse\" zusammengefasst statt als drei separate Einträge geführt." },

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

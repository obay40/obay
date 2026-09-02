/**
 * Regressionstests für den Fahrzeugkatalog: Diese Modelle dürfen nach einem
 * Re-Import NIEMALS mehr fehlen. Kein vollständiger Katalogtest – siehe
 * Aufgabenstellung ("Diese Tests sind kein vollständiger Fahrzeugkatalog.
 * Sie sind Regressionstests dafür, dass besonders relevante Modelle
 * vorhanden bleiben.").
 *
 * Setzt voraus, dass `pnpm vehicle-catalog:import` bereits gegen die in
 * DATABASE_URL konfigurierte Datenbank gelaufen ist.
 *
 * Auflösung über resolveManufacturerByTerm/resolveModelByTerm: findet einen
 * Datensatz über Slug, Alias ODER (diakritikatolerant) den Namen – exakt so,
 * wie ein Nutzer ihn eintippen würde ("1er", "Skoda", "VW", …).
 */
import { describe, expect, it } from "vitest";
import { resolveManufacturerByTerm, resolveModelByTerm } from "../queries";

const SPOT_CHECKS: Record<string, string[]> = {
  Volkswagen: [
    "Golf",
    "Polo",
    "Passat",
    "Tiguan",
    "T-Roc",
    "Touareg",
    "Touran",
    "ID.3",
    "ID.4",
    "ID.5",
    "ID.7",
  ],
  BMW: [
    "1er",
    "2er",
    "3er",
    "4er",
    "5er",
    "7er",
    "8er",
    "X1",
    "X2",
    "X3",
    "X4",
    "X5",
    "X6",
    "X7",
    "Z4",
    "i3",
    "i4",
    "i5",
    "i7",
    "iX",
  ],
  "Mercedes-Benz": [
    "A-Klasse",
    "B-Klasse",
    "C-Klasse",
    "E-Klasse",
    "S-Klasse",
    "CLA",
    "CLS",
    "GLA",
    "GLB",
    "GLC",
    "GLE",
    "GLS",
    "G-Klasse",
    "EQA",
    "EQB",
    "EQE",
    "EQS",
    "SL",
    "V-Klasse",
  ],
  Audi: [
    "A1",
    "A3",
    "A4",
    "A5",
    "A6",
    "A7",
    "A8",
    "Q2",
    "Q3",
    "Q4 e-tron",
    "Q5",
    "Q6 e-tron",
    "Q7",
    "Q8",
    "TT",
    "R8",
    "e-tron GT",
  ],
  Porsche: ["718", "911", "Taycan", "Panamera", "Macan", "Cayenne"],
  Opel: ["Adam", "Astra", "Corsa", "Insignia", "Mokka", "Crossland", "Grandland", "Zafira"],
  Ford: ["Fiesta", "Focus", "Mondeo", "Mustang", "Puma", "Kuga", "Explorer", "S-Max", "Galaxy"],
  Škoda: ["Fabia", "Scala", "Octavia", "Superb", "Kamiq", "Karoq", "Kodiaq", "Enyaq", "Elroq"],
  SEAT: ["Ibiza", "Leon", "Ateca", "Arona", "Tarraco", "Alhambra"],
  CUPRA: ["Ateca", "Born", "Formentor", "Leon", "Tavascan", "Terramar"],
  Toyota: [
    "Aygo",
    "Yaris",
    "Corolla",
    "Prius",
    "Camry",
    "C-HR",
    "RAV4",
    "Land Cruiser",
    "Supra",
    "GR86",
  ],
  Hyundai: ["i10", "i20", "i30", "Kona", "Tucson", "Santa Fe", "Ioniq", "Ioniq 5", "Ioniq 6"],
  Kia: ["Picanto", "Rio", "Ceed", "ProCeed", "Niro", "Sportage", "Sorento", "Stinger", "EV3", "EV6", "EV9"],
  Tesla: ["Model S", "Model 3", "Model X", "Model Y"],
  Volvo: ["V40", "V60", "V70", "V90", "S60", "S90", "XC40", "XC60", "XC90", "EX30"],
  Nissan: ["Micra", "Note", "Juke", "Qashqai", "X-Trail", "Leaf", "370Z", "GT-R", "Ariya"],
  Mazda: ["Mazda2", "Mazda3", "Mazda6", "CX-3", "CX-30", "CX-5", "CX-60", "CX-80", "MX-5", "MX-30"],
  Renault: [
    "Twingo",
    "Clio",
    "Mégane",
    "Laguna",
    "Talisman",
    "Captur",
    "Kadjar",
    "Austral",
    "Espace",
    "Scénic",
    "Zoe",
  ],
  Peugeot: [
    "106",
    "107",
    "108",
    "206",
    "207",
    "208",
    "306",
    "307",
    "308",
    "407",
    "408",
    "508",
    "2008",
    "3008",
    "5008",
    "RCZ",
  ],
  Citroën: ["C1", "C2", "C3", "C4", "C5", "C6", "C8", "C4 Cactus", "C4 Picasso"],
  Dacia: ["Sandero", "Logan", "Duster", "Jogger", "Spring", "Bigster"],
  Fiat: ["500", "500X", "500L", "Panda", "Punto", "Tipo", "Bravo", "Croma", "124 Spider"],
  "Alfa Romeo": ["MiTo", "Giulietta", "Giulia", "Stelvio", "Tonale", "4C"],
  Honda: ["Jazz", "Civic", "Accord", "CR-V", "HR-V", "NSX", "e", "ZR-V"],
  Mitsubishi: ["Colt", "Lancer", "ASX", "Eclipse Cross", "Outlander", "Pajero", "Space Star"],
  Subaru: ["Impreza", "Legacy", "Levorg", "Forester", "Outback", "BRZ", "XV", "Crosstrek"],
  Suzuki: ["Swift", "Ignis", "Baleno", "Vitara", "S-Cross", "Jimny"],
  Jeep: ["Renegade", "Compass", "Cherokee", "Grand Cherokee", "Wrangler", "Avenger"],
  "Land Rover": [
    "Defender",
    "Discovery",
    "Discovery Sport",
    "Range Rover",
    "Range Rover Sport",
    "Range Rover Evoque",
    "Range Rover Velar",
  ],
  Jaguar: ["XE", "XF", "XJ", "F-Type", "E-Pace", "F-Pace", "I-Pace"],
  Lexus: ["CT", "IS", "ES", "GS", "LS", "UX", "NX", "RX", "RC", "LC"],
  MINI: ["Hatch", "Cooper", "Clubman", "Countryman", "Paceman"],
  Smart: ["Fortwo", "Forfour", "#1", "#3"],
  MG: ["MG3", "MG4", "MG5", "ZS", "HS", "Marvel R", "Cyberster"],
  BYD: ["Dolphin", "Atto 3", "Seal", "Seal U", "Han", "Tang"],
  Polestar: ["2", "3", "4"],
  NIO: ["ET5", "ET7", "EL6", "EL8"],
  Xpeng: ["G6", "G9", "P7"],
};

describe("Fahrzeugkatalog-Spotchecks (Regressionstests)", () => {
  for (const [manufacturerTerm, modelTerms] of Object.entries(SPOT_CHECKS)) {
    describe(manufacturerTerm, () => {
      it(`Hersteller "${manufacturerTerm}" ist auffindbar`, async () => {
        const manufacturer = await resolveManufacturerByTerm(manufacturerTerm);
        expect(manufacturer, `Hersteller "${manufacturerTerm}" nicht gefunden`).not.toBeNull();
      });

      for (const modelTerm of modelTerms) {
        it(`${manufacturerTerm} ${modelTerm} ist auffindbar`, async () => {
          const manufacturer = await resolveManufacturerByTerm(manufacturerTerm);
          expect(manufacturer, `Hersteller "${manufacturerTerm}" nicht gefunden`).not.toBeNull();
          if (!manufacturer) return;

          const model = await resolveModelByTerm(manufacturer.slug, modelTerm);
          expect(model, `Modell "${manufacturerTerm} ${modelTerm}" nicht gefunden`).not.toBeNull();
        });
      }
    });
  }
});

/**
 * Bekannte, dokumentierte Lücken der gewählten Datenquelle (Dataset
 * 2026.08.2) – siehe docs/vehicle-data-sources.md, Abschnitt "Bekannte
 * Lücken". Bewusst NICHT im obigen Spot-Check enthalten und bewusst NICHT
 * manuell aus dem Gedächtnis ergänzt. Dieser Test hält fest, DASS sie fehlen
 * (statt es stillschweigend so zu lassen) – ändert sich das (z. B. weil
 * VehiclesDB sie in einer neueren Version ergänzt), wird dieser Test rot und
 * erinnert daran, docs/vehicle-data-sources.md zu aktualisieren.
 */
describe("Bekannte Datenlücken (dokumentiert, nicht erfunden)", () => {
  it("Polestar 1 ist in der aktuellen Quelle nicht vorhanden", async () => {
    const manufacturer = await resolveManufacturerByTerm("Polestar");
    expect(manufacturer).not.toBeNull();
    if (!manufacturer) return;
    const model = await resolveModelByTerm(manufacturer.slug, "1");
    expect(model).toBeNull();
  });

  it("Dacia Lodgy ist in der aktuellen Quelle nicht vorhanden", async () => {
    const manufacturer = await resolveManufacturerByTerm("Dacia");
    expect(manufacturer).not.toBeNull();
    if (!manufacturer) return;
    const model = await resolveModelByTerm(manufacturer.slug, "Lodgy");
    expect(model).toBeNull();
  });

  it("NIO EL7 ist in der aktuellen Quelle nicht vorhanden", async () => {
    const manufacturer = await resolveManufacturerByTerm("NIO");
    expect(manufacturer).not.toBeNull();
    if (!manufacturer) return;
    const model = await resolveModelByTerm(manufacturer.slug, "EL7");
    expect(model).toBeNull();
  });
});

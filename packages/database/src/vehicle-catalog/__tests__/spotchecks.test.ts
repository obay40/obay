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
import { listActiveModelsForManufacturerSlug, resolveManufacturerByTerm, resolveModelByTerm } from "../queries";

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
  // BMW/Mercedes-Benz haben seit der 3-Ebenen-Hierarchie (Marke → Baureihe
  // → Modell, siehe mobile-de-model-groups.ts) KEINE Modelle mehr namens
  // "1er"/"A-Klasse" - das sind jetzt Modellgruppen-Namen. Konkrete Modelle
  // je Baureihe hier als Spot-Check; die Baureihen-Ebene selbst wird
  // ausführlich in model-groups.test.ts geprüft.
  BMW: [
    "120",
    "220",
    "320",
    "420",
    "520",
    "730",
    "850",
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
    "A 200",
    "B 180",
    "C 200",
    "E 220",
    "S 500",
    "CLA 200",
    "CLS 350",
    "GLA 200",
    "GLB 200",
    "GLC 300",
    "GLE 350",
    "GLS 450",
    "G 500",
    "EQA",
    "EQB",
    "EQE",
    "EQS",
    "SL 500",
    "V 250",
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
  Porsche: ["Boxster", "Cayman", "911", "Taycan", "Panamera", "Macan", "Cayenne"],
  Opel: ["Adam", "Astra", "Corsa", "Insignia", "Mokka", "Crossland (X)", "Grandland (X)", "Zafira"],
  Ford: ["Fiesta", "Focus", "Mondeo", "Mustang", "Puma", "Kuga", "Explorer", "S-Max", "Galaxy"],
  Škoda: ["Fabia", "Scala", "Octavia", "Superb", "Kamiq", "Karoq", "Kodiaq", "Enyaq", "Elroq"],
  SEAT: ["Ibiza", "Leon", "Ateca", "Arona", "Tarraco", "Alhambra"],
  CUPRA: ["Ateca", "Born", "Formentor", "Leon", "Tavascan", "Terramar"],
  Toyota: [
    "Aygo (X)",
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
  Kia: [
    "Picanto",
    "Rio",
    "cee'd / Ceed",
    "pro cee'd / ProCeed",
    "Niro",
    "Sportage",
    "Sorento",
    "Stinger",
    "EV3",
    "EV6",
    "EV9",
  ],
  Tesla: ["Model S", "Model 3", "Model X", "Model Y"],
  Volvo: ["V40", "V60", "V70", "V90", "S60", "S90", "XC40", "XC60", "XC90", "EX30"],
  Nissan: ["Micra", "Note", "Juke", "Qashqai", "X-Trail", "Leaf", "370Z", "GT-R", "Ariya"],
  Mazda: ["2", "3", "6", "CX-3", "CX-30", "CX-5", "CX-60", "CX-80", "MX-5", "MX-30"],
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
  Suzuki: ["Swift", "Ignis", "Baleno", "Vitara", "(SX4) S-Cross", "Jimny"],
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
  Lexus: ["CT 200h", "IS", "ES", "GS", "LS", "UX", "NX", "RX", "RC", "LC 500"],
  MINI: ["Cooper", "Clubman", "Countryman", "Paceman", "Aceman"],
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
 * Bekannte, dokumentierte Lücken der mobile.de-Quelle (siehe
 * docs/vehicle-data-sources.md, "Hinweise & Quellen"-Sheet des vendorten
 * Excels: LEVC und Zhidou sind dort nur als Hersteller genannt, tauchen
 * aber in der eigentlichen Gebrauchtwagen-Sitemap mit keiner einzigen
 * Modellzeile auf). Bewusst NICHT manuell aus dem Gedächtnis ergänzt.
 * Dieser Test hält fest, DASS diese Hersteller keine Modelle haben (statt
 * es stillschweigend so zu lassen) – ändert sich das in einer neueren
 * mobile.de-Erhebung, wird dieser Test rot und erinnert daran,
 * docs/vehicle-data-sources.md zu aktualisieren.
 */
describe("Bekannte Datenlücken (dokumentiert, nicht erfunden)", () => {
  it.each(["LEVC", "Zhidou"])(
    '"%s" ist als Hersteller vorhanden, aber ohne Modelle (nur im Hinweise-Sheet genannt)',
    async (term) => {
      const manufacturer = await resolveManufacturerByTerm(term);
      expect(manufacturer, `Hersteller "${term}" nicht gefunden`).not.toBeNull();
      if (!manufacturer) return;
      const models = await listActiveModelsForManufacturerSlug(manufacturer.slug);
      expect(models).toHaveLength(0);
    },
  );
});

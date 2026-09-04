/**
 * Regressionstests für die PKW-Kuratierung (siehe overrides.ts und
 * docs/vehicle-catalog-curation.md). Prüft direkt gegen die kuratierten
 * queries.ts-Funktionen, also exakt das, was die normale Autoklick24-Suche
 * (API + UI) tatsächlich sieht.
 */
import { describe, expect, it } from "vitest";
import {
  findManufacturerBySlug,
  resolveManufacturerByTerm,
  resolveModelByTerm,
} from "../queries";

describe("Nicht-PKW-Hersteller dürfen NICHT in der PKW-Suche erscheinen", () => {
  it.each([
    "Ducati",
    "Kawasaki",
    "Barkas",
    "Piaggio",
    "MAN",
    "Iveco",
    "Bovensiepen",
  ])('"%s" ist kein auffindbarer PKW-Hersteller', async (term) => {
    const manufacturer = await resolveManufacturerByTerm(term);
    expect(manufacturer, `"${term}" wurde fälschlich als PKW-Hersteller gefunden`).toBeNull();
  });
});

describe("Nicht-PKW-Modelle dürfen NICHT in der PKW-Modellauswahl erscheinen", () => {
  it.each([
    ["Mercedes-Benz", "Vario"],
    ["BMW", "Sondermodell"],
    ["Kia", "Mini"],
    ["Kia", "Model"],
    ["Changan", "Other"],
    ["Foton", "Other"],
  ])('%s "%s" ist kein auffindbares PKW-Modell', async (manufacturerTerm, modelTerm) => {
    const manufacturer = await resolveManufacturerByTerm(manufacturerTerm);
    expect(manufacturer, `Hersteller "${manufacturerTerm}" unerwartet nicht gefunden`).not.toBeNull();
    if (!manufacturer) return;
    const model = await resolveModelByTerm(manufacturer.slug, modelTerm);
    expect(model, `"${manufacturerTerm} ${modelTerm}" wurde fälschlich als PKW-Modell gefunden`).toBeNull();
  });
});

describe("Echte PKW bleiben trotz Kuratierung auffindbar", () => {
  it.each([
    ["Mercedes-Benz", "E 220"],
    ["Mercedes-Benz", "G 63 AMG"],
    ["Mercedes-Benz", "Sprinter"],
    ["Mercedes-Benz", "Vito"],
    ["BMW", "320"],
    ["BMW", "520"],
    ["BMW", "X6"],
    ["Volkswagen", "Golf"],
    ["Volkswagen", "Passat"],
    ["Volkswagen", "Crafter"],
    ["Porsche", "911"],
    ["Tesla", "Model Y"],
    ["Honda", "Civic"],
    ["Suzuki", "Swift"],
    ["MINI", "Cooper"],
    ["Alpina", "B7"],
    ["KTM", "X-BOW"],
  ])('%s "%s" ist weiterhin ein auffindbares PKW-Modell', async (manufacturerTerm, modelTerm) => {
    const manufacturer = await resolveManufacturerByTerm(manufacturerTerm);
    expect(manufacturer, `Hersteller "${manufacturerTerm}" nicht gefunden`).not.toBeNull();
    if (!manufacturer) return;
    const model = await resolveModelByTerm(manufacturer.slug, modelTerm);
    expect(model, `"${manufacturerTerm} ${modelTerm}" nicht gefunden`).not.toBeNull();
  });
});

describe("Honda/Suzuki: keine Motorradmodelle unter den Autoherstellern", () => {
  it("Honda hat keine Modelle mit Motorrad-typischen Namen (CBR/Africa Twin/Gold Wing)", async () => {
    for (const term of ["CBR", "Africa Twin", "Gold Wing"]) {
      const manufacturer = await resolveManufacturerByTerm("Honda");
      expect(manufacturer).not.toBeNull();
      if (!manufacturer) continue;
      const model = await resolveModelByTerm(manufacturer.slug, term);
      expect(model, `Honda "${term}" wurde fälschlich als Modell gefunden`).toBeNull();
    }
  });
});

describe("Manufacturer-Kategorie: Hersteller mit isActive=false sind über findManufacturerBySlug nicht auffindbar", () => {
  it('"bovensiepen" (Dublette von "ALPINA") ist ausgeblendet', async () => {
    const manufacturer = await findManufacturerBySlug("bovensiepen");
    expect(manufacturer).toBeNull();
  });
});

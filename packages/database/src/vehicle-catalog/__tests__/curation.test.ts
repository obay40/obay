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
    "KTM Motorrad",
    "Nilsson",
    "Binz",
    "Superior",
    "Bürstner GmbH",
    "Hymer",
    "Carthago",
    "Dethleffs",
    "Frankia",
    "Mitsubishi Fuso",
    "LDV",
    "Barkas",
    "Commer",
    "Bedford",
    "Bmw Alpina",
  ])('"%s" ist kein auffindbarer PKW-Hersteller', async (term) => {
    const manufacturer = await resolveManufacturerByTerm(term);
    expect(manufacturer, `"${term}" wurde fälschlich als PKW-Hersteller gefunden`).toBeNull();
  });
});

describe("Nicht-PKW-Modelle dürfen NICHT in der PKW-Modellauswahl erscheinen", () => {
  it.each([
    ["Mercedes-Benz", "Actros"],
    ["Mercedes-Benz", "Atego"],
    ["Mercedes-Benz", "Unimog"],
    ["Mercedes-Benz", "Ambulance"],
    ["Mercedes-Benz", "Hymer"],
    ["Mercedes-Benz", "Carthago"],
    ["Fiat", "Hymer"],
    ["Fiat", "Rapido"],
    ["Ford", "Chausson"],
    ["Volkswagen", "3BG"],
    ["Volkswagen", "7HK"],
    ["Volkswagen", "Westfalia"],
    ["Volkswagen", "Grand California"],
    ["BMW", "MINI Cooper"],
    ["BMW", "Mini One"],
    ["BMW", "Alpina"],
    ["Ram", "Promaster"],
  ])('%s "%s" ist kein auffindbares PKW-Modell', async (manufacturerTerm, modelTerm) => {
    const manufacturer = await resolveManufacturerByTerm(manufacturerTerm);
    if (!manufacturer) {
      // Ram ist MULTI_CATEGORY und bleibt als Hersteller sichtbar - falls
      // resolveManufacturerByTerm hier dennoch null liefert, ist das ein
      // eigener Fehler und muss auffallen statt den Modelltest zu überspringen.
      expect(manufacturer, `Hersteller "${manufacturerTerm}" unerwartet nicht gefunden`).not.toBeNull();
      return;
    }
    const model = await resolveModelByTerm(manufacturer.slug, modelTerm);
    expect(model, `"${manufacturerTerm} ${modelTerm}" wurde fälschlich als PKW-Modell gefunden`).toBeNull();
  });
});

describe("Echte PKW bleiben trotz Kuratierung auffindbar", () => {
  it.each([
    ["Mercedes-Benz", "E-Klasse"],
    ["Mercedes-Benz", "G-Klasse"],
    ["BMW", "3er"],
    ["BMW", "5er"],
    ["BMW", "X6"],
    ["Volkswagen", "Golf"],
    ["Volkswagen", "Passat"],
    ["Porsche", "911"],
    ["Tesla", "Model Y"],
    ["Honda", "Civic"],
    ["Suzuki", "Swift"],
    ["MINI", "Cooper"],
    ["Alpina", "B7"],
    ["Ram", "1500"],
  ])('%s "%s" ist weiterhin ein auffindbares PKW-Modell', async (manufacturerTerm, modelTerm) => {
    const manufacturer = await resolveManufacturerByTerm(manufacturerTerm);
    expect(manufacturer, `Hersteller "${manufacturerTerm}" nicht gefunden`).not.toBeNull();
    if (!manufacturer) return;
    const model = await resolveModelByTerm(manufacturer.slug, modelTerm);
    expect(model, `"${manufacturerTerm} ${modelTerm}" nicht gefunden`).not.toBeNull();
  });

  it("Ram ist als Hersteller weiterhin auffindbar (MULTI_CATEGORY)", async () => {
    const manufacturer = await resolveManufacturerByTerm("Ram");
    expect(manufacturer).not.toBeNull();
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
  it('"bmw-alpina" (Dublette von "alpina") ist ausgeblendet', async () => {
    const manufacturer = await findManufacturerBySlug("bmw-alpina");
    expect(manufacturer).toBeNull();
  });
});

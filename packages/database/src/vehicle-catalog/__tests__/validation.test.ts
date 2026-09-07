/**
 * Automatisierte Datenmodell-Validierungen für den Fahrzeugkatalog (siehe
 * Aufgabenstellung, Abschnitt VALIDIERUNG). Prüft den tatsächlich
 * importierten Datenbestand, nicht nur die Rohdaten – deckt also auch
 * Fehler auf, die erst durch Normalisierung/Overrides entstehen könnten.
 */
import { describe, expect, it } from "vitest";
import { prisma } from "../../client";
import { foldForComparison } from "../normalize";
import { ACTIVE_CATALOG_SOURCE } from "../queries";

const VALID_BODY_TYPES = new Set([
  "hatchback",
  "sedan",
  "wagon",
  "suv",
  "mpv",
  "coupe",
  "convertible",
  "roadster",
  "pickup",
  "van",
  "trike",
]);

describe("Fahrzeugkatalog-Validierung", () => {
  it("jedes VehicleModel hat einen gültigen Hersteller (referentielle Integrität)", async () => {
    // manufacturerId ist NOT NULL + FK-Constraint (siehe schema.prisma) – ein
    // verwaistes Modell kann strukturell gar nicht in der DB landen. Test
    // beweist das trotzdem aktiv, statt sich nur auf das Schema zu verlassen.
    const manufacturerIds = new Set(
      (await prisma.vehicleManufacturer.findMany({ select: { id: true } })).map((m) => m.id),
    );
    const models = await prisma.vehicleModel.findMany({ select: { id: true, manufacturerId: true } });
    expect(models.length).toBeGreaterThan(0);
    for (const model of models) {
      expect(manufacturerIds.has(model.manufacturerId), `Modell ${model.id} ohne gültigen Hersteller`).toBe(
        true,
      );
    }
  });

  it("kein Herstellername ist leer", async () => {
    const manufacturers = await prisma.vehicleManufacturer.findMany({ select: { name: true } });
    expect(manufacturers.length).toBeGreaterThan(0);
    for (const manufacturer of manufacturers) {
      expect(manufacturer.name.trim().length).toBeGreaterThan(0);
    }
  });

  it("kein Modellname ist leer", async () => {
    const models = await prisma.vehicleModel.findMany({ select: { name: true } });
    expect(models.length).toBeGreaterThan(0);
    for (const model of models) {
      expect(model.name.trim().length).toBeGreaterThan(0);
    }
  });

  it("Hersteller-Slugs sind eindeutig innerhalb der aktiven Quelle", async () => {
    // Slug ist NICHT global eindeutig (siehe schema.prisma-Kommentar zu
    // VehicleManufacturer): derselbe Slug (z. B. "bmw") kann gleichzeitig
    // unter der inaktiven Altquelle VEHICLES_DB und der aktiven Quelle
    // MOBILE_DE existieren. Eindeutig ist er nur je Quelle - und nur die
    // aktive Quelle ist das, was Nutzer über queries.ts tatsächlich sehen.
    const manufacturers = await prisma.vehicleManufacturer.findMany({
      where: { source: ACTIVE_CATALOG_SOURCE },
      select: { slug: true },
    });
    const slugs = manufacturers.map((m) => m.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("Modell-Slugs sind eindeutig innerhalb desselben Herstellers", async () => {
    const models = await prisma.vehicleModel.findMany({
      select: { manufacturerId: true, slug: true },
    });
    const seen = new Set<string>();
    for (const model of models) {
      const key = `${model.manufacturerId}/${model.slug}`;
      expect(seen.has(key), `Dublette: ${key}`).toBe(false);
      seen.add(key);
    }
  });

  it("keine zwei Hersteller mit identischem normalisiertem Namen innerhalb der aktiven Quelle", async () => {
    // Analog zur Slug-Eindeutigkeit oben: Namenskollisionen zwischen
    // VEHICLES_DB und MOBILE_DE (z. B. "Aixam" existiert in beiden Quellen)
    // sind erwartet und unproblematisch, weil nur eine Quelle aktiv ist.
    const manufacturers = await prisma.vehicleManufacturer.findMany({
      where: { source: ACTIVE_CATALOG_SOURCE },
      select: { name: true, displayName: true },
    });
    const normalized = new Map<string, string>();
    for (const manufacturer of manufacturers) {
      const key = foldForComparison(manufacturer.displayName ?? manufacturer.name);
      const existing = normalized.get(key);
      expect(
        existing,
        `Normalisierter Name "${key}" kollidiert: "${existing}" vs. "${manufacturer.name}"`,
      ).toBeUndefined();
      normalized.set(key, manufacturer.name);
    }
  });

  it("keine Modell-Dublette innerhalb derselben Marke nach Normalisierung", async () => {
    const models = await prisma.vehicleModel.findMany({
      select: { manufacturerId: true, name: true, displayName: true },
    });
    const normalized = new Map<string, string>();
    for (const model of models) {
      const key = `${model.manufacturerId}/${foldForComparison(model.displayName ?? model.name)}`;
      const existing = normalized.get(key);
      expect(existing, `Modell-Dublette bei Hersteller ${model.manufacturerId}: "${key}"`).toBeUndefined();
      normalized.set(key, model.name);
    }
  });

  it("bodyTypes enthalten nur die dokumentierte PKW-Vokabular (keine LKW-/Motorrad-Fehlklassifikation)", async () => {
    const models = await prisma.vehicleModel.findMany({ select: { bodyTypes: true } });
    for (const model of models) {
      for (const bodyType of model.bodyTypes) {
        expect(VALID_BODY_TYPES.has(bodyType), `Unbekannter body_type: "${bodyType}"`).toBe(true);
      }
    }
  });

  it("importierter Katalog hat plausiblen Umfang (mehrere tausend Modelle, hunderte Hersteller)", async () => {
    // Über ALLE Quellen kombiniert (VEHICLES_DB bleibt vollständig erhalten,
    // siehe queries.ts-Modulkommentar) - beweist nur, dass nichts versehentlich
    // gelöscht wurde. Der Umfang der AKTIVEN Quelle wird im nächsten Test geprüft.
    const manufacturerCount = await prisma.vehicleManufacturer.count();
    const modelCount = await prisma.vehicleModel.count();
    expect(manufacturerCount).toBeGreaterThan(200);
    expect(modelCount).toBeGreaterThan(4000);
  });

  it("aktive Quelle (mobile.de) hat plausiblen Umfang (hunderte Modelle, >100 Hersteller)", async () => {
    const manufacturerCount = await prisma.vehicleManufacturer.count({
      where: { source: ACTIVE_CATALOG_SOURCE },
    });
    const modelCount = await prisma.vehicleModel.count({ where: { source: ACTIVE_CATALOG_SOURCE } });
    expect(manufacturerCount).toBeGreaterThan(100);
    expect(modelCount).toBeGreaterThan(1500);
  });
});

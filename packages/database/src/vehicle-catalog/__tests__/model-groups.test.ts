/**
 * Regressionstests für die echte 3-Ebenen-Hierarchie (Marke → Modellgruppe/
 * Baureihe → Modell), die ausschließlich für BMW und Mercedes-Benz gilt
 * (siehe mobile-de-model-groups.ts). Prüft direkt gegen queries.ts, also
 * exakt das, was API + UI tatsächlich sehen.
 */
import { describe, expect, it } from "vitest";
import {
  findModelGroupBySlug,
  listActiveModelGroupsForManufacturerSlug,
  listActiveModelsForManufacturerSlug,
  resolveManufacturerByTerm,
  resolveModelByTerm,
  resolveModelGroupByTerm,
} from "../queries";

describe("Marke → Baureihe → Modell: Pflichttests aus der Aufgabenstellung", () => {
  it.each([
    ["Mercedes-Benz", "B-Klasse", "B 180"],
    ["Mercedes-Benz", "C-Klasse", "C 63 AMG"],
    ["Mercedes-Benz", "E-Klasse", "E 220"],
    ["Mercedes-Benz", "G-Klasse", "G 63 AMG"],
    ["BMW", "3er Reihe", "320"],
    ["BMW", "3er Reihe", "330"],
    ["BMW", "X-Reihe", "X6"],
    ["BMW", "M-Modelle", "M3"],
  ])('%s "%s" → "%s" ist auffindbar', async (manufacturerTerm, groupTerm, modelTerm) => {
    const manufacturer = await resolveManufacturerByTerm(manufacturerTerm);
    expect(manufacturer, `Hersteller "${manufacturerTerm}" nicht gefunden`).not.toBeNull();
    if (!manufacturer) return;

    const group = await resolveModelGroupByTerm(manufacturer.slug, groupTerm);
    expect(group, `Baureihe "${manufacturerTerm} ${groupTerm}" nicht gefunden`).not.toBeNull();

    const model = await resolveModelByTerm(manufacturer.slug, modelTerm);
    expect(model, `Modell "${manufacturerTerm} ${modelTerm}" nicht gefunden`).not.toBeNull();
    if (!model || !group) return;

    // Das Modell muss tatsächlich der erwarteten Baureihe zugeordnet sein,
    // nicht nur irgendwo unter dem Hersteller existieren.
    expect(model.groupSlug, `"${modelTerm}" ist nicht der Baureihe "${groupTerm}" zugeordnet`).toBe(
      group.slug,
    );
  });
});

describe('"Alle" muss funktionieren: Baureihe ohne konkretes Modell umfasst alle ihre Modelle', () => {
  it("BMW 3er Reihe (alle) umfasst 315, 316, 318, 320, 325, 330, 335, 340", async () => {
    const manufacturer = await resolveManufacturerByTerm("BMW");
    expect(manufacturer).not.toBeNull();
    if (!manufacturer) return;

    const group = await resolveModelGroupByTerm(manufacturer.slug, "3er Reihe");
    expect(group).not.toBeNull();
    if (!group) return;

    const models = await listActiveModelsForManufacturerSlug(manufacturer.slug);
    const modelsInGroup = models.filter((model) => model.groupSlug === group.slug).map((model) => model.name);

    for (const expected of ["315", "316", "318", "320", "325", "330", "335", "340"]) {
      expect(modelsInGroup, `"${expected}" fehlt in der 3er Reihe`).toContain(expected);
    }
  });

  it("Mercedes-Benz B-Klasse (alle) umfasst B 150 bis B 250 plus B Electric Drive", async () => {
    const manufacturer = await resolveManufacturerByTerm("Mercedes-Benz");
    expect(manufacturer).not.toBeNull();
    if (!manufacturer) return;

    const group = await resolveModelGroupByTerm(manufacturer.slug, "B-Klasse");
    expect(group).not.toBeNull();
    if (!group) return;

    const models = await listActiveModelsForManufacturerSlug(manufacturer.slug);
    const modelsInGroup = models.filter((model) => model.groupSlug === group.slug).map((model) => model.name);

    expect(modelsInGroup.sort()).toEqual(
      ["B 150", "B 160", "B 170", "B 180", "B 200", "B 220", "B 250", "B Electric Drive"].sort(),
    );
  });
});

describe("Keine Duplikate: BMW-M-Performance-Trims der X-Reihe erscheinen nur einmal", () => {
  it("X3 M ist nur unter X-Reihe zu finden, nicht zusätzlich unter M-Modelle", async () => {
    const manufacturer = await resolveManufacturerByTerm("BMW");
    expect(manufacturer).not.toBeNull();
    if (!manufacturer) return;

    const models = await listActiveModelsForManufacturerSlug(manufacturer.slug);
    const x3mOccurrences = models.filter((model) => model.name === "X3 M");
    expect(x3mOccurrences).toHaveLength(1);

    const xReihe = await resolveModelGroupByTerm(manufacturer.slug, "X-Reihe");
    expect(xReihe).not.toBeNull();
    expect(x3mOccurrences[0]?.groupSlug).toBe(xReihe?.slug);
  });

  it("jedes BMW-Modell gehört zu höchstens einer Baureihe (keine Mehrfachzuordnung in der Auswahl)", async () => {
    const manufacturer = await resolveManufacturerByTerm("BMW");
    expect(manufacturer).not.toBeNull();
    if (!manufacturer) return;

    const models = await listActiveModelsForManufacturerSlug(manufacturer.slug);
    const names = models.map((model) => model.name);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe("Natural Sorting innerhalb einer Baureihe", () => {
  it("Mercedes-Benz B-Klasse ist numerisch sortiert (B 150 vor B 160 vor ... vor B 250)", async () => {
    const manufacturer = await resolveManufacturerByTerm("Mercedes-Benz");
    expect(manufacturer).not.toBeNull();
    if (!manufacturer) return;

    const group = await resolveModelGroupByTerm(manufacturer.slug, "B-Klasse");
    expect(group).not.toBeNull();
    if (!group) return;

    const models = await listActiveModelsForManufacturerSlug(manufacturer.slug);
    const numericOnly = models
      .filter((model) => model.groupSlug === group.slug && /^B \d+$/.test(model.name))
      .map((model) => model.name);

    expect(numericOnly).toEqual(["B 150", "B 160", "B 170", "B 180", "B 200", "B 220", "B 250"]);
  });

  it("BMW 3er Reihe ist numerisch sortiert (315 vor 316 vor ... vor 340)", async () => {
    const manufacturer = await resolveManufacturerByTerm("BMW");
    expect(manufacturer).not.toBeNull();
    if (!manufacturer) return;

    const group = await resolveModelGroupByTerm(manufacturer.slug, "3er Reihe");
    expect(group).not.toBeNull();
    if (!group) return;

    const models = await listActiveModelsForManufacturerSlug(manufacturer.slug);
    const numericOnly = models
      .filter((model) => model.groupSlug === group.slug && /^\d+$/.test(model.name))
      .map((model) => model.name);

    expect(numericOnly).toEqual(["315", "316", "318", "320", "323", "324", "325", "328", "330", "335", "340"]);
  });
});

describe('UI-Anzeige: Gruppenname trägt den "(alle)"-Zusatz, der Rohname bleibt intern erhalten', () => {
  it('BMW "3er Reihe" wird als "3er Reihe (alle)" angezeigt', async () => {
    const manufacturer = await resolveManufacturerByTerm("BMW");
    expect(manufacturer).not.toBeNull();
    if (!manufacturer) return;

    const group = await findModelGroupBySlug(manufacturer.slug, "3er-reihe");
    expect(group).not.toBeNull();
    expect(group?.name).toBe("3er Reihe");
    expect(group?.displayName).toBe("3er Reihe (alle)");
  });

  it('Mercedes-Benz "B-Klasse" wird als "B-Klasse (alle)" angezeigt, nicht doppelt in der Modellliste', async () => {
    const manufacturer = await resolveManufacturerByTerm("Mercedes-Benz");
    expect(manufacturer).not.toBeNull();
    if (!manufacturer) return;

    const group = await findModelGroupBySlug(manufacturer.slug, "b-klasse");
    expect(group?.displayName).toBe("B-Klasse (alle)");

    // "B-Klasse" selbst darf NICHT zusätzlich als eigenständiges Modell auftauchen.
    const models = await listActiveModelsForManufacturerSlug(manufacturer.slug);
    expect(models.some((model) => model.name === "B-Klasse")).toBe(false);
  });
});

describe("Synthetische Gruppen (keine eigene mobile.de-Modellgruppen-Zeile)", () => {
  it("BMW 8er Reihe (alle) enthält 840 und 850", async () => {
    const manufacturer = await resolveManufacturerByTerm("BMW");
    expect(manufacturer).not.toBeNull();
    if (!manufacturer) return;

    const group = await resolveModelGroupByTerm(manufacturer.slug, "8er Reihe");
    expect(group).not.toBeNull();
    if (!group) return;

    const models = await listActiveModelsForManufacturerSlug(manufacturer.slug);
    const names = models.filter((model) => model.groupSlug === group.slug).map((model) => model.name);
    expect(names.sort()).toEqual(["840", "850"]);
  });

  it('Mercedes-Benz "Historische Modelle" enthält die vorfusionären Modelle mit isHistoric=true', async () => {
    const manufacturer = await resolveManufacturerByTerm("Mercedes-Benz");
    expect(manufacturer).not.toBeNull();
    if (!manufacturer) return;

    const group = await resolveModelGroupByTerm(manufacturer.slug, "Historische Modelle");
    expect(group).not.toBeNull();
    if (!group) return;

    const models = await listActiveModelsForManufacturerSlug(manufacturer.slug);
    const historicModels = models.filter((model) => model.groupSlug === group.slug);
    expect(historicModels.length).toBeGreaterThan(0);
    for (const model of historicModels) {
      expect(model.isHistoric, `"${model.name}" sollte isHistoric=true haben`).toBe(true);
    }
  });

  it('Mercedes-Benz "AMG GT (alle)" enthält AMG GT, AMG GT C, AMG GT R, AMG GT S', async () => {
    const manufacturer = await resolveManufacturerByTerm("Mercedes-Benz");
    expect(manufacturer).not.toBeNull();
    if (!manufacturer) return;

    const group = await resolveModelGroupByTerm(manufacturer.slug, "AMG GT");
    expect(group).not.toBeNull();
    if (!group) return;

    const models = await listActiveModelsForManufacturerSlug(manufacturer.slug);
    const names = models.filter((model) => model.groupSlug === group.slug).map((model) => model.name);
    expect(names.sort()).toEqual(["AMG GT", "AMG GT C", "AMG GT R", "AMG GT S"]);
  });
});

describe("Gruppenlose Modelle bleiben gruppenlos (keine Zwangszuordnung)", () => {
  it.each(["Sprinter", "Vito", "Citan", "EQA", "T-Klasse"])(
    'Mercedes-Benz "%s" hat keine Baureihe (groupSlug=null)',
    async (modelTerm) => {
      const manufacturer = await resolveManufacturerByTerm("Mercedes-Benz");
      expect(manufacturer).not.toBeNull();
      if (!manufacturer) return;

      const model = await resolveModelByTerm(manufacturer.slug, modelTerm);
      expect(model, `Modell "${modelTerm}" nicht gefunden`).not.toBeNull();
      expect(model?.groupSlug).toBeNull();
    },
  );

  it("Mercedes-Benz Vario bleibt trotz Gruppen-Hierarchie als Nutzfahrzeug ausgeblendet", async () => {
    const manufacturer = await resolveManufacturerByTerm("Mercedes-Benz");
    expect(manufacturer).not.toBeNull();
    if (!manufacturer) return;

    const model = await resolveModelByTerm(manufacturer.slug, "Vario");
    expect(model).toBeNull();
  });
});

describe("Andere Marken bleiben unberührt (keine Gruppen-Hierarchie außerhalb BMW/Mercedes-Benz)", () => {
  it.each(["Audi", "Volkswagen", "Porsche", "Toyota"])(
    '"%s" hat keine Modellgruppen',
    async (manufacturerTerm) => {
      const manufacturer = await resolveManufacturerByTerm(manufacturerTerm);
      expect(manufacturer).not.toBeNull();
      if (!manufacturer) return;

      const groups = await listActiveModelGroupsForManufacturerSlug(manufacturer.slug);
      expect(groups).toHaveLength(0);
    },
  );

  it("Audi A3 ist weiterhin ohne Baureihen-Auswahl direkt auffindbar (groupSlug=null)", async () => {
    const manufacturer = await resolveManufacturerByTerm("Audi");
    expect(manufacturer).not.toBeNull();
    if (!manufacturer) return;

    const model = await resolveModelByTerm(manufacturer.slug, "A3");
    expect(model).not.toBeNull();
    expect(model?.groupSlug).toBeNull();
  });

  it("Porsche 911 (weiterhin über mobile-de-groupings.ts kollabiert) bleibt unverändert auffindbar", async () => {
    const manufacturer = await resolveManufacturerByTerm("Porsche");
    expect(manufacturer).not.toBeNull();
    if (!manufacturer) return;

    const model = await resolveModelByTerm(manufacturer.slug, "996");
    expect(model, '"996" sollte als Alias von "911" auffindbar sein').not.toBeNull();
    expect(model?.name).toBe("911");
    expect(model?.groupSlug).toBeNull();
  });
});

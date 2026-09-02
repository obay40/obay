/**
 * mobile.de-Katalog-Importer.
 *
 * Liest den vendorten mobile.de-Snapshot
 * (packages/database/vendor/mobile-de/catalog.json, siehe
 * docs/vehicle-data-sources.md) und synchronisiert VehicleManufacturer/
 * VehicleModel (source: MOBILE_DE) in Postgres.
 *
 * Läuft NIE automatisch zur Laufzeit der Website – nur manuell/CI-getriggert:
 *   pnpm mobile-de-catalog:import
 *
 * mobile.de ist seit diesem Import die aktive Standardquelle der
 * Autoklick24-PKW-Suche (siehe queries.ts). Der vorherige VehiclesDB-Import
 * bleibt unangetastet in der Datenbank – nichts wird gelöscht, die
 * kuratierten Abfragen filtern nur zusätzlich auf source=MOBILE_DE.
 *
 * Die Quelle liefert bereits ausschließlich Auto/Car-Daten (siehe
 * "Hinweise & Quellen" im vendorten Excel: "Keine Motorrad-, LKW- oder
 * Wohnmobil-Portale wurden als Quelle verwendet") – ein systematischer
 * Stichprobenscan gegen bekannte Wohnmobil-/Motorrad-/LKW-Begriffe ergab 0
 * Treffer, daher entfällt hier die aufwändige Kategorie-Kuration wie beim
 * VehiclesDB-Import. Ausnahme: COMMERCIAL_MODEL_OVERRIDES (siehe
 * mobile-de-groupings.ts) für den einen bekannten Präzedenzfall
 * (Mercedes-Benz Vario, LKW-Baureihe).
 *
 * MODELLGRUPPEN-HIERARCHIE: mobile.de liefert für 6 Marken (BMW, Ford,
 * Lexus, MINI, Mercedes-Benz, Porsche) eine zweistufige Hierarchie
 * (Marke → Modellgruppe → Modell), bei der die "Modell"-Kindzeilen meist
 * Motorisierungs-/Trim-Codes einer Baureihe sind (z. B. BMW "320" unter
 * Modellgruppe "3er Reihe"). Naive 1:1-Übernahme jeder Zeile als
 * eigenständiges VehicleModel würde die Modellauswahl mit hunderten
 * Motorisierungscodes zumüllen statt sauberer Baureihen ("Modell vs.
 * Variante"-Prinzip). Deshalb werden solche Zeilen anhand der manuell
 * gepflegten Zuordnungstabelle mobile-de-groupings.ts zu EINEM kanonischen
 * VehicleModel je Baureihe zusammengefasst; die Rohwerte werden als Aliase
 * (VehicleModelAlias) angehängt, bleiben also durchsuchbar. Modellgruppen,
 * die mehrere echte Nameplates bündeln (z. B. BMW "X-Reihe" = X1..X7),
 * werden stattdessen anhand ihrer Kinder aufgesplittet (siehe
 * SPLIT_MODELLGRUPPEN). Marken ohne Modellgruppen-Hierarchie sind von all
 * dem unberührt: jede Katalogzeile bleibt 1:1 ein eigenes Modell.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { PrismaClient, VehicleCatalogSource, type VehicleCategory } from "../generated/client/index";
import { normalizedSearchKey, slugify } from "../src/vehicle-catalog/normalize";
import {
  GROUPINGS,
  SPLIT_MODELLGRUPPEN,
  EXCLUDE_MODEL_NAMES,
  EXCLUDE_MODEL_NAMES_EXTRA,
  COMMERCIAL_MODEL_OVERRIDES,
  EXTRA_ALIAS_ATTACHMENTS,
  MANUFACTURER_CATEGORY_OVERRIDES,
  MANUFACTURER_HIDDEN_DUPLICATES,
} from "../src/vehicle-catalog/mobile-de-groupings";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CATALOG_PATH = join(__dirname, "..", "vendor", "mobile-de", "catalog.json");

const PASSENGER_CAR: VehicleCategory = "PASSENGER_CAR";
const TRUCK: VehicleCategory = "TRUCK";

interface SourceEntry {
  marke: string;
  modellgruppe: string | null;
  modell: string;
  ebene: "Modell" | "Modellgruppe";
  anzeige: string;
  quelletyp: string;
  quelleUrl: string;
}

interface SourceCatalog {
  version: string;
  source: string;
  retrievedAt: string;
  hinweisOnlyMakes: string[];
  entries: SourceEntry[];
}

/** Für Deutschland kuratierte "Beliebte Marken"-Reihenfolge, siehe overrides.ts (gleiche Liste). */
const POPULAR_MAKES = [
  "Volkswagen",
  "Mercedes-Benz",
  "BMW",
  "Audi",
  "Skoda",
  "Opel",
  "Ford",
  "Toyota",
  "Hyundai",
  "Porsche",
];

/** Marken, deren Quellname von der in Deutschland üblichen Schreibweise abweicht (Diakritika). */
const MANUFACTURER_DISPLAY_NAMES: Record<string, string> = {
  Skoda: "Škoda",
  Citroen: "Citroën",
};

/** Marken, für die mobile.de eine Marke→Modellgruppe→Modell-Hierarchie führt (siehe mobile-de-groupings.ts). */
const GROUPED_MAKES = new Set(GROUPINGS.map((g) => g.marke));

/**
 * Kanonische Modellnamen je Marke (z. B. Mercedes-Benz "A-Klasse"). Manche
 * mobile.de-Modellgruppen-Wrapperzeilen heißen bereits exakt so wie ihr
 * eigenes kanonisches Modell (z. B. "A-Klasse") und tauchen deshalb NICHT
 * in memberModelNames auf (dort stehen nur die Motorisierungs-Kinder) –
 * das ist kein unbekannter Fall, sondern der 1:1-Fallback trifft zufällig
 * bereits den richtigen Namen. Dient nur zur Vermeidung von Warnungs-Rauschen.
 */
const canonicalNamesByMake = new Map<string, Set<string>>();
for (const grouping of GROUPINGS) {
  const set = canonicalNamesByMake.get(grouping.marke) ?? new Set<string>();
  set.add(grouping.canonicalModel);
  canonicalNamesByMake.set(grouping.marke, set);
}

const prisma = new PrismaClient();

const stats = {
  manufacturersCreated: 0,
  manufacturersUpdated: 0,
  manufacturersUnchanged: 0,
  modelsCreated: 0,
  modelsUpdated: 0,
  modelsUnchanged: 0,
  modelsDeactivated: 0,
  aliasesSynced: 0,
  modelsSkippedSplitWrapper: 0,
  modelsSkippedExcluded: 0,
  modelsSkippedExtraAlias: 0,
  commercialOverridesApplied: 0,
  warnings: [] as string[],
  errors: [] as string[],
};

function readCatalog(): SourceCatalog {
  return JSON.parse(readFileSync(CATALOG_PATH, "utf-8")) as SourceCatalog;
}

function groupKey(marke: string, modell: string): string {
  return `${marke}::${modell}`;
}

/** Rohwert → kanonischer Baureihenname (z. B. "320" → "3er", "C 200" → "C-Klasse"). */
const memberToCanonical = new Map<string, string>();
for (const grouping of GROUPINGS) {
  for (const member of grouping.memberModelNames) {
    const key = groupKey(grouping.marke, member);
    const existing = memberToCanonical.get(key);
    if (existing !== undefined && existing !== grouping.canonicalModel) {
      throw new Error(
        `mobile-de-groupings.ts: widersprüchliche Zuordnung für "${key}" ("${existing}" vs. "${grouping.canonicalModel}").`,
      );
    }
    memberToCanonical.set(key, grouping.canonicalModel);
  }
}

const excludeSet = new Set(
  [...EXCLUDE_MODEL_NAMES, ...EXCLUDE_MODEL_NAMES_EXTRA].map((e) => groupKey(e.marke, e.modell)),
);
const commercialOverrideMap = new Map(COMMERCIAL_MODEL_OVERRIDES.map((e) => [groupKey(e.marke, e.modell), e]));
const extraAliasMap = new Map(EXTRA_ALIAS_ATTACHMENTS.map((e) => [groupKey(e.marke, e.aliasModelName), e]));
const manufacturerCategoryOverrideMap = new Map(MANUFACTURER_CATEGORY_OVERRIDES.map((e) => [e.marke, e]));
const manufacturerHiddenDuplicateMap = new Map(MANUFACTURER_HIDDEN_DUPLICATES.map((e) => [e.marke, e]));

interface CanonicalModelGroup {
  canonicalName: string;
  aliases: Set<string>;
  /** true, sobald mind. ein Rohwert dieser Gruppe über mobile-de-groupings.ts zugeordnet wurde (nicht nur 1:1-Fallback). */
  fromGroupingTable: boolean;
  /** Für den 1:1-Fallback (kein Grouping-Eintrag): die einzige Rohzeile, aus der displayName/anzeige übernommen wird. */
  singleRawEntry: SourceEntry;
}

/** Verarbeitet alle Katalogzeilen einer Marke zu kanonischen Modellgruppen (Baureihe → Aliase). */
function buildCanonicalGroups(marke: string, entries: SourceEntry[]): Map<string, CanonicalModelGroup> {
  const groups = new Map<string, CanonicalModelGroup>();
  const pendingExtraAliases: { targetCanonical: string; aliasName: string }[] = [];

  for (const entry of entries) {
    const key = groupKey(marke, entry.modell);

    if (
      GROUPED_MAKES.has(marke) &&
      entry.ebene === "Modellgruppe" &&
      !memberToCanonical.has(key) &&
      !SPLIT_MODELLGRUPPEN.has(key) &&
      !canonicalNamesByMake.get(marke)?.has(entry.modell)
    ) {
      stats.warnings.push(
        `Unbekannte Modellgruppe "${marke}/${entry.modell}" nicht in mobile-de-groupings.ts erfasst – wird als eigenständiges Modell geführt.`,
      );
    }
    if (
      GROUPED_MAKES.has(marke) &&
      entry.ebene === "Modell" &&
      entry.modellgruppe &&
      !memberToCanonical.has(key) &&
      !SPLIT_MODELLGRUPPEN.has(key) &&
      !excludeSet.has(key) &&
      !extraAliasMap.has(key)
    ) {
      stats.warnings.push(
        `Kind-Modell "${marke}/${entry.modell}" (Modellgruppe "${entry.modellgruppe}") nicht in mobile-de-groupings.ts erfasst – wird als eigenständiges Modell statt als Alias geführt.`,
      );
    }

    if (SPLIT_MODELLGRUPPEN.has(key)) {
      stats.modelsSkippedSplitWrapper += 1;
      continue;
    }
    if (excludeSet.has(key)) {
      stats.modelsSkippedExcluded += 1;
      continue;
    }
    const extraAlias = extraAliasMap.get(key);
    if (extraAlias) {
      pendingExtraAliases.push({ targetCanonical: extraAlias.canonicalModel, aliasName: entry.modell });
      stats.modelsSkippedExtraAlias += 1;
      continue;
    }

    const mapped = memberToCanonical.get(key);
    const canonicalName = mapped ?? entry.modell;

    const group = groups.get(canonicalName) ?? {
      canonicalName,
      aliases: new Set<string>(),
      fromGroupingTable: false,
      singleRawEntry: entry,
    };
    if (mapped) group.fromGroupingTable = true;
    if (entry.modell !== canonicalName) {
      group.aliases.add(entry.modell);
    } else {
      group.singleRawEntry = entry;
    }
    groups.set(canonicalName, group);
  }

  for (const pending of pendingExtraAliases) {
    const target = groups.get(pending.targetCanonical);
    if (target) {
      target.aliases.add(pending.aliasName);
    } else {
      stats.warnings.push(
        `EXTRA_ALIAS_ATTACHMENTS: Ziel-Modell "${marke}/${pending.targetCanonical}" für Alias "${pending.aliasName}" nicht gefunden.`,
      );
    }
  }

  return groups;
}

async function upsertManufacturer(marke: string, version: string): Promise<string> {
  const sourceId = slugify(marke);
  const isPopular = POPULAR_MAKES.includes(marke);
  const displayName = MANUFACTURER_DISPLAY_NAMES[marke] ?? null;
  const categoryOverride = manufacturerCategoryOverrideMap.get(marke);
  const hiddenDuplicate = manufacturerHiddenDuplicateMap.get(marke);

  const existing = await prisma.vehicleManufacturer.findUnique({
    where: { source_sourceId: { source: VehicleCatalogSource.MOBILE_DE, sourceId } },
  });

  const data = {
    slug: sourceId,
    name: marke,
    displayName,
    isActive: !hiddenDuplicate,
    isPopular,
    category: (categoryOverride?.category ?? "PASSENGER_CAR") as VehicleCategory,
    source: VehicleCatalogSource.MOBILE_DE,
    sourceId,
    sourceVersion: version,
    sourceActive: true,
  };

  const manufacturer = await prisma.vehicleManufacturer.upsert({
    where: { source_sourceId: { source: VehicleCatalogSource.MOBILE_DE, sourceId } },
    update: data,
    create: data,
  });

  if (!existing) stats.manufacturersCreated += 1;
  else if (
    existing.name !== data.name ||
    existing.displayName !== data.displayName ||
    existing.isPopular !== data.isPopular ||
    existing.isActive !== data.isActive ||
    existing.category !== data.category
  ) {
    stats.manufacturersUpdated += 1;
  } else stats.manufacturersUnchanged += 1;

  return manufacturer.id;
}

async function syncModelAliases(modelId: string, aliases: string[]) {
  for (const alias of aliases) {
    await prisma.vehicleModelAlias.upsert({
      where: { modelId_alias: { modelId, alias } },
      update: { normalizedAlias: normalizedSearchKey(alias) },
      create: { modelId, alias, normalizedAlias: normalizedSearchKey(alias) },
    });
    stats.aliasesSynced += 1;
  }
}

async function upsertModel(
  manufacturerId: string,
  marke: string,
  group: CanonicalModelGroup,
  version: string,
): Promise<string> {
  const slug = slugify(group.canonicalName);
  const sourceId = `${slugify(marke)}/${slug}`;
  const commercialOverride = commercialOverrideMap.get(groupKey(marke, group.canonicalName));

  const displayName =
    !group.fromGroupingTable && group.singleRawEntry.anzeige !== group.singleRawEntry.modell
      ? group.singleRawEntry.anzeige
      : null;

  const vehicleCategory: VehicleCategory = commercialOverride ? TRUCK : PASSENGER_CAR;
  const isVisibleInPassengerCarSearch = !commercialOverride;
  if (commercialOverride) stats.commercialOverridesApplied += 1;

  const existing = await prisma.vehicleModel.findUnique({
    where: { source_sourceId: { source: VehicleCatalogSource.MOBILE_DE, sourceId } },
  });

  const data = {
    manufacturerId,
    slug,
    name: group.canonicalName,
    displayName,
    isActive: true,
    isPopular: false,
    isHistoric: false,
    bodyTypes: [] as string[],
    vehicleCategory,
    isVisibleInPassengerCarSearch,
    curationStatus: (commercialOverride ? "MANUAL_EXCLUDED" : "AUTO_APPROVED") as const,
    source: VehicleCatalogSource.MOBILE_DE,
    sourceId,
    sourceVersion: version,
    sourceActive: true,
  };

  try {
    const saved = await prisma.vehicleModel.upsert({
      where: { source_sourceId: { source: VehicleCatalogSource.MOBILE_DE, sourceId } },
      update: data,
      create: data,
    });
    await syncModelAliases(saved.id, [...group.aliases]);

    if (!existing) stats.modelsCreated += 1;
    else if (
      existing.name !== data.name ||
      existing.displayName !== data.displayName ||
      existing.vehicleCategory !== data.vehicleCategory ||
      existing.isVisibleInPassengerCarSearch !== data.isVisibleInPassengerCarSearch
    ) {
      stats.modelsUpdated += 1;
    } else stats.modelsUnchanged += 1;

    return sourceId;
  } catch (error) {
    stats.errors.push(`Modell "${sourceId}" konnte nicht gespeichert werden: ${String(error)}`);
    return sourceId;
  }
}

async function main() {
  const catalog = readCatalog();
  console.log("mobile.de-Katalog-Import gestartet");
  console.log(`Source version: ${catalog.version} (${catalog.source})`);

  const entriesByMake = new Map<string, SourceEntry[]>();
  for (const entry of catalog.entries) {
    const list = entriesByMake.get(entry.marke) ?? [];
    list.push(entry);
    entriesByMake.set(entry.marke, list);
  }
  const allMakes = new Set([...entriesByMake.keys(), ...catalog.hinweisOnlyMakes]);

  console.log(`Quelldaten: ${allMakes.size} Hersteller, ${catalog.entries.length} Modellzeilen (RAW)\n`);

  const allSourceIds: string[] = [];

  for (const marke of allMakes) {
    const manufacturerId = await upsertManufacturer(marke, catalog.version);

    const entries = entriesByMake.get(marke) ?? [];
    const groups = buildCanonicalGroups(marke, entries);

    const seenSlugs = new Set<string>();
    for (const group of groups.values()) {
      const slug = slugify(group.canonicalName);
      if (seenSlugs.has(slug)) {
        stats.warnings.push(`Modell-Dublette übersprungen: "${marke}/${group.canonicalName}" (Slug "${slug}").`);
        continue;
      }
      seenSlugs.add(slug);
      const sourceId = await upsertModel(manufacturerId, marke, group, catalog.version);
      allSourceIds.push(sourceId);
    }
  }

  const deactivated = await prisma.vehicleModel.updateMany({
    where: {
      source: VehicleCatalogSource.MOBILE_DE,
      sourceId: { notIn: allSourceIds },
      sourceActive: true,
    },
    data: { sourceActive: false },
  });
  stats.modelsDeactivated = deactivated.count;

  console.log("mobile.de-Katalog-Import abgeschlossen\n");
  console.log(
    `Manufacturers imported: ${stats.manufacturersCreated}\n` +
      `Manufacturers updated: ${stats.manufacturersUpdated}\n` +
      `Manufacturers unchanged: ${stats.manufacturersUnchanged}\n`,
  );
  console.log(
    `Models imported (kanonisch, nach Gruppierung): ${stats.modelsCreated}\n` +
      `Models updated: ${stats.modelsUpdated}\n` +
      `Models unchanged: ${stats.modelsUnchanged}\n` +
      `Models deactivated (nicht mehr in Quelle): ${stats.modelsDeactivated}\n` +
      `Model aliases synced (Motorisierungs-/Trim-Codes): ${stats.aliasesSynced}\n`,
  );
  console.log(
    `RAW-Zeilen übersprungen als Split-Modellgruppen-Wrapper: ${stats.modelsSkippedSplitWrapper}\n` +
      `RAW-Zeilen übersprungen als unspezifischer Sammelwert (EXCLUDE_MODEL_NAMES): ${stats.modelsSkippedExcluded}\n` +
      `RAW-Zeilen übersprungen und stattdessen als Alias angehängt (EXTRA_ALIAS_ATTACHMENTS): ${stats.modelsSkippedExtraAlias}\n` +
      `Nutzfahrzeug-Overrides angewendet (COMMERCIAL_MODEL_OVERRIDES): ${stats.commercialOverridesApplied}\n`,
  );
  console.log(`Warnings: ${stats.warnings.length}`);
  for (const warning of stats.warnings) console.log(`  - ${warning}`);
  console.log(`Errors: ${stats.errors.length}`);
  for (const error of stats.errors) console.log(`  - ${error}`);

  if (stats.errors.length > 0) {
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

/**
 * Fahrzeugkatalog-Importer.
 *
 * Liest den vendorten VehiclesDB-Snapshot (packages/database/vendor/vehiclesdb/,
 * siehe docs/vehicle-data-sources.md), wendet die Autoklick24-Overrides
 * (src/vehicle-catalog/overrides.ts) an und synchronisiert
 * VehicleManufacturer/VehicleModel (+ Aliase) in Postgres.
 *
 * Läuft NIE automatisch zur Laufzeit der Website – nur manuell/CI-getriggert:
 *   pnpm vehicle-catalog:import
 *
 * Sync-Prinzip: upsert je (source, sourceId). Datensätze, die im aktuellen
 * Import fehlen, werden NIE gelöscht, sondern auf sourceActive=false
 * gesetzt (siehe Prisma-Schema-Kommentar zu VehicleManufacturer).
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { PrismaClient, VehicleCatalogSource } from "../generated/client/index";
import {
  manufacturerOverrides,
  modelOverrides,
  manualManufacturers,
  manualModels,
} from "../src/vehicle-catalog/overrides";
import { normalizedSearchKey, slugify } from "../src/vehicle-catalog/normalize";

const __dirname = dirname(fileURLToPath(import.meta.url));
const VENDOR_DIR = join(__dirname, "..", "vendor", "vehiclesdb");

interface SourceMake {
  id: string;
  slug: string;
  name: string;
  aliases?: string[];
  kinds: string[];
}

interface SourceModel {
  id: string;
  make_id: string;
  slug: string;
  name: string;
  kind: string;
  aliases?: string[];
  body_types?: string[];
}

const prisma = new PrismaClient();

const stats = {
  manufacturersCreated: 0,
  manufacturersUpdated: 0,
  manufacturersUnchanged: 0,
  manufacturersDeactivated: 0,
  modelsCreated: 0,
  modelsUpdated: 0,
  modelsUnchanged: 0,
  modelsDeactivated: 0,
  warnings: [] as string[],
  errors: [] as string[],
};

function readSourceVersion(): string {
  return readFileSync(join(VENDOR_DIR, "VERSION"), "utf-8").trim();
}

function readSourceMakes(): SourceMake[] {
  return JSON.parse(readFileSync(join(VENDOR_DIR, "car", "makes.json"), "utf-8")) as SourceMake[];
}

function readSourceModels(): SourceModel[] {
  return JSON.parse(readFileSync(join(VENDOR_DIR, "car", "models.json"), "utf-8")) as SourceModel[];
}

/** Führt zwei Alias-Arrays zusammen und entfernt Duplikate (case-sensitive). */
function mergeAliases(...lists: (string[] | undefined)[]): string[] {
  const seen = new Set<string>();
  for (const list of lists) {
    for (const alias of list ?? []) {
      seen.add(alias);
    }
  }
  return [...seen];
}

async function syncManufacturerAliases(manufacturerId: string, aliases: string[]) {
  for (const alias of aliases) {
    await prisma.vehicleManufacturerAlias.upsert({
      where: { manufacturerId_alias: { manufacturerId, alias } },
      update: { normalizedAlias: normalizedSearchKey(alias) },
      create: { manufacturerId, alias, normalizedAlias: normalizedSearchKey(alias) },
    });
  }
}

async function syncModelAliases(modelId: string, aliases: string[]) {
  for (const alias of aliases) {
    await prisma.vehicleModelAlias.upsert({
      where: { modelId_alias: { modelId, alias } },
      update: { normalizedAlias: normalizedSearchKey(alias) },
      create: { modelId, alias, normalizedAlias: normalizedSearchKey(alias) },
    });
  }
}

async function importManufacturers(sourceMakes: SourceMake[], sourceVersion: string) {
  const overridesById = new Map(manufacturerOverrides.map((o) => [o.sourceId, o]));
  const manufacturerIdBySourceId = new Map<string, string>();

  for (const make of sourceMakes) {
    const override = overridesById.get(make.id);
    const isPopular = override?.isPopular ?? false;
    const isActive = !(override?.hidden ?? false);
    const displayName = override?.displayName;
    const slug = slugify(make.name);

    const existing = await prisma.vehicleManufacturer.findUnique({
      where: { source_sourceId: { source: VehicleCatalogSource.VEHICLES_DB, sourceId: make.id } },
    });

    const data = {
      slug,
      name: make.name,
      displayName: displayName ?? null,
      isActive,
      isPopular,
      source: VehicleCatalogSource.VEHICLES_DB,
      sourceId: make.id,
      sourceVersion,
      sourceActive: true,
    };

    const manufacturer = await prisma.vehicleManufacturer.upsert({
      where: { source_sourceId: { source: VehicleCatalogSource.VEHICLES_DB, sourceId: make.id } },
      update: data,
      create: data,
    });

    manufacturerIdBySourceId.set(make.id, manufacturer.id);

    const aliases = mergeAliases(make.aliases, override?.aliases);
    await syncManufacturerAliases(manufacturer.id, aliases);

    if (!existing) stats.manufacturersCreated += 1;
    else if (hasManufacturerChanged(existing, data)) stats.manufacturersUpdated += 1;
    else stats.manufacturersUnchanged += 1;
  }

  // Manuell gepflegte Hersteller (source: MANUAL) – aktuell leer, siehe overrides.ts.
  for (const manual of manualManufacturers) {
    const manufacturer = await prisma.vehicleManufacturer.upsert({
      where: { slug: manual.slug },
      update: {
        name: manual.name,
        country: manual.country ?? null,
        isPopular: manual.isPopular ?? false,
        source: VehicleCatalogSource.MANUAL,
        sourceActive: true,
      },
      create: {
        slug: manual.slug,
        name: manual.name,
        country: manual.country ?? null,
        isPopular: manual.isPopular ?? false,
        source: VehicleCatalogSource.MANUAL,
      },
    });
    manufacturerIdBySourceId.set(`manual:${manual.slug}`, manufacturer.id);
    await syncManufacturerAliases(manufacturer.id, manual.aliases ?? []);
  }

  // Hersteller, die beim letzten Import noch da waren, jetzt aber nicht mehr
  // in der Quelle vorkommen: NICHT löschen, nur als sourceActive=false markieren.
  const currentSourceIds = sourceMakes.map((m) => m.id);
  const deactivated = await prisma.vehicleManufacturer.updateMany({
    where: {
      source: VehicleCatalogSource.VEHICLES_DB,
      sourceId: { notIn: currentSourceIds },
      sourceActive: true,
    },
    data: { sourceActive: false },
  });
  stats.manufacturersDeactivated = deactivated.count;

  return manufacturerIdBySourceId;
}

function hasManufacturerChanged(
  existing: { name: string; displayName: string | null; isActive: boolean; isPopular: boolean },
  next: { name: string; displayName: string | null; isActive: boolean; isPopular: boolean },
): boolean {
  return (
    existing.name !== next.name ||
    existing.displayName !== next.displayName ||
    existing.isActive !== next.isActive ||
    existing.isPopular !== next.isPopular
  );
}

async function importModels(
  sourceModels: SourceModel[],
  manufacturerIdBySourceId: Map<string, string>,
  sourceVersion: string,
) {
  const overridesById = new Map(modelOverrides.map((o) => [o.sourceId, o]));
  const seenSlugsPerManufacturer = new Map<string, Set<string>>();

  for (const model of sourceModels) {
    const manufacturerId = manufacturerIdBySourceId.get(model.make_id);
    if (!manufacturerId) {
      stats.warnings.push(
        `Modell "${model.id}" übersprungen: Hersteller "${model.make_id}" nicht im Katalog gefunden.`,
      );
      continue;
    }

    const override = overridesById.get(model.id);
    const slug = model.slug;

    const dedupeKey = manufacturerId;
    const seenSlugs = seenSlugsPerManufacturer.get(dedupeKey) ?? new Set<string>();
    if (seenSlugs.has(slug)) {
      stats.warnings.push(
        `Modell-Dublette übersprungen: "${model.id}" (Slug "${slug}" bereits vergeben bei diesem Hersteller).`,
      );
      continue;
    }
    seenSlugs.add(slug);
    seenSlugsPerManufacturer.set(dedupeKey, seenSlugs);

    const isActive = !(override?.hidden ?? false);
    const displayName = override?.displayName;

    const existing = await prisma.vehicleModel.findUnique({
      where: { source_sourceId: { source: VehicleCatalogSource.VEHICLES_DB, sourceId: model.id } },
    });

    const data = {
      manufacturerId,
      slug,
      name: model.name,
      displayName: displayName ?? null,
      isActive,
      isPopular: override?.isPopular ?? false,
      bodyTypes: model.body_types ?? [],
      source: VehicleCatalogSource.VEHICLES_DB,
      sourceId: model.id,
      sourceVersion,
      sourceActive: true,
    };

    try {
      const saved = await prisma.vehicleModel.upsert({
        where: { source_sourceId: { source: VehicleCatalogSource.VEHICLES_DB, sourceId: model.id } },
        update: data,
        create: data,
      });

      const aliases = mergeAliases(model.aliases, override?.aliases);
      await syncModelAliases(saved.id, aliases);

      if (!existing) stats.modelsCreated += 1;
      else if (hasModelChanged(existing, data)) stats.modelsUpdated += 1;
      else stats.modelsUnchanged += 1;
    } catch (error) {
      stats.errors.push(`Modell "${model.id}" konnte nicht gespeichert werden: ${String(error)}`);
    }
  }

  // Manuell gepflegte Modelle (source: MANUAL) – aktuell leer, siehe overrides.ts.
  for (const manual of manualModels) {
    const manufacturer = await prisma.vehicleManufacturer.findUnique({
      where: { slug: manual.manufacturerSlug },
    });
    if (!manufacturer) {
      stats.warnings.push(
        `Manuelles Modell "${manual.name}" übersprungen: Hersteller "${manual.manufacturerSlug}" nicht gefunden.`,
      );
      continue;
    }
    const saved = await prisma.vehicleModel.upsert({
      where: { manufacturerId_slug: { manufacturerId: manufacturer.id, slug: manual.slug } },
      update: {
        name: manual.name,
        productionStart: manual.productionStart ?? null,
        productionEnd: manual.productionEnd ?? null,
        isPopular: manual.isPopular ?? false,
        source: VehicleCatalogSource.MANUAL,
        sourceActive: true,
      },
      create: {
        manufacturerId: manufacturer.id,
        slug: manual.slug,
        name: manual.name,
        productionStart: manual.productionStart ?? null,
        productionEnd: manual.productionEnd ?? null,
        isPopular: manual.isPopular ?? false,
        source: VehicleCatalogSource.MANUAL,
      },
    });
    await syncModelAliases(saved.id, manual.aliases ?? []);
  }

  const currentSourceIds = sourceModels.map((m) => m.id);
  const deactivated = await prisma.vehicleModel.updateMany({
    where: {
      source: VehicleCatalogSource.VEHICLES_DB,
      sourceId: { notIn: currentSourceIds },
      sourceActive: true,
    },
    data: { sourceActive: false },
  });
  stats.modelsDeactivated = deactivated.count;
}

function hasModelChanged(
  existing: { name: string; displayName: string | null; isActive: boolean; isPopular: boolean },
  next: { name: string; displayName: string | null; isActive: boolean; isPopular: boolean },
): boolean {
  return (
    existing.name !== next.name ||
    existing.displayName !== next.displayName ||
    existing.isActive !== next.isActive ||
    existing.isPopular !== next.isPopular
  );
}

async function main() {
  const sourceVersion = readSourceVersion();
  const sourceMakes = readSourceMakes();
  const sourceModels = readSourceModels();

  console.log(`Vehicle catalog import gestartet`);
  console.log(`Source version: VehiclesDB ${sourceVersion}`);
  console.log(`Quelldaten: ${sourceMakes.length} Hersteller, ${sourceModels.length} Modelle (PKW)\n`);

  const manufacturerIdBySourceId = await importManufacturers(sourceMakes, sourceVersion);
  await importModels(sourceModels, manufacturerIdBySourceId, sourceVersion);

  console.log("Vehicle catalog import completed\n");
  console.log(`Source version: ${sourceVersion}\n`);
  console.log(
    `Manufacturers imported: ${stats.manufacturersCreated}\n` +
      `Manufacturers updated: ${stats.manufacturersUpdated}\n` +
      `Manufacturers unchanged: ${stats.manufacturersUnchanged}\n` +
      `Manufacturers deactivated (removed upstream): ${stats.manufacturersDeactivated}\n`,
  );
  console.log(
    `Models imported: ${stats.modelsCreated}\n` +
      `Models updated: ${stats.modelsUpdated}\n` +
      `Models unchanged: ${stats.modelsUnchanged}\n` +
      `Models deactivated (removed upstream): ${stats.modelsDeactivated}\n`,
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

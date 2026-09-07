/**
 * Gemeinsame Lesezugriffe auf den Fahrzeugkatalog. Wird sowohl von den
 * API-Routen (apps/web/src/app/api/v1/vehicle-manufacturers/**) als auch
 * direkt von serverseitigen Next.js-Komponenten (z. B. /autos/page.tsx)
 * verwendet, damit die Query-Logik nur einmal existiert.
 *
 * isActive filtert nach "in Autoklick24 nutzbar" (NICHT nach
 * Produktionsstatus) und sourceActive schließt Datensätze aus, die beim
 * letzten Import nicht mehr in der Quelle gefunden wurden.
 *
 * AKTIVE QUELLE: mobile.de (source=MOBILE_DE, siehe
 * packages/database/vendor/mobile-de/ und docs/vehicle-data-sources.md).
 * Der vorherige VehiclesDB-Import (source=VEHICLES_DB) bleibt vollständig in
 * der Datenbank erhalten – nichts wird gelöscht –, ist aber NICHT mehr Teil
 * der Standardsicht. Alle Funktionen hier filtern deshalb explizit auf
 * ACTIVE_CATALOG_SOURCE, nicht nur auf isActive/category.
 */
import { prisma } from "../client";
import { VehicleCatalogSource } from "../../generated/client/index";
import { naturalCompare, normalizedSearchKey } from "./normalize";

export const ACTIVE_CATALOG_SOURCE = VehicleCatalogSource.MOBILE_DE;
const PASSENGER_CAR_MANUFACTURER_CATEGORIES = ["PASSENGER_CAR", "MULTI_CATEGORY"] as const;

export interface VehicleManufacturerRecord {
  id: string;
  slug: string;
  name: string;
  displayName: string | null;
  isPopular: boolean;
  aliases: string[];
}

export interface VehicleModelRecord {
  id: string;
  slug: string;
  name: string;
  displayName: string | null;
  isPopular: boolean;
  isHistoric: boolean;
  bodyTypes: string[];
  aliases: string[];
  /**
   * Zugehörige Modellgruppe/Baureihe (z. B. BMW "3er Reihe", Mercedes-Benz
   * "C-Klasse"), falls der Hersteller eine 3-Ebenen-Hierarchie hat (aktuell
   * nur BMW/Mercedes-Benz, siehe mobile-de-model-groups.ts). null bei
   * Herstellern ohne Gruppen-Hierarchie oder gruppenlosen Modellen.
   */
  groupSlug: string | null;
  groupName: string | null;
}

/** Modellgruppe/Baureihe (z. B. BMW "3er Reihe", Mercedes-Benz "C-Klasse"), siehe VehicleModelGroup-Schema. */
export interface VehicleModelGroupRecord {
  id: string;
  slug: string;
  name: string;
  displayName: string | null;
  isPopular: boolean;
}

/** Anzeigename: das gepflegte Override, sonst der Katalogname. */
export function resolveDisplayName(record: { name: string; displayName: string | null }): string {
  return record.displayName ?? record.name;
}

const MANUFACTURER_SELECT = {
  id: true,
  slug: true,
  name: true,
  displayName: true,
  isPopular: true,
  aliases: { select: { alias: true } },
} as const;

const MODEL_SELECT = {
  id: true,
  slug: true,
  name: true,
  displayName: true,
  isPopular: true,
  isHistoric: true,
  bodyTypes: true,
  aliases: { select: { alias: true } },
  group: { select: { slug: true, name: true, displayName: true } },
} as const;

const MODEL_GROUP_SELECT = {
  id: true,
  slug: true,
  name: true,
  displayName: true,
  isPopular: true,
} as const;

function flattenAliases<T extends { aliases: { alias: string }[] }>(
  record: T,
): Omit<T, "aliases"> & { aliases: string[] } {
  return { ...record, aliases: record.aliases.map((a) => a.alias) };
}

type ModelRow = {
  group: { slug: string; name: string; displayName: string | null } | null;
  aliases: { alias: string }[];
} & Record<string, unknown>;

/** Entpackt Aliase UND die optionale Gruppen-Relation (siehe VehicleModelRecord.groupSlug/groupName). */
function flattenModel<T extends ModelRow>(
  record: T,
): Omit<T, "aliases" | "group"> & { aliases: string[]; groupSlug: string | null; groupName: string | null } {
  const { group, aliases, ...rest } = record;
  return {
    ...rest,
    aliases: aliases.map((a) => a.alias),
    groupSlug: group?.slug ?? null,
    groupName: group ? resolveDisplayName(group) : null,
  } as Omit<T, "aliases" | "group"> & { aliases: string[]; groupSlug: string | null; groupName: string | null };
}

function sortByDisplayName<T extends { name: string; displayName: string | null }>(records: T[]): T[] {
  return [...records].sort((a, b) => naturalCompare(resolveDisplayName(a), resolveDisplayName(b)));
}

export async function listActiveManufacturers(): Promise<VehicleManufacturerRecord[]> {
  const rows = await prisma.vehicleManufacturer.findMany({
    where: {
      source: ACTIVE_CATALOG_SOURCE,
      isActive: true,
      sourceActive: true,
      category: { in: [...PASSENGER_CAR_MANUFACTURER_CATEGORIES] },
    },
    select: MANUFACTURER_SELECT,
  });
  return sortByDisplayName(rows.map(flattenAliases));
}

export async function findManufacturerBySlug(
  slug: string,
): Promise<VehicleManufacturerRecord | null> {
  const row = await prisma.vehicleManufacturer.findFirst({
    where: {
      slug,
      source: ACTIVE_CATALOG_SOURCE,
      isActive: true,
      sourceActive: true,
      category: { in: [...PASSENGER_CAR_MANUFACTURER_CATEGORIES] },
    },
    select: MANUFACTURER_SELECT,
  });
  return row ? flattenAliases(row) : null;
}

export async function listActiveModelsForManufacturerSlug(
  manufacturerSlug: string,
): Promise<VehicleModelRecord[]> {
  const rows = await prisma.vehicleModel.findMany({
    where: {
      source: ACTIVE_CATALOG_SOURCE,
      isActive: true,
      sourceActive: true,
      isVisibleInPassengerCarSearch: true,
      manufacturer: {
        slug: manufacturerSlug,
        source: ACTIVE_CATALOG_SOURCE,
        isActive: true,
        sourceActive: true,
        category: { in: [...PASSENGER_CAR_MANUFACTURER_CATEGORIES] },
      },
    },
    select: MODEL_SELECT,
  });
  return sortByDisplayName(rows.map(flattenModel));
}

export async function findModelBySlug(
  manufacturerSlug: string,
  modelSlug: string,
): Promise<VehicleModelRecord | null> {
  const row = await prisma.vehicleModel.findFirst({
    where: {
      slug: modelSlug,
      source: ACTIVE_CATALOG_SOURCE,
      isActive: true,
      sourceActive: true,
      isVisibleInPassengerCarSearch: true,
      manufacturer: {
        slug: manufacturerSlug,
        source: ACTIVE_CATALOG_SOURCE,
        isActive: true,
        sourceActive: true,
        category: { in: [...PASSENGER_CAR_MANUFACTURER_CATEGORIES] },
      },
    },
    select: MODEL_SELECT,
  });
  return row ? flattenModel(row) : null;
}

/**
 * Listet die Modellgruppen/Baureihen eines Herstellers (z. B. BMW "1er
 * Reihe".."M-Modelle"). Leeres Array bei Herstellern ohne Gruppen-Hierarchie
 * (aktuell alle außer BMW/Mercedes-Benz) - kein Fehlerfall, die UI blendet
 * die Baureihen-Auswahl dann einfach aus (siehe ModelGroupCombobox).
 */
export async function listActiveModelGroupsForManufacturerSlug(
  manufacturerSlug: string,
): Promise<VehicleModelGroupRecord[]> {
  const rows = await prisma.vehicleModelGroup.findMany({
    where: {
      source: ACTIVE_CATALOG_SOURCE,
      isActive: true,
      sourceActive: true,
      manufacturer: {
        slug: manufacturerSlug,
        source: ACTIVE_CATALOG_SOURCE,
        isActive: true,
        sourceActive: true,
        category: { in: [...PASSENGER_CAR_MANUFACTURER_CATEGORIES] },
      },
    },
    select: MODEL_GROUP_SELECT,
  });
  return sortByDisplayName(rows);
}

export async function findModelGroupBySlug(
  manufacturerSlug: string,
  groupSlug: string,
): Promise<VehicleModelGroupRecord | null> {
  return prisma.vehicleModelGroup.findFirst({
    where: {
      slug: groupSlug,
      source: ACTIVE_CATALOG_SOURCE,
      isActive: true,
      sourceActive: true,
      manufacturer: {
        slug: manufacturerSlug,
        source: ACTIVE_CATALOG_SOURCE,
        isActive: true,
        sourceActive: true,
        category: { in: [...PASSENGER_CAR_MANUFACTURER_CATEGORIES] },
      },
    },
    select: MODEL_GROUP_SELECT,
  });
}

/** Gruppen-Gegenstück zu resolveManufacturerByTerm/resolveModelByTerm, z. B. "3er" → BMW "3er Reihe". */
export async function resolveModelGroupByTerm(
  manufacturerSlug: string,
  term: string,
): Promise<VehicleModelGroupRecord | null> {
  const bySlug = await findModelGroupBySlug(manufacturerSlug, term);
  if (bySlug) return bySlug;

  // Anders als bei Herstellern/Modellen trägt displayName hier IMMER den
  // UI-Zusatz "(alle)" (siehe mobile-de-model-groups.ts) - ein Nutzer tippt
  // aber die Baureihe ohne diesen Zusatz ("3er Reihe", nicht "3er Reihe
  // (alle)"). Der Fallback vergleicht deshalb gegen den rohen Namen, nicht
  // gegen resolveDisplayName.
  const key = normalizedSearchKey(term);
  const all = await listActiveModelGroupsForManufacturerSlug(manufacturerSlug);
  return all.find((group) => normalizedSearchKey(group.name) === key) ?? null;
}

/**
 * Findet einen Hersteller per Slug, exaktem Alias oder (diakritikatolerant)
 * Namen – z. B. "Skoda" → Škoda, "Citroen" → Citroën. Beweist, dass die
 * Diakritika-Faltung tatsächlich funktioniert, nicht nur architektonisch
 * vorgesehen ist. Sucht nur innerhalb der aktiven Quelle (siehe Modulkommentar).
 */
export async function resolveManufacturerByTerm(
  term: string,
): Promise<VehicleManufacturerRecord | null> {
  const bySlugOrAlias = await prisma.vehicleManufacturer.findFirst({
    where: {
      source: ACTIVE_CATALOG_SOURCE,
      isActive: true,
      sourceActive: true,
      category: { in: [...PASSENGER_CAR_MANUFACTURER_CATEGORIES] },
      OR: [{ slug: term }, { aliases: { some: { normalizedAlias: normalizedSearchKey(term) } } }],
    },
    select: MANUFACTURER_SELECT,
  });
  if (bySlugOrAlias) return flattenAliases(bySlugOrAlias);

  const key = normalizedSearchKey(term);
  const all = await listActiveManufacturers();
  return all.find((manufacturer) => normalizedSearchKey(resolveDisplayName(manufacturer)) === key) ?? null;
}

/** Modell-Gegenstück zu resolveManufacturerByTerm, z. B. "M340i" → BMW M-Modelle "M340i". */
export async function resolveModelByTerm(
  manufacturerSlug: string,
  term: string,
): Promise<VehicleModelRecord | null> {
  const bySlugOrAlias = await prisma.vehicleModel.findFirst({
    where: {
      source: ACTIVE_CATALOG_SOURCE,
      isActive: true,
      sourceActive: true,
      isVisibleInPassengerCarSearch: true,
      manufacturer: {
        slug: manufacturerSlug,
        source: ACTIVE_CATALOG_SOURCE,
        isActive: true,
        sourceActive: true,
        category: { in: [...PASSENGER_CAR_MANUFACTURER_CATEGORIES] },
      },
      OR: [{ slug: term }, { aliases: { some: { normalizedAlias: normalizedSearchKey(term) } } }],
    },
    select: MODEL_SELECT,
  });
  if (bySlugOrAlias) return flattenModel(bySlugOrAlias);

  const key = normalizedSearchKey(term);
  const all = await listActiveModelsForManufacturerSlug(manufacturerSlug);
  return all.find((model) => normalizedSearchKey(resolveDisplayName(model)) === key) ?? null;
}

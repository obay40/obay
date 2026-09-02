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
} as const;

function flattenAliases<T extends { aliases: { alias: string }[] }>(
  record: T,
): Omit<T, "aliases"> & { aliases: string[] } {
  return { ...record, aliases: record.aliases.map((a) => a.alias) };
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
  return sortByDisplayName(rows.map(flattenAliases));
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
  return row ? flattenAliases(row) : null;
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
  if (bySlugOrAlias) return flattenAliases(bySlugOrAlias);

  const key = normalizedSearchKey(term);
  const all = await listActiveModelsForManufacturerSlug(manufacturerSlug);
  return all.find((model) => normalizedSearchKey(resolveDisplayName(model)) === key) ?? null;
}

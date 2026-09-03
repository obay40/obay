import { z } from "zod";
import { FuelType, type VehicleSearchFilters } from "@autoklick24/types";

const fuelTypeValues = Object.values(FuelType) as [FuelType, ...FuelType[]];

/**
 * Validiert Fahrzeugsuche-Filter aus nicht vertrauenswürdiger Quelle (z. B.
 * URL-Query-Parameter). Ungültige/unbekannte Werte werden verworfen statt
 * einen Fehler zu werfen – eine manipulierte URL soll nie zum Absturz
 * führen, nur zu einer leeren/teilweisen Filterauswahl.
 */
export const vehicleSearchFiltersSchema = z.object({
  makeSlug: z.string().trim().min(1).max(60).optional(),
  modelGroupSlug: z.string().trim().min(1).max(60).optional(),
  modelSlug: z.string().trim().min(1).max(60).optional(),
  yearFrom: z.coerce.number().int().min(1980).max(2100).optional(),
  mileageTo: z.coerce.number().int().min(0).max(2_000_000).optional(),
  priceFrom: z.coerce.number().int().min(0).max(100_000_000).optional(),
  priceTo: z.coerce.number().int().min(0).max(100_000_000).optional(),
  powerFromPs: z.coerce.number().int().min(0).max(10_000).optional(),
  powerToPs: z.coerce.number().int().min(0).max(10_000).optional(),
  location: z.string().trim().min(1).max(120).optional(),
  radiusKm: z.coerce.number().int().min(0).max(20_000).optional(),
  fuelTypes: z.array(z.enum(fuelTypeValues)).max(fuelTypeValues.length).optional(),
});

const SEARCH_PARAM_KEYS = {
  makeSlug: "make",
  modelGroupSlug: "modelGroup",
  modelSlug: "model",
  yearFrom: "yearFrom",
  mileageTo: "mileageTo",
  priceFrom: "priceFrom",
  priceTo: "priceTo",
  powerFromPs: "powerFrom",
  powerToPs: "powerTo",
  location: "location",
  radiusKm: "radiusKm",
  fuelTypes: "fuel",
} as const;

/** Baut eine bookmarkbare, lesbare Query-String-Repräsentation der Filter. */
export function buildVehicleSearchParams(filters: VehicleSearchFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.makeSlug) params.set(SEARCH_PARAM_KEYS.makeSlug, filters.makeSlug);
  if (filters.modelGroupSlug) params.set(SEARCH_PARAM_KEYS.modelGroupSlug, filters.modelGroupSlug);
  if (filters.modelSlug) params.set(SEARCH_PARAM_KEYS.modelSlug, filters.modelSlug);
  if (filters.yearFrom) params.set(SEARCH_PARAM_KEYS.yearFrom, String(filters.yearFrom));
  if (filters.mileageTo) params.set(SEARCH_PARAM_KEYS.mileageTo, String(filters.mileageTo));
  if (filters.priceFrom) params.set(SEARCH_PARAM_KEYS.priceFrom, String(filters.priceFrom));
  if (filters.priceTo) params.set(SEARCH_PARAM_KEYS.priceTo, String(filters.priceTo));
  if (filters.powerFromPs)
    params.set(SEARCH_PARAM_KEYS.powerFromPs, String(filters.powerFromPs));
  if (filters.powerToPs) params.set(SEARCH_PARAM_KEYS.powerToPs, String(filters.powerToPs));
  if (filters.location) params.set(SEARCH_PARAM_KEYS.location, filters.location);
  if (filters.radiusKm) params.set(SEARCH_PARAM_KEYS.radiusKm, String(filters.radiusKm));
  for (const fuel of filters.fuelTypes ?? []) {
    params.append(SEARCH_PARAM_KEYS.fuelTypes, fuel);
  }

  return params;
}

/** Liest Filter sicher aus URLSearchParams (oder einem kompatiblen Objekt) zurück. */
export function parseVehicleSearchParams(
  params: URLSearchParams | Record<string, string | string[] | undefined>,
): VehicleSearchFilters {
  const get = (key: string): string | undefined =>
    params instanceof URLSearchParams ? (params.get(key) ?? undefined) : firstValue(params[key]);
  const getAll = (key: string): string[] =>
    params instanceof URLSearchParams ? params.getAll(key) : toArray(params[key]);

  const parsed = vehicleSearchFiltersSchema.safeParse({
    makeSlug: get(SEARCH_PARAM_KEYS.makeSlug),
    modelGroupSlug: get(SEARCH_PARAM_KEYS.modelGroupSlug),
    modelSlug: get(SEARCH_PARAM_KEYS.modelSlug),
    yearFrom: get(SEARCH_PARAM_KEYS.yearFrom),
    mileageTo: get(SEARCH_PARAM_KEYS.mileageTo),
    priceFrom: get(SEARCH_PARAM_KEYS.priceFrom),
    priceTo: get(SEARCH_PARAM_KEYS.priceTo),
    powerFromPs: get(SEARCH_PARAM_KEYS.powerFromPs),
    powerToPs: get(SEARCH_PARAM_KEYS.powerToPs),
    location: get(SEARCH_PARAM_KEYS.location),
    radiusKm: get(SEARCH_PARAM_KEYS.radiusKm),
    fuelTypes: getAll(SEARCH_PARAM_KEYS.fuelTypes),
  });

  return parsed.success ? parsed.data : {};
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
function toArray(value: string | string[] | undefined): string[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

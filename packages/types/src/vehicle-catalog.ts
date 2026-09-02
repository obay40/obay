import type { FuelType } from "./vehicle.js";

/**
 * Fahrzeugkatalog-DTOs + Fetch-Client. Framework-frei (kein Next.js-Import,
 * nur `fetch`), damit Web und eine künftige App (iOS/Android) dieselbe
 * Quelle nutzen – siehe docs/vehicle-data-sources.md.
 *
 * Die eigentlichen Daten (Hersteller/Modelle) leben in Postgres
 * (VehicleManufacturer/VehicleModel, @autoklick24/database) und werden
 * ausschließlich über die API (/api/v1/vehicle-manufacturers) ausgeliefert.
 * Dieses Package enthält bewusst KEINEN statischen Katalog mehr.
 */
export interface VehicleManufacturerDto {
  id: string;
  slug: string;
  name: string;
  isPopular: boolean;
  /** Alternative Schreibweisen (z. B. "VW"), damit die Suche sie ebenfalls findet. */
  aliases: string[];
}

export interface VehicleModelDto {
  id: string;
  slug: string;
  name: string;
  isPopular: boolean;
  /** Nicht mehr produziert, aber weiterhin gebraucht gehandelt – eigener UI-Abschnitt statt Löschung. */
  isHistoric: boolean;
  bodyTypes: string[];
  /** Alternative Schreibweisen (z. B. "1er" für "1 Series"), siehe VehicleManufacturerDto.aliases. */
  aliases: string[];
}

/** Filterkriterien der Fahrzeugsuche. UI-frei – von Startseiten-Suche und künftiger Detailsuche gleichermaßen nutzbar. */
export interface VehicleSearchFilters {
  makeSlug?: string;
  modelSlug?: string;
  yearFrom?: number;
  mileageTo?: number;
  priceTo?: number;
  location?: string;
  radiusKm?: number;
  fuelTypes?: FuelType[];
}

/**
 * `baseUrl` ist für eine künftige App gedacht (volle URL nötig); im
 * Next.js-Web-Client bleibt es leer, ein relativer Pfad genügt.
 */
export async function fetchVehicleManufacturers(
  baseUrl = "",
): Promise<VehicleManufacturerDto[]> {
  const response = await fetch(`${baseUrl}/api/v1/vehicle-manufacturers`);
  if (!response.ok) {
    throw new Error(`Fahrzeughersteller konnten nicht geladen werden (${response.status})`);
  }
  return (await response.json()) as VehicleManufacturerDto[];
}

export async function fetchVehicleModels(
  manufacturerSlug: string,
  baseUrl = "",
): Promise<VehicleModelDto[]> {
  const response = await fetch(
    `${baseUrl}/api/v1/vehicle-manufacturers/${encodeURIComponent(manufacturerSlug)}/models`,
  );
  if (!response.ok) {
    throw new Error(`Fahrzeugmodelle konnten nicht geladen werden (${response.status})`);
  }
  return (await response.json()) as VehicleModelDto[];
}

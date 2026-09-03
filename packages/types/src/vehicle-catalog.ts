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
  /**
   * Zugehörige Modellgruppe/Baureihe (z. B. BMW "3er Reihe", Mercedes-Benz
   * "C-Klasse"), falls der Hersteller eine Marke→Baureihe→Modell-Hierarchie
   * hat (siehe VehicleModelGroupDto). null bei Herstellern ohne
   * Gruppen-Hierarchie oder gruppenlosen Modellen (z. B. Mercedes-Benz
   * Sprinter).
   */
  groupSlug: string | null;
  groupName: string | null;
}

/** Modellgruppe/Baureihe zwischen Hersteller und Modell (z. B. BMW "3er Reihe (alle)"). */
export interface VehicleModelGroupDto {
  id: string;
  slug: string;
  name: string;
  isPopular: boolean;
}

/** Filterkriterien der Fahrzeugsuche. UI-frei – von Startseiten-Suche und künftiger Detailsuche gleichermaßen nutzbar. */
export interface VehicleSearchFilters {
  makeSlug?: string;
  /**
   * Optionale Modellgruppe/Baureihe (z. B. "3er-reihe"), unabhängig vom
   * konkreten Modell wählbar – "BMW 3er Reihe (alle)" muss ohne
   * modelSlug funktionieren (siehe VehicleModelGroupDto).
   */
  modelGroupSlug?: string;
  modelSlug?: string;
  yearFrom?: number;
  mileageTo?: number;
  priceFrom?: number;
  priceTo?: number;
  /**
   * Mindestleistung in PS. PS ist bewusst auch die interne Einheit:
   * das Projekt fuehrt an keiner Stelle kW, eine Umrechnung waere
   * also eine Fehlerquelle ohne Nutzen. Der URL-Parameter heisst
   * "powerFrom".
   */
  powerFromPs?: number;
  /** Hoechstleistung in PS, gleiche Einheit wie powerFromPs. */
  powerToPs?: number;
  location?: string;
  radiusKm?: number;
  fuelTypes?: FuelType[];
}

/**
 * Grenzwerte und Standardwert des Umkreis-Sliders (siehe RadiusSlider in
 * apps/web) - zentral hier definiert, damit UI, State-Default und
 * Validierungs-Schema (@autoklick24/validation) nicht auseinanderlaufen.
 * 0 km ist ein gueltiger, eigener Wert ("nur exakter Ort"), keine
 * Sonderbedeutung "kein Filter" - siehe radiusKm oben.
 */
export const VEHICLE_SEARCH_RADIUS_MIN_KM = 0;
export const VEHICLE_SEARCH_RADIUS_MAX_KM = 200;
export const VEHICLE_SEARCH_RADIUS_STEP_KM = 5;
export const VEHICLE_SEARCH_RADIUS_DEFAULT_KM = 50;

/**
 * Erkennt eine gültige deutsche PLZ (5 Ziffern) im Ort-/PLZ-Freitextfeld der
 * Fahrzeugsuche - als eigenständiger Wert ("50667") oder eingebettet vor/nach
 * einem Ortsnamen ("50667 Köln"). \b sorgt dafür, dass eine zu lange
 * Ziffernfolge (z. B. aus Versehen eine Telefonnummer) NICHT als Teiltreffer
 * durchgeht: eine 10-stellige Zahl hat innerhalb der Ziffernfolge keine
 * Wortgrenze, an der ein 5-stelliges Teilstück isoliert matchen könnte.
 *
 * Für freie Ortsnamen ohne PLZ gibt es bewusst (noch) keine Erkennung:
 * TODO: echten Geocoding-/Autocomplete-Provider anbinden (siehe
 * packages/providers), der Orte wie "Köln" gegen echte Geodaten auflöst.
 * Bis dahin gilt ein reiner Ortsname allein nicht als validiert - eine
 * Heuristik wie "mindestens 3 Buchstaben" wäre erfundene Ortsvalidierung
 * ohne echte Grundlage.
 *
 * Wird sowohl in @autoklick24/validation (Query-Parameter-Serialisierung)
 * als auch in apps/web (Sichtbarkeit des Umkreis-Reglers) verwendet, damit
 * beide Stellen exakt denselben Begriff von "gültiger Standort" haben.
 */
export function isValidGermanLocationInput(value: string): boolean {
  return /\b\d{5}\b/.test(value.trim());
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

/**
 * Modellgruppen/Baureihen eines Herstellers. Liefert ein leeres Array bei
 * Herstellern ohne Gruppen-Hierarchie (aktuell alle außer BMW/Mercedes-Benz)
 * – kein Fehlerfall, siehe VehicleModelGroupDto.
 */
export async function fetchVehicleModelGroups(
  manufacturerSlug: string,
  baseUrl = "",
): Promise<VehicleModelGroupDto[]> {
  const response = await fetch(
    `${baseUrl}/api/v1/vehicle-manufacturers/${encodeURIComponent(manufacturerSlug)}/model-groups`,
  );
  if (!response.ok) {
    throw new Error(`Modellgruppen konnten nicht geladen werden (${response.status})`);
  }
  return (await response.json()) as VehicleModelGroupDto[];
}

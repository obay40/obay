import type { VehicleValuation } from "@autoklick24/types";

/**
 * Minimale Fahrzeugdaten, die eine Bewertung benötigt. Wird ab Phase 3
 * (Fahrzeugerfassung) durch die echten Vehicle/VehicleSpecification-Felder
 * ersetzt bzw. erweitert.
 */
export interface VehicleValuationInput {
  make: string;
  model: string;
  firstRegistrationYear: number;
  mileageKm: number;
  fuelType: string;
  transmission?: string;
  powerKw?: number;
  /** Angebotspreis des Verkäufers in Cent, falls vorhanden (für priceRating). */
  askingPriceCents?: number;
}

/**
 * TODO(valuation): Austauschbar gegen MarketDataValuationProvider,
 * InternalValuationProvider oder ExternalApiValuationProvider, sobald
 * echte Marktdaten verfügbar sind. Kein Scraping fremder Plattformen.
 */
export interface ValuationProvider {
  readonly id: string;
  evaluateVehicle(vehicle: VehicleValuationInput): Promise<VehicleValuation>;
}

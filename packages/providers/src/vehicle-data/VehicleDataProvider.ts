export interface VehicleDataLookupResult {
  make: string;
  model: string;
  variant?: string;
  firstRegistrationYear: number;
  fuelType: string;
  transmission?: string;
  powerKw?: number;
  bodyType?: string;
  source: string;
}

/**
 * TODO(vehicle-data): Später an einen echten Anbieter anbinden (Kennzeichen-
 * Abfrage, VIN/FIN-Decoder oder HSN/TSN-Datenbank). Für V1 ausschließlich
 * über MockVehicleDataProvider, im UI klar als Demo/Vorschau kennzeichnen.
 */
export interface VehicleDataProvider {
  readonly id: string;
  lookupByVin(vin: string): Promise<VehicleDataLookupResult | null>;
  lookupByHsnTsn(hsn: string, tsn: string): Promise<VehicleDataLookupResult | null>;
}

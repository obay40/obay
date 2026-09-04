import type { VehicleDataLookupResult, VehicleDataProvider } from "./VehicleDataProvider";

/** Liefert stets ein klar erkennbares Demo-Ergebnis – niemals reale Fahrzeugdaten. */
export class MockVehicleDataProvider implements VehicleDataProvider {
  readonly id = "mock-v1";

  async lookupByVin(vin: string): Promise<VehicleDataLookupResult | null> {
    if (!vin || vin.length < 5) return null;
    return {
      make: "Demo-Marke",
      model: "Demo-Modell",
      variant: "Demo-Variante",
      firstRegistrationYear: new Date().getFullYear() - 3,
      fuelType: "PETROL",
      transmission: "AUTOMATIC",
      powerKw: 110,
      bodyType: "SEDAN",
      source: this.id,
    };
  }

  async lookupByHsnTsn(hsn: string, tsn: string): Promise<VehicleDataLookupResult | null> {
    if (!hsn || !tsn) return null;
    return {
      make: "Demo-Marke",
      model: "Demo-Modell",
      firstRegistrationYear: new Date().getFullYear() - 3,
      fuelType: "DIESEL",
      transmission: "MANUAL",
      source: this.id,
    };
  }
}

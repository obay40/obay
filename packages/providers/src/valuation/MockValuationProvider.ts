import { PriceRating, type VehicleValuation } from "@autoklick24/types";
import type { ValuationProvider, VehicleValuationInput } from "./ValuationProvider";

const CURRENT_YEAR = new Date().getFullYear();
const BASE_VALUE_CENTS = 12_000_00;
const YEARLY_DEPRECIATION = 0.09;
const MILEAGE_PENALTY_PER_KM_CENTS = 0.06;

/**
 * Rein deterministischer, transparenter Platzhalter-Algorithmus für die
 * Entwicklung/Demo. KEINE echten Marktdaten. Muss im UI klar als
 * Schätzung/Demo gekennzeichnet werden (siehe VehicleValuation.isEstimate).
 */
export class MockValuationProvider implements ValuationProvider {
  readonly id = "mock-v1";

  async evaluateVehicle(vehicle: VehicleValuationInput): Promise<VehicleValuation> {
    const ageYears = Math.max(0, CURRENT_YEAR - vehicle.firstRegistrationYear);
    const depreciationFactor = Math.pow(1 - YEARLY_DEPRECIATION, ageYears);
    const mileagePenaltyCents = vehicle.mileageKm * MILEAGE_PENALTY_PER_KM_CENTS;

    const estimatedMidCents = Math.max(
      50_000,
      Math.round(BASE_VALUE_CENTS * depreciationFactor - mileagePenaltyCents),
    );
    const spread = Math.round(estimatedMidCents * 0.08);

    const estimatedValueMinCents = estimatedMidCents - spread;
    const estimatedValueMaxCents = estimatedMidCents + spread;

    let priceRating: PriceRating | undefined;
    if (vehicle.askingPriceCents !== undefined) {
      priceRating = this.rateAskingPrice(vehicle.askingPriceCents, estimatedMidCents);
    }

    return {
      estimatedValueMinCents,
      estimatedValueMaxCents,
      currency: "EUR",
      priceRating,
      providerId: this.id,
      isEstimate: true,
      generatedAt: new Date().toISOString(),
    };
  }

  private rateAskingPrice(askingPriceCents: number, estimatedMidCents: number): PriceRating {
    const ratio = askingPriceCents / estimatedMidCents;
    if (ratio <= 0.92) return PriceRating.SEHR_GUTER_PREIS;
    if (ratio <= 0.98) return PriceRating.GUTER_PREIS;
    if (ratio <= 1.05) return PriceRating.FAIRER_PREIS;
    if (ratio <= 1.15) return PriceRating.ERHOEHTER_PREIS;
    return PriceRating.HOHER_PREIS;
  }
}

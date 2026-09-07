/**
 * Ergebnis einer Fahrzeugbewertung. IMMER als Schätzung/Spanne zu behandeln –
 * niemals als verbindlicher Wert darstellen (siehe packages/providers/valuation).
 */
export const PriceRating = {
  SEHR_GUTER_PREIS: "SEHR_GUTER_PREIS",
  GUTER_PREIS: "GUTER_PREIS",
  FAIRER_PREIS: "FAIRER_PREIS",
  ERHOEHTER_PREIS: "ERHOEHTER_PREIS",
  HOHER_PREIS: "HOHER_PREIS",
} as const;
export type PriceRating = (typeof PriceRating)[keyof typeof PriceRating];

export interface VehicleValuation {
  /** Geschätzte Marktwert-Spanne in Cent (Untergrenze). */
  estimatedValueMinCents: number;
  /** Geschätzte Marktwert-Spanne in Cent (Obergrenze). */
  estimatedValueMaxCents: number;
  currency: "EUR";
  /** Bewertung eines konkreten Angebotspreises relativ zur Marktspanne, falls vorhanden. */
  priceRating?: PriceRating;
  /** Name/Version des Providers, der die Bewertung erzeugt hat (z. B. "mock-v1"). */
  providerId: string;
  /** Kennzeichnet klar erkennbar, dass es sich um eine Schätzung/Demo handelt. */
  isEstimate: true;
  generatedAt: string;
}

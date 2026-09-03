import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { Container } from "@/components/ui/Container";
import { FuelType } from "@autoklick24/types";
import { parseVehicleSearchParams } from "@autoklick24/validation";
import {
  findManufacturerBySlug,
  findModelGroupBySlug,
  findModelBySlug,
  resolveDisplayName,
} from "@autoklick24/database";

export const metadata = { title: "Autos kaufen" };

const FUEL_LABELS: Record<FuelType, string> = {
  [FuelType.PETROL]: "Benzin",
  [FuelType.DIESEL]: "Diesel",
  [FuelType.ELECTRIC]: "Elektro",
  [FuelType.HYBRID]: "Hybrid",
  [FuelType.PLUGIN_HYBRID]: "Plug-in-Hybrid",
  [FuelType.LPG]: "Autogas (LPG)",
  [FuelType.CNG]: "Erdgas (CNG)",
  [FuelType.HYDROGEN]: "Wasserstoff",
  [FuelType.OTHER]: "Sonstige",
};

/**
 * Der eigentliche Fahrzeugmarktplatz (Suche, Filter, Sortierung, echte
 * Ergebnisse) entsteht erst in Phase 2, sobald Vehicle/Listing existieren.
 * Diese Seite liest aber bereits die von der Startseiten-Suche übergebenen
 * Filter aus der URL und bestätigt sie ehrlich – keine erfundenen
 * Suchergebnisse, aber auch kein Datenverlust zwischen Startseite und
 * dieser Route.
 */
export default async function VehicleMarketplacePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const rawParams = await searchParams;
  const filters = parseVehicleSearchParams(rawParams);

  const manufacturer = filters.makeSlug ? await findManufacturerBySlug(filters.makeSlug) : null;
  const modelGroup =
    filters.makeSlug && filters.modelGroupSlug
      ? await findModelGroupBySlug(filters.makeSlug, filters.modelGroupSlug)
      : null;
  const model =
    filters.makeSlug && filters.modelSlug
      ? await findModelBySlug(filters.makeSlug, filters.modelSlug)
      : null;

  const summary: string[] = [];
  if (manufacturer) summary.push(`Marke: ${resolveDisplayName(manufacturer)}`);
  // Baureihe wird auch ohne konkretes Modell angezeigt ("B-Klasse (alle)")
  // - die Suche umfasst dann alle Modelle dieser Baureihe (siehe
  // Aufgabenstellung, "ALLE muss funktionieren").
  if (modelGroup) summary.push(`Baureihe: ${resolveDisplayName(modelGroup)}`);
  if (model) summary.push(`Modell: ${resolveDisplayName(model)}`);
  if (filters.yearFrom) summary.push(`Erstzulassung ab ${filters.yearFrom}`);
  if (filters.mileageTo)
    summary.push(`Kilometerstand bis ${filters.mileageTo.toLocaleString("de-DE")} km`);
  if (filters.priceTo) summary.push(`Preis bis ${filters.priceTo.toLocaleString("de-DE")} €`);
  if (filters.powerFromPs) summary.push(`Leistung ab ${filters.powerFromPs} PS`);
  if (filters.location) summary.push(`Standort: ${filters.location}`);
  if (filters.radiusKm) summary.push(`Umkreis: ${filters.radiusKm} km`);
  if (filters.fuelTypes?.length) {
    summary.push(`Kraftstoff: ${filters.fuelTypes.map((fuel) => FUEL_LABELS[fuel]).join(", ")}`);
  }

  if (summary.length === 0) {
    return (
      <PagePlaceholder
        title="Autos kaufen"
        description="Der Fahrzeugmarktplatz mit Suche, Filtern und Sortierung entsteht in Phase 2."
        phase="Phase 2"
      />
    );
  }

  return (
    <Container className="py-24">
      <div className="mx-auto max-w-xl text-center">
        <span className="bg-brand-50 text-brand-700 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium">
          In Entwicklung – Phase 2
        </span>
        <h1 className="text-navy-900 mt-4 text-3xl font-bold">Autos kaufen</h1>
        <p className="text-navy-600 mt-3">
          Der automatisierte Fahrzeugmarktplatz mit echten Ergebnissen entsteht in Phase 2. Deine
          Suche wurde aber bereits übernommen:
        </p>
        <ul className="mt-6 inline-flex flex-col gap-1.5 text-left">
          {summary.map((line) => (
            <li key={line} className="bg-navy-50 text-navy-700 rounded-lg px-3 py-2 text-sm">
              {line}
            </li>
          ))}
        </ul>
      </div>
    </Container>
  );
}

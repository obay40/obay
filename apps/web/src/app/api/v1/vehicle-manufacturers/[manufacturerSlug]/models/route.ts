import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import {
  findManufacturerBySlug,
  listActiveModelsForManufacturerSlug,
  resolveDisplayName,
} from "@autoklick24/database";
import type { VehicleModelDto } from "@autoklick24/types";

/**
 * GET /api/v1/vehicle-manufacturers/:manufacturerSlug/models
 *
 * `manufacturerSlug` statt einer internen Datenbank-Id: der SEO-stabile
 * Slug ist der Identifier, den der Rest der App (Suchfilter, URLs) ohnehin
 * überall verwendet (siehe VehicleSearchFilters.makeSlug).
 *
 * Kein `export const revalidate` auf Modulebene, siehe Begründung in
 * .../vehicle-manufacturers/route.ts – stattdessen gecachte Datenbankzugriffe
 * über `unstable_cache`, damit die Route dynamisch bleibt (kein
 * Build-Zeit-Datenbankzugriff für 277 mögliche Hersteller-Slugs).
 */
const getCachedManufacturer = unstable_cache(
  (slug: string) => findManufacturerBySlug(slug),
  ["vehicle-manufacturer-by-slug"],
  { revalidate: 3600, tags: ["vehicle-manufacturers"] },
);

const getCachedModels = unstable_cache(
  (slug: string) => listActiveModelsForManufacturerSlug(slug),
  ["vehicle-models-by-manufacturer"],
  { revalidate: 3600, tags: ["vehicle-models"] },
);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ manufacturerSlug: string }> },
) {
  const { manufacturerSlug } = await params;

  const manufacturer = await getCachedManufacturer(manufacturerSlug);
  if (!manufacturer) {
    return NextResponse.json({ error: "Hersteller nicht gefunden" }, { status: 404 });
  }

  const models = await getCachedModels(manufacturerSlug);

  const dto: VehicleModelDto[] = models.map((model) => ({
    id: model.id,
    slug: model.slug,
    name: resolveDisplayName(model),
    isPopular: model.isPopular,
    isHistoric: model.isHistoric,
    bodyTypes: model.bodyTypes,
    aliases: model.aliases,
    groupSlug: model.groupSlug,
    groupName: model.groupName,
  }));

  return NextResponse.json(dto);
}

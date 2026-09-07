import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import {
  findManufacturerBySlug,
  listActiveModelGroupsForManufacturerSlug,
  resolveDisplayName,
} from "@autoklick24/database";
import type { VehicleModelGroupDto } from "@autoklick24/types";

/**
 * GET /api/v1/vehicle-manufacturers/:manufacturerSlug/model-groups
 *
 * Liefert die Modellgruppen/Baureihen eines Herstellers (Marke →
 * Modellgruppe → Modell, siehe docs/vehicle-data-sources.md). Aktuell nur
 * für BMW/Mercedes-Benz befüllt – bei allen anderen Herstellern liefert
 * dieser Endpunkt bewusst ein leeres Array (kein 404), damit die UI die
 * Baureihen-Auswahl einfach ausblendet statt einen Fehler zu behandeln.
 *
 * Gleiches Cache-Prinzip wie .../models/route.ts – siehe dort für die
 * Begründung gegen `export const revalidate`.
 */
const getCachedManufacturer = unstable_cache(
  (slug: string) => findManufacturerBySlug(slug),
  ["vehicle-manufacturer-by-slug"],
  { revalidate: 3600, tags: ["vehicle-manufacturers"] },
);

const getCachedModelGroups = unstable_cache(
  (slug: string) => listActiveModelGroupsForManufacturerSlug(slug),
  ["vehicle-model-groups-by-manufacturer"],
  { revalidate: 3600, tags: ["vehicle-model-groups"] },
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

  const groups = await getCachedModelGroups(manufacturerSlug);

  const dto: VehicleModelGroupDto[] = groups.map((group) => ({
    id: group.id,
    slug: group.slug,
    name: resolveDisplayName(group),
    isPopular: group.isPopular,
  }));

  return NextResponse.json(dto);
}

import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { listActiveManufacturers, resolveDisplayName } from "@autoklick24/database";
import type { VehicleManufacturerDto } from "@autoklick24/types";

/**
 * GET /api/v1/vehicle-manufacturers
 *
 * Liefert den vollständigen, in Autoklick24 nutzbaren Herstellerkatalog
 * (siehe docs/vehicle-data-sources.md). Wird sowohl von der Website
 * (MakeCombobox) als auch später von iOS/Android genutzt, daher ohne
 * Next.js-spezifische Filter-Parameter.
 *
 * Bewusst als dynamischer Route Handler (kein `export const revalidate` auf
 * Modulebene): das würde Next.js zwingen, die Route beim `next build`
 * statisch vorzurendern und dafür bereits im Build eine Datenbank zu
 * erreichen. Stattdessen cached `unstable_cache` das eigentliche
 * Datenbank-Ergebnis – ändert sich nur nach einem `pnpm vehicle-catalog:import`,
 * daher zeitbasiert statt bei jeder Dropdown-Interaktion neu aus der
 * Datenbank zu lesen.
 */
const getCachedManufacturers = unstable_cache(
  () => listActiveManufacturers(),
  ["vehicle-manufacturers"],
  { revalidate: 3600, tags: ["vehicle-manufacturers"] },
);

export async function GET() {
  const manufacturers = await getCachedManufacturers();

  const dto: VehicleManufacturerDto[] = manufacturers.map((manufacturer) => ({
    id: manufacturer.id,
    slug: manufacturer.slug,
    name: resolveDisplayName(manufacturer),
    isPopular: manufacturer.isPopular,
    aliases: manufacturer.aliases,
  }));

  return NextResponse.json(dto);
}

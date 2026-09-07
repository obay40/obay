import type { MetadataRoute } from "next";

const staticRoutes = [
  "",
  "/autos",
  "/auto-verkaufen",
  "/auto-vermitteln",
  "/auto-inserieren",
  "/haendler",
  "/impressum",
  "/datenschutz",
  "/agb",
  "/widerruf",
  "/cookies",
];

/**
 * Statische Sitemap für Phase 1. Sobald Fahrzeug-Detailseiten existieren
 * (Phase 2), wird diese Route um dynamisch generierte Listing-URLs erweitert.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const appUrl = process.env["APP_URL"] ?? "http://localhost:3000";
  return staticRoutes.map((route) => ({
    url: `${appUrl}${route}`,
    lastModified: new Date(),
  }));
}

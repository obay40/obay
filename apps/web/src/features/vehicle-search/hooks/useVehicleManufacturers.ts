"use client";

import { useEffect, useState } from "react";
import { fetchVehicleManufacturers, type VehicleManufacturerDto } from "@autoklick24/types";

/**
 * Lädt den vollständigen Herstellerkatalog einmal beim Mount von der API
 * (/api/v1/vehicle-manufacturers, serverseitig gecacht – siehe dort). Wird
 * in VehicleSearchCard einmal aufgerufen und als Props an MakeCombobox
 * sowie die "Beliebte Marken"-Pills weitergereicht, damit nicht zwei
 * unabhängige Komponenten denselben Request auslösen.
 */
export function useVehicleManufacturers() {
  const [manufacturers, setManufacturers] = useState<VehicleManufacturerDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchVehicleManufacturers()
      .then((result) => {
        if (!cancelled) setManufacturers(result);
      })
      .catch(() => {
        if (!cancelled) setError("Marken konnten nicht geladen werden.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { manufacturers, loading, error };
}

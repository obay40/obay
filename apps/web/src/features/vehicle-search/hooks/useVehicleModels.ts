"use client";

import { useEffect, useState } from "react";
import { fetchVehicleModels, type VehicleModelDto } from "@autoklick24/types";

/**
 * Lädt die Modelle eines Herstellers erst, wenn eine Marke gewählt wurde
 * (siehe Aufgabenstellung, Abschnitt PERFORMANCE: "Modelle erst laden
 * beziehungsweise filtern, wenn ein Hersteller gewählt wurde") – nicht den
 * kompletten Modellkatalog aller 277 Hersteller vorab laden.
 */
export function useVehicleModels(manufacturerSlug: string | undefined) {
  const [models, setModels] = useState<VehicleModelDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!manufacturerSlug) {
      setModels([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchVehicleModels(manufacturerSlug)
      .then((result) => {
        if (!cancelled) setModels(result);
      })
      .catch(() => {
        if (!cancelled) setModels([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [manufacturerSlug]);

  return { models, loading };
}

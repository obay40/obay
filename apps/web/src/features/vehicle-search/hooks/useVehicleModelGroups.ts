"use client";

import { useEffect, useState } from "react";
import { fetchVehicleModelGroups, type VehicleModelGroupDto } from "@autoklick24/types";

/**
 * Lädt die Modellgruppen/Baureihen eines Herstellers (Marke → Baureihe →
 * Modell, siehe docs/vehicle-data-sources.md) erst, wenn eine Marke gewählt
 * wurde – analog zu useVehicleModels. Liefert für Hersteller ohne
 * Gruppen-Hierarchie (aktuell alle außer BMW/Mercedes-Benz) ein leeres
 * Array; die UI blendet die Baureihen-Auswahl dann aus statt einen
 * Fehlerzustand zu zeigen (siehe ModelGroupCombobox).
 */
export function useVehicleModelGroups(manufacturerSlug: string | undefined) {
  const [groups, setGroups] = useState<VehicleModelGroupDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!manufacturerSlug) {
      setGroups([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchVehicleModelGroups(manufacturerSlug)
      .then((result) => {
        if (!cancelled) setGroups(result);
      })
      .catch(() => {
        if (!cancelled) setGroups([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [manufacturerSlug]);

  return { groups, loading };
}

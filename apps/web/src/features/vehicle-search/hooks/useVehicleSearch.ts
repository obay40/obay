"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { FuelType, VehicleSearchFilters } from "@autoklick24/types";
import { buildVehicleSearchParams } from "@autoklick24/validation";

/**
 * Hält den Zustand der Startseiten-Fahrzeugsuche und baut daraus eine
 * bookmarkbare URL zur Fahrzeugsuche. Bewusst getrennt von der Darstellung
 * (VehicleSearchCard) – Filtertypen/Serialisierung liegen zusätzlich in
 * @autoklick24/types und @autoklick24/validation und sind damit auch für
 * eine künftige App wiederverwendbar; nur dieser Hook selbst ist an
 * Next.js-Routing gebunden.
 */
export function useVehicleSearch(initialFilters: VehicleSearchFilters = {}) {
  const router = useRouter();
  const [filters, setFilters] = useState<VehicleSearchFilters>(initialFilters);

  const hasActiveFilters = useMemo(() => {
    return (Object.keys(filters) as (keyof VehicleSearchFilters)[]).some((key) => {
      const fieldValue = filters[key];
      return Array.isArray(fieldValue) ? fieldValue.length > 0 : fieldValue !== undefined;
    });
  }, [filters]);

  function setMake(makeSlug: string | undefined) {
    // Baureihe und Modell hängen von der Marke ab: ein Markenwechsel macht
    // eine zuvor gewählte Baureihe/ein Modell ungültig, daher werden sie
    // hier bewusst mit zurückgesetzt.
    setFilters((prev) => ({ ...prev, makeSlug, modelGroupSlug: undefined, modelSlug: undefined }));
  }

  function setModelGroup(modelGroupSlug: string | undefined) {
    // Modell hängt von der Baureihe ab: ein Baureihenwechsel macht ein
    // zuvor gewähltes Modell ungültig (siehe Aufgabenstellung, "Marke →
    // Baureihe → Modell").
    setFilters((prev) => ({ ...prev, modelGroupSlug, modelSlug: undefined }));
  }

  function setModel(modelSlug: string | undefined) {
    setFilters((prev) => ({ ...prev, modelSlug }));
  }

  function setYearFrom(yearFrom: number | "") {
    setFilters((prev) => ({ ...prev, yearFrom: yearFrom === "" ? undefined : yearFrom }));
  }

  function setMileageTo(mileageTo: number | "") {
    setFilters((prev) => ({ ...prev, mileageTo: mileageTo === "" ? undefined : mileageTo }));
  }

  function setPriceFrom(priceFrom: number | "") {
    setFilters((prev) => ({ ...prev, priceFrom: priceFrom === "" ? undefined : priceFrom }));
  }

  function setPriceTo(priceTo: number | "") {
    setFilters((prev) => ({ ...prev, priceTo: priceTo === "" ? undefined : priceTo }));
  }

  function setPowerFromPs(powerFromPs: number | "") {
    setFilters((prev) => ({ ...prev, powerFromPs: powerFromPs === "" ? undefined : powerFromPs }));
  }

  function setPowerToPs(powerToPs: number | "") {
    setFilters((prev) => ({ ...prev, powerToPs: powerToPs === "" ? undefined : powerToPs }));
  }

  function setRadiusKm(radiusKm: number | "") {
    setFilters((prev) => ({ ...prev, radiusKm: radiusKm === "" ? undefined : radiusKm }));
  }

  function setLocation(location: string) {
    setFilters((prev) => ({ ...prev, location: location.trim() ? location : undefined }));
  }

  function setFuelTypes(fuelTypes: FuelType[]) {
    setFilters((prev) => ({ ...prev, fuelTypes: fuelTypes.length ? fuelTypes : undefined }));
  }

  function reset() {
    setFilters({});
  }

  function submit(basePath = "/autos") {
    const query = buildVehicleSearchParams(filters).toString();
    router.push(query ? `${basePath}?${query}` : basePath);
  }

  return {
    filters,
    hasActiveFilters,
    setMake,
    setModelGroup,
    setModel,
    setYearFrom,
    setMileageTo,
    setPriceFrom,
    setPriceTo,
    setPowerFromPs,
    setPowerToPs,
    setRadiusKm,
    setLocation,
    setFuelTypes,
    reset,
    submit,
  };
}

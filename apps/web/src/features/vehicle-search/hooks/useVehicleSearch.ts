"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  convertKwToPowerDisplay,
  convertPowerToKw,
  DEFAULT_POWER_UNIT,
  isValidGermanLocationInput,
  VEHICLE_SEARCH_RADIUS_DEFAULT_KM,
  type FuelType,
  type PowerUnit,
  type VehicleSearchFilters,
} from "@autoklick24/types";
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
  // Der Umkreis-Regler hat immer einen Wert (Standard 50 km) - anders als
  // die übrigen, leer startenden Filter. ?? statt || : 0 km ist ein
  // gültiger eigener Wert ("nur exakter Ort") und darf den Standard nicht
  // auslösen.
  const [filters, setFilters] = useState<VehicleSearchFilters>(() => ({
    ...initialFilters,
    radiusKm: initialFilters.radiusKm ?? VEHICLE_SEARCH_RADIUS_DEFAULT_KM,
  }));
  // Nur die Anzeigeeinheit des Leistungsfilters - gespeichert wird immer in
  // kW (filters.powerFromKw/powerToKw), das Umschalten formatiert denselben
  // Wert nur neu (siehe convertKwToPowerDisplay) und aendert ihn nicht.
  // Startet immer bei PS, wird nicht in der URL persistiert (siehe
  // Aufgabenstellung Leistungsfilter, Abschnitt Query-Parameter).
  const [powerUnit, setPowerUnit] = useState<PowerUnit>(DEFAULT_POWER_UNIT);

  const hasActiveFilters = useMemo(() => {
    return (Object.keys(filters) as (keyof VehicleSearchFilters)[]).some((key) => {
      const fieldValue = filters[key];
      if (key === "radiusKm") {
        // Immer gesetzt (siehe oben) - zählt nur als aktiver Filter, wenn er
        // vom Standardwert abweicht, sonst wäre "Zurücksetzen" immer sichtbar.
        return fieldValue !== VEHICLE_SEARCH_RADIUS_DEFAULT_KM;
      }
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

  // Nimmt den Wert entgegen, WIE ER IM UI GERADE ANGEZEIGT WIRD (also in
  // powerUnit), rechnet ihn aber sofort in die interne Basiseinheit kW um -
  // gespeichert wird immer kW, nie PS (siehe VehicleSearchFilters.powerFromKw).
  // 0 ist beim Leistungsfilter kein sinnvoller Filter (anders als beim
  // Umkreis) und wird deshalb wie ein leeres Feld behandelt.
  function toPowerKwOrUndefined(displayValue: number | ""): number | undefined {
    if (displayValue === "") return undefined;
    const kw = convertPowerToKw(displayValue, powerUnit);
    return kw > 0 ? kw : undefined;
  }

  function setPowerFromDisplay(displayValue: number | "") {
    setFilters((prev) => ({ ...prev, powerFromKw: toPowerKwOrUndefined(displayValue) }));
  }

  function setPowerToDisplay(displayValue: number | "") {
    setFilters((prev) => ({ ...prev, powerToKw: toPowerKwOrUndefined(displayValue) }));
  }

  /** Formatiert einen gespeicherten kW-Wert für die aktuelle Anzeigeeinheit. */
  function toDisplay(kw: number | undefined): number | "" {
    return kw === undefined ? "" : convertKwToPowerDisplay(kw, powerUnit);
  }

  // Der Slider hat nie einen leeren Zustand (anders als die Zahlenfelder),
  // deshalb kein number|"" wie bei den übrigen Settern.
  function setRadiusKm(radiusKm: number) {
    setFilters((prev) => ({ ...prev, radiusKm }));
  }

  function setLocation(location: string) {
    const trimmed = location.trim();
    setFilters((prev) => ({
      ...prev,
      location: trimmed ? location : undefined,
      // Wird der Ort ungültig (oder gelöscht), geht der Umkreis intern
      // wieder auf den Standard zurück - kein "alter" Radius darf unbemerkt
      // aktiv bleiben, wenn später erneut ein gültiger Ort eingegeben wird
      // (siehe Aufgabenstellung Umkreis-Regler, Abschnitt "wenn Ort wieder
      // gelöscht wird"). Solange der Ort gültig bleibt, bleibt ein bereits
      // gewählter Radius unangetastet.
      radiusKm:
        trimmed && isValidGermanLocationInput(trimmed)
          ? prev.radiusKm
          : VEHICLE_SEARCH_RADIUS_DEFAULT_KM,
    }));
  }

  function setFuelTypes(fuelTypes: FuelType[]) {
    setFilters((prev) => ({ ...prev, fuelTypes: fuelTypes.length ? fuelTypes : undefined }));
  }

  function reset() {
    // Umkreis geht bewusst nicht auf undefined, sondern auf seinen
    // Standardwert zurück (siehe Aufgabenstellung Umkreis-Regler, Reset).
    setFilters({ radiusKm: VEHICLE_SEARCH_RADIUS_DEFAULT_KM });
    // Leistungswert leeren (bereits über filters oben) + Anzeigeeinheit
    // wieder auf PS (siehe Aufgabenstellung Leistungsfilter, Reset).
    setPowerUnit(DEFAULT_POWER_UNIT);
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
    // Leistung: powerUnit steuert nur die Anzeige, gespeichert wird immer kW.
    powerUnit,
    setPowerUnit,
    powerFromDisplay: toDisplay(filters.powerFromKw),
    powerToDisplay: toDisplay(filters.powerToKw),
    setPowerFromDisplay,
    setPowerToDisplay,
    setRadiusKm,
    setLocation,
    setFuelTypes,
    reset,
    submit,
  };
}

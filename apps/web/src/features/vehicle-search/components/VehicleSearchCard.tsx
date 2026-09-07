"use client";

import { useVehicleSearch } from "../hooks/useVehicleSearch";
import { useVehicleManufacturers } from "../hooks/useVehicleManufacturers";
import { useVehicleModelGroups } from "../hooks/useVehicleModelGroups";
import { buildYearOptions, buildMileageOptions } from "../lib/options";
import { MakeCombobox } from "./MakeCombobox";
import { ModelGroupCombobox } from "./ModelGroupCombobox";
import { ModelCombobox } from "./ModelCombobox";
import { SelectField } from "./SelectField";
import { NumberField } from "./NumberField";
import { LocationInput } from "./LocationInput";
import { RadiusSlider } from "./RadiusSlider";
import { PowerUnitToggle } from "./PowerUnitToggle";
import { FuelTypeChips } from "./FuelTypeChips";
import {
  isValidGermanLocationInput,
  VEHICLE_SEARCH_RADIUS_DEFAULT_KM,
  VEHICLE_SEARCH_RADIUS_MIN_KM,
  VEHICLE_SEARCH_RADIUS_MAX_KM,
  VEHICLE_SEARCH_RADIUS_STEP_KM,
} from "@autoklick24/types";

const YEAR_OPTIONS = buildYearOptions();
const MILEAGE_OPTIONS = buildMileageOptions();

const searchIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
    <path d="m20 20-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const filtersIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M4 6h16M7 12h10M10 18h4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function VehicleSearchCard() {
  const search = useVehicleSearch();
  const { manufacturers, loading: manufacturersLoading } = useVehicleManufacturers();
  const { groups: modelGroups, loading: modelGroupsLoading } = useVehicleModelGroups(
    search.filters.makeSlug,
  );
  const popularMakes = manufacturers.filter((manufacturer) => manufacturer.isPopular);
  // Slider erst bei erkanntem Standort (siehe isValidGermanLocationInput) -
  // nicht schon bei jeder Texteingabe. Aus filters.location abgeleitet statt
  // separat gespeichert, damit UI-Sichtbarkeit und Query-Gate (siehe
  // buildVehicleSearchParams) nie auseinanderlaufen können.
  const locationIsValid = isValidGermanLocationInput(search.filters.location ?? "");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    search.submit("/autos");
  }

  function handleAdvanced() {
    search.submit("/autos");
  }

  return (
    <div>
      <div className="border-navy-100 shadow-card mx-auto max-w-6xl rounded-2xl border bg-white p-6 sm:p-8">
        <h2 className="text-navy-900 text-2xl font-bold sm:text-[1.75rem]">
          Finde dein nächstes Auto
        </h2>
        <p className="text-navy-600 mt-1.5 text-sm sm:text-base">
          Durchsuche Fahrzeuge von Privatkunden, Händlern und Autoklick24.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MakeCombobox
              value={search.filters.makeSlug}
              onChange={search.setMake}
              manufacturers={manufacturers}
              loading={manufacturersLoading}
            />
            <ModelGroupCombobox
              makeSlug={search.filters.makeSlug}
              value={search.filters.modelGroupSlug}
              onChange={search.setModelGroup}
              groups={modelGroups}
              loading={modelGroupsLoading}
            />
            <ModelCombobox
              makeSlug={search.filters.makeSlug}
              modelGroupSlug={search.filters.modelGroupSlug}
              hasModelGroups={modelGroups.length > 0}
              value={search.filters.modelSlug}
              onChange={search.setModel}
            />
            <SelectField
              id="vehicle-search-year"
              label="Erstzulassung ab"
              value={search.filters.yearFrom ?? ""}
              onChange={search.setYearFrom}
              options={YEAR_OPTIONS}
              placeholder="Beliebig"
            />
          </div>

          {/*
            DOM-Reihenfolge = Mobile-Reihenfolge (Preis vor Kilometer, siehe
            Anforderung für Smartphones). Ab sm: wird per order-* auf die für
            Desktop gewünschte Reihenfolge (Kilometer vor Preis) umsortiert.
            Ort/PLZ ist jetzt eine eigene Zeile darunter (Umkreis erscheint
            rechts daneben statt in dieser Zeile), deshalb hier nur noch drei
            Felder - lg:grid-cols-3 füllt die Zeile ohne Lücke.
          */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <NumberField
              id="vehicle-search-price-from"
              label="Preis von"
              value={search.filters.priceFrom ?? ""}
              onChange={search.setPriceFrom}
              unit="€"
              max={100_000_000}
              className="sm:order-2"
            />
            <NumberField
              id="vehicle-search-price-to"
              label="Preis bis"
              value={search.filters.priceTo ?? ""}
              onChange={search.setPriceTo}
              unit="€"
              max={100_000_000}
              className="sm:order-3"
            />
            <SelectField
              id="vehicle-search-mileage"
              label="Kilometer bis"
              value={search.filters.mileageTo ?? ""}
              onChange={search.setMileageTo}
              options={MILEAGE_OPTIONS}
              placeholder="Beliebig"
              className="sm:order-1"
            />
          </div>

          {/*
            Ort/PLZ links, Umkreis rechts daneben - nicht untereinander (siehe
            Aufgabenstellung). Auf Mobile (< sm) untereinander, weil nicht
            genug Breite für einen brauchbaren Regler daneben wäre. Ort hat
            eine feste Breite (sm:basis-[45%]), damit er beim Ein-/Ausblenden
            des Reglers nicht springt - nur der Regler blendet dezent ein.
          */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <LocationInput
              value={search.filters.location ?? ""}
              onChange={search.setLocation}
              className="sm:shrink-0 sm:basis-[45%]"
            />
            {locationIsValid && (
              <RadiusSlider
                id="vehicle-search-radius"
                value={search.filters.radiusKm ?? VEHICLE_SEARCH_RADIUS_DEFAULT_KM}
                onChange={search.setRadiusKm}
                min={VEHICLE_SEARCH_RADIUS_MIN_KM}
                max={VEHICLE_SEARCH_RADIUS_MAX_KM}
                step={VEHICLE_SEARCH_RADIUS_STEP_KM}
                className="motion-safe:animate-[ak-fade-in_180ms_ease-out] sm:flex-1"
              />
            )}
          </div>

          {/*
            Letzte Filterzeile: Leistung ab/bis und die Kraftstoff-Chips
            teilen sich die vier Spalten. Der PS/kW-Umschalter sitzt direkt
            rechts neben "Leistung bis" (eigene Flex-Zeile innerhalb dieser
            Grid-Zelle) und gilt für beide Leistungsfelder gemeinsam - eine
            einzige Anzeigeeinheit statt zweier unabhängiger, siehe
            useVehicleSearch (powerUnit ist gemeinsamer State).
          */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <NumberField
              id="vehicle-search-power-from"
              label="Leistung ab"
              value={search.powerFromDisplay}
              onChange={search.setPowerFromDisplay}
              unit={search.powerUnit === "PS" ? "PS" : "kW"}
              max={10_000}
            />
            <div className="flex items-end gap-2">
              <NumberField
                id="vehicle-search-power-to"
                label="Leistung bis"
                value={search.powerToDisplay}
                onChange={search.setPowerToDisplay}
                unit={search.powerUnit === "PS" ? "PS" : "kW"}
                max={10_000}
                className="min-w-0 flex-1"
              />
              <PowerUnitToggle value={search.powerUnit} onChange={search.setPowerUnit} />
            </div>
            <FuelTypeChips
              value={search.filters.fuelTypes ?? []}
              onChange={search.setFuelTypes}
              className="items-center sm:col-span-2 lg:col-span-2"
            />
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleAdvanced}
                className="text-navy-700 hover:text-brand-600 inline-flex items-center gap-1.5 text-sm font-semibold"
              >
                {filtersIcon} Weitere Filter
              </button>
              {search.hasActiveFilters && (
                <button
                  type="button"
                  onClick={search.reset}
                  className="text-navy-500 hover:text-navy-700 text-sm font-medium"
                >
                  Zurücksetzen
                </button>
              )}
            </div>

            <button
              type="submit"
              className="bg-brand-500 shadow-card hover:bg-brand-600 inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-base font-semibold text-white transition-colors sm:w-auto"
            >
              {searchIcon} Fahrzeuge anzeigen
            </button>
          </div>
        </form>
      </div>

      <div className="mx-auto mt-6 max-w-6xl">
        <p className="text-navy-400 text-xs font-semibold uppercase tracking-wide">
          Beliebte Marken
        </p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {popularMakes.map((manufacturer) => (
            <button
              key={manufacturer.slug}
              type="button"
              onClick={() => search.setMake(manufacturer.slug)}
              aria-pressed={search.filters.makeSlug === manufacturer.slug}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                search.filters.makeSlug === manufacturer.slug
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-navy-200 text-navy-700 hover:border-navy-300 hover:bg-navy-50 bg-white"
              }`}
            >
              {manufacturer.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

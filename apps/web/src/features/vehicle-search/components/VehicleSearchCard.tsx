"use client";

import { useVehicleSearch } from "../hooks/useVehicleSearch";
import { useVehicleManufacturers } from "../hooks/useVehicleManufacturers";
import {
  buildYearOptions,
  buildMileageOptions,
  buildPriceOptions,
  buildRadiusOptions,
} from "../lib/options";
import { MakeCombobox } from "./MakeCombobox";
import { ModelCombobox } from "./ModelCombobox";
import { SelectField } from "./SelectField";
import { LocationInput } from "./LocationInput";
import { FuelTypeChips } from "./FuelTypeChips";

const YEAR_OPTIONS = buildYearOptions();
const MILEAGE_OPTIONS = buildMileageOptions();
const PRICE_OPTIONS = buildPriceOptions();
const RADIUS_OPTIONS = buildRadiusOptions();

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
  const popularMakes = manufacturers.filter((manufacturer) => manufacturer.isPopular);

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
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <MakeCombobox
              value={search.filters.makeSlug}
              onChange={search.setMake}
              manufacturers={manufacturers}
              loading={manufacturersLoading}
            />
            <ModelCombobox
              makeSlug={search.filters.makeSlug}
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
          */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SelectField
              id="vehicle-search-price"
              label="Preis bis"
              value={search.filters.priceTo ?? ""}
              onChange={search.setPriceTo}
              options={PRICE_OPTIONS}
              placeholder="Beliebig"
              className="sm:order-2"
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
            <LocationInput
              value={search.filters.location ?? ""}
              onChange={search.setLocation}
              className="sm:order-3"
            />
            <SelectField
              id="vehicle-search-radius"
              label="Umkreis"
              value={search.filters.radiusKm ?? ""}
              onChange={search.setRadiusKm}
              options={RADIUS_OPTIONS}
              placeholder="Bundesweit"
              className="sm:order-4"
            />
          </div>

          <FuelTypeChips value={search.filters.fuelTypes ?? []} onChange={search.setFuelTypes} />

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

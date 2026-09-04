"use client";

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

/**
 * Freitext für PLZ/Ort. Bewusst ohne Autocomplete-Anbindung (siehe
 * packages/providers – kein Fake-Geo-Service). Struktur lässt eine spätere
 * Anbindung eines echten Geo-/Autocomplete-Providers zu, ohne dass sich die
 * Filter-Schnittstelle (VehicleSearchFilters.location: string) ändern muss.
 */
export function LocationInput({ value, onChange, className = "" }: LocationInputProps) {
  return (
    <div
      className={`border-navy-200 hover:border-navy-300 focus-within:border-brand-500 focus-within:ring-brand-100 rounded-xl border bg-white transition-colors focus-within:ring-2 ${className}`}
    >
      <label
        htmlFor="vehicle-search-location"
        className="text-navy-500 pointer-events-none block px-3 pt-2 text-[11px] font-semibold uppercase tracking-wide"
      >
        PLZ oder Ort
      </label>
      <input
        id="vehicle-search-location"
        type="text"
        inputMode="text"
        autoComplete="postal-code"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="z. B. 50667 Köln"
        className="text-navy-900 placeholder:text-navy-400 w-full bg-transparent px-3 pb-2.5 pt-0.5 text-sm font-medium outline-none placeholder:font-normal"
      />
    </div>
  );
}

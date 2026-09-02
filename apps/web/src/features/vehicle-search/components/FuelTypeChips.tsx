"use client";

import { FuelType } from "@autoklick24/types";

const QUICK_FUEL_TYPES: { value: FuelType; label: string }[] = [
  { value: FuelType.PETROL, label: "Benzin" },
  { value: FuelType.DIESEL, label: "Diesel" },
  { value: FuelType.HYBRID, label: "Hybrid" },
  { value: FuelType.ELECTRIC, label: "Elektro" },
];

interface FuelTypeChipsProps {
  value: FuelType[];
  onChange: (value: FuelType[]) => void;
  className?: string;
}

export function FuelTypeChips({ value, onChange, className = "" }: FuelTypeChipsProps) {
  function toggle(fuel: FuelType) {
    onChange(value.includes(fuel) ? value.filter((f) => f !== fuel) : [...value, fuel]);
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`} role="group" aria-label="Kraftstoff">
      {QUICK_FUEL_TYPES.map((fuel) => {
        const active = value.includes(fuel.value);
        return (
          <button
            key={fuel.value}
            type="button"
            aria-pressed={active}
            onClick={() => toggle(fuel.value)}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
              active
                ? "border-brand-500 bg-brand-500 text-white"
                : "border-navy-200 text-navy-700 hover:border-navy-300 hover:bg-navy-50 bg-white"
            }`}
          >
            {fuel.label}
          </button>
        );
      })}
    </div>
  );
}

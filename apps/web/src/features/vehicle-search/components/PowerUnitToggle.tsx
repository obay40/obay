"use client";

import type { PowerUnit } from "@autoklick24/types";

interface PowerUnitToggleProps {
  value: PowerUnit;
  onChange: (unit: PowerUnit) => void;
  className?: string;
}

const UNITS: { value: PowerUnit; label: string }[] = [
  { value: "PS", label: "PS" },
  { value: "KW", label: "kW" },
];

/**
 * Kompakter Segmented Control zum Umschalten der Leistungs-Anzeigeeinheit.
 * Steuert nur die ANZEIGE - der gespeicherte Wert bleibt immer in kW (siehe
 * useVehicleSearch.setPowerFromDisplay/setPowerToDisplay), hier wird nur
 * `value`/`onChange` für die aktuell gewählte Einheit durchgereicht.
 *
 * aria-pressed markiert die aktive Einheit für Screenreader; beide Buttons
 * sind normale, per Tastatur fokussierbare <button>-Elemente.
 */
export function PowerUnitToggle({ value, onChange, className = "" }: PowerUnitToggleProps) {
  return (
    <div
      role="group"
      aria-label="Leistungseinheit"
      className={`border-navy-200 inline-flex shrink-0 items-stretch overflow-hidden rounded-xl border bg-white ${className}`}
    >
      {UNITS.map((unit, index) => {
        const active = value === unit.value;
        return (
          <button
            key={unit.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(unit.value)}
            className={`px-3 text-sm font-semibold transition-colors ${
              active ? "bg-brand-500 text-white" : "text-navy-600 hover:bg-navy-50"
            } ${index > 0 ? "border-navy-200 border-l" : ""}`}
          >
            {unit.label}
          </button>
        );
      })}
    </div>
  );
}

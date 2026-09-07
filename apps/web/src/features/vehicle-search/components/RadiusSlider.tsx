"use client";

interface RadiusSliderProps {
  id: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  className?: string;
}

/**
 * Umkreis-Regler für die Ortssuche. Bewusst kein eigenes Slider-Widget -
 * ein natives <input type="range"> reicht mit etwas CSS (.ak-range in
 * globals.css) völlig aus und liefert Tastaturbedienung (Pfeiltasten),
 * mobile Touch-Bedienung und Screenreader-Semantik ohne Zusatzaufwand.
 *
 * 0 km ist ein eigener, gültiger Wert ("nur exakter Ort/PLZ-Bereich", nicht
 * "kein Filter" - siehe VehicleSearchFilters.radiusKm) und wird deshalb in
 * Anzeige und aria-valuetext eigens benannt, nicht einfach als "0 km".
 */
export function RadiusSlider({
  id,
  value,
  onChange,
  min,
  max,
  step,
  className = "",
}: RadiusSliderProps) {
  const percent = ((value - min) / (max - min)) * 100;
  const valueLabel = value === 0 ? "0 km · nur exakter Ort" : `${value} km`;
  const valueText = value === 0 ? "0 Kilometer, nur exakter Ort" : `${value} Kilometer`;

  return (
    <div className={`border-navy-200 rounded-xl border bg-white px-3 pb-3.5 pt-2 ${className}`}>
      <div className="flex items-baseline justify-between gap-2">
        <label
          htmlFor={id}
          className="text-navy-500 text-[11px] font-semibold uppercase tracking-wide"
        >
          Umkreis
        </label>
        <span className="text-navy-900 whitespace-nowrap text-sm font-semibold tabular-nums">
          {valueLabel}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label="Umkreis"
        aria-valuetext={valueText}
        className="ak-range mt-2.5 w-full"
        style={{ "--ak-range-progress": `${percent}%` } as React.CSSProperties}
      />
    </div>
  );
}

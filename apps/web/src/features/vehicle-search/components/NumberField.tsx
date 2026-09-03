"use client";

interface NumberFieldProps {
  id: string;
  label: string;
  /** Leer = Filter inaktiv. Bewusst kein Vorgabewert. */
  value: number | "";
  onChange: (value: number | "") => void;
  /** Sichtbare Einheit im Feld, z. B. "€" oder "PS". */
  unit: string;
  placeholder?: string;
  max?: number;
  className?: string;
}

/**
 * Freie Zahleneingabe für Filter ohne feste Stufen (Preis, Leistung).
 *
 * Optisch identisch zum SelectField (Label oben, Wert darunter), technisch
 * ein natives <input type="number">: dadurch blendet iOS/Android von selbst
 * die numerische Tastatur ein (zusätzlich inputMode="numeric") und die
 * Browser-Validierung greift.
 *
 * Negative Werte sind doppelt ausgeschlossen: min={0} im Markup und eine
 * Prüfung im onChange - Browser lassen ein führendes "-" je nach Plattform
 * durchaus zu.
 */
export function NumberField({
  id,
  label,
  value,
  onChange,
  unit,
  placeholder = "Beliebig",
  max,
  className = "",
}: NumberFieldProps) {
  return (
    <div className={className}>
      <div className="border-navy-200 hover:border-navy-300 focus-within:border-brand-500 focus-within:ring-brand-100 relative rounded-xl border bg-white transition-colors focus-within:ring-2">
        {/*
          Bewusst OHNE pointer-events-none (anders als im SelectField, wo das
          <select> ohnehin die ganze Flaeche abdeckt): so fokussiert ein Tipp
          auf das Label das Eingabefeld. Die Touch-Flaeche ist dadurch das
          ganze Feld (~59px) statt nur der 32px hohe Input.
        */}
        <label
          htmlFor={id}
          className="text-navy-500 block cursor-text px-3 pt-2 text-[11px] font-semibold uppercase tracking-wide"
        >
          {label}
        </label>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={0}
          max={max}
          step={1}
          value={value}
          placeholder={placeholder}
          onChange={(event) => {
            const raw = event.target.value;
            if (raw === "") {
              onChange("");
              return;
            }
            const parsed = Number(raw);
            // NaN und negative Werte verwerfen statt sie zu uebernehmen.
            if (!Number.isFinite(parsed) || parsed < 0) return;
            onChange(Math.floor(parsed));
          }}
          className="text-navy-900 placeholder:text-navy-400 w-full appearance-none bg-transparent py-0.5 pb-2.5 pl-3 pr-12 text-sm font-medium outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <span
          aria-hidden="true"
          className="text-navy-500 pointer-events-none absolute bottom-2.5 right-3 text-sm font-semibold"
        >
          {unit}
        </span>
      </div>
    </div>
  );
}

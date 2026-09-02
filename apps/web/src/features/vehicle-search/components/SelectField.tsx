"use client";

import type { SelectOption } from "../lib/options";

interface SelectFieldProps {
  id: string;
  label: string;
  value: number | "";
  onChange: (value: number | "") => void;
  options: SelectOption[];
  placeholder: string;
  disabled?: boolean;
  disabledHint?: string;
  error?: string;
  className?: string;
}

/**
 * Wirkt wie ein eigenständiges, hochwertiges Form-Control (Label oben, Wert
 * darunter, Chevron), ist technisch aber ein natives <select> – dadurch
 * funktionieren Tastaturbedienung, Screenreader und mobile Picker ohne
 * zusätzlichen Aufwand, ohne dass wir eine UI-Library einführen müssen.
 */
export function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled,
  disabledHint,
  error,
  className = "",
}: SelectFieldProps) {
  return (
    <div className={className}>
      <div
        className={`group relative rounded-xl border bg-white transition-colors ${
          error
            ? "border-red-400"
            : "border-navy-200 hover:border-navy-300 focus-within:border-brand-500 focus-within:ring-brand-100 focus-within:ring-2"
        } ${disabled ? "bg-navy-50/60 opacity-70" : ""}`}
      >
        <label
          htmlFor={id}
          className="text-navy-500 pointer-events-none block px-3 pt-2 text-[11px] font-semibold uppercase tracking-wide"
        >
          {label}
        </label>
        <select
          id={id}
          value={value}
          disabled={disabled}
          onChange={(event) => {
            const raw = event.target.value;
            onChange(raw === "" ? "" : Number(raw));
          }}
          className="text-navy-900 w-full cursor-pointer appearance-none bg-transparent px-3 pb-2.5 pt-0.5 text-sm font-medium outline-none disabled:cursor-not-allowed"
          aria-describedby={disabled && disabledHint ? `${id}-hint` : undefined}
        >
          <option value="">{disabled && disabledHint ? disabledHint : placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="text-navy-400 pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 transition-transform group-focus-within:rotate-180"
        >
          <path
            d="m6 9 6 6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {disabled && disabledHint && (
        <p id={`${id}-hint`} className="sr-only">
          {disabledHint}
        </p>
      )}
    </div>
  );
}

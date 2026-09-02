"use client";

import { VEHICLE_MAKES } from "@autoklick24/types";
import { Combobox } from "./Combobox";

interface MakeComboboxProps {
  value: string | undefined;
  onChange: (slug: string | undefined) => void;
  className?: string;
}

export function MakeCombobox({ value, onChange, className }: MakeComboboxProps) {
  return (
    <Combobox
      id="vehicle-search-make"
      label="Marke"
      value={value}
      onChange={onChange}
      items={VEHICLE_MAKES}
      placeholder="Alle Marken"
      searchPlaceholder="Marke suchen"
      popularLabel="Beliebte Marken"
      allLabel="Alle Marken"
      emptyStateText="Keine Marke gefunden"
      className={className}
    />
  );
}

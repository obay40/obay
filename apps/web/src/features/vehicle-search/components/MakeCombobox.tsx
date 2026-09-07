"use client";

import type { VehicleManufacturerDto } from "@autoklick24/types";
import { Combobox } from "./Combobox";

interface MakeComboboxProps {
  value: string | undefined;
  onChange: (slug: string | undefined) => void;
  manufacturers: VehicleManufacturerDto[];
  loading?: boolean;
  className?: string;
}

export function MakeCombobox({
  value,
  onChange,
  manufacturers,
  loading,
  className,
}: MakeComboboxProps) {
  return (
    <Combobox
      id="vehicle-search-make"
      label="Marke"
      value={value}
      onChange={onChange}
      items={manufacturers}
      placeholder="Alle Marken"
      searchPlaceholder="Marke suchen"
      popularLabel="Beliebte Marken"
      allLabel="Alle Marken"
      emptyStateText="Keine Marke gefunden"
      loading={loading}
      groupAlphabetically
      className={className}
    />
  );
}

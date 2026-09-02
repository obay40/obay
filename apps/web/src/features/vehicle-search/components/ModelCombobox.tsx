"use client";

import { useVehicleModels } from "../hooks/useVehicleModels";
import { Combobox } from "./Combobox";

interface ModelComboboxProps {
  makeSlug: string | undefined;
  value: string | undefined;
  onChange: (slug: string | undefined) => void;
  className?: string;
}

export function ModelCombobox({ makeSlug, value, onChange, className }: ModelComboboxProps) {
  const { models, loading } = useVehicleModels(makeSlug);

  return (
    <Combobox
      id="vehicle-search-model"
      label="Modell"
      value={value}
      onChange={onChange}
      items={models}
      placeholder="Alle Modelle"
      searchPlaceholder="Modell suchen"
      popularLabel="Beliebt"
      allLabel="Alle Modelle"
      emptyStateText="Keine Modelle gefunden"
      disabled={!makeSlug}
      disabledHint="Zuerst Marke wählen"
      loading={loading}
      className={className}
    />
  );
}

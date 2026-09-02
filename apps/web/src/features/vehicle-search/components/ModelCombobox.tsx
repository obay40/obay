"use client";

import { findMakeBySlug } from "@autoklick24/types";
import { Combobox } from "./Combobox";

interface ModelComboboxProps {
  makeSlug: string | undefined;
  value: string | undefined;
  onChange: (slug: string | undefined) => void;
  className?: string;
}

export function ModelCombobox({ makeSlug, value, onChange, className }: ModelComboboxProps) {
  const make = makeSlug ? findMakeBySlug(makeSlug) : undefined;

  return (
    <Combobox
      id="vehicle-search-model"
      label="Modell"
      value={value}
      onChange={onChange}
      items={make?.models ?? []}
      placeholder="Alle Modelle"
      searchPlaceholder="Modell suchen"
      popularLabel="Beliebt"
      allLabel="Alle Modelle"
      emptyStateText="Keine Modelle gefunden"
      disabled={!make}
      disabledHint="Zuerst Marke wählen"
      className={className}
    />
  );
}

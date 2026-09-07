"use client";

import type { VehicleModelGroupDto } from "@autoklick24/types";
import { Combobox } from "./Combobox";

interface ModelGroupComboboxProps {
  makeSlug: string | undefined;
  value: string | undefined;
  onChange: (slug: string | undefined) => void;
  groups: VehicleModelGroupDto[];
  loading?: boolean;
  className?: string;
}

/**
 * Dritte Ebene der Fahrzeugsuche: Marke → Baureihe/Modellgruppe → Modell
 * (siehe docs/vehicle-data-sources.md). Bewusst generisch – nicht auf
 * BMW/Mercedes-Benz zugeschnitten: `groups` kommt aus useVehicleModelGroups
 * und ist bei Herstellern ohne Gruppen-Hierarchie einfach leer, das Feld
 * bleibt dann inaktiv statt einen Fehler zu zeigen. So kann jeder künftige
 * Hersteller mit Gruppen (Audi, Volkswagen, …) dieselbe UI ohne
 * Codeänderung nutzen. `groups` wird zentral in VehicleSearchCard geladen
 * (nicht hier), damit ModelCombobox denselben Datenstand für die
 * "Baureihe zuerst wählen"-Sperre kennt, ohne einen zweiten Request
 * auszulösen.
 */
export function ModelGroupCombobox({
  makeSlug,
  value,
  onChange,
  groups,
  loading,
  className,
}: ModelGroupComboboxProps) {
  const hasGroups = groups.length > 0;

  return (
    <Combobox
      id="vehicle-search-model-group"
      label="Baureihe"
      value={value}
      onChange={onChange}
      items={groups}
      placeholder="Alle Baureihen"
      searchPlaceholder="Baureihe suchen"
      popularLabel="Beliebt"
      allLabel="Alle Baureihen"
      emptyStateText="Keine Baureihe gefunden"
      disabled={!makeSlug || (!loading && !hasGroups)}
      disabledHint={!makeSlug ? "Zuerst Marke wählen" : "Keine Baureihen für diese Marke"}
      loading={loading}
      className={className}
    />
  );
}

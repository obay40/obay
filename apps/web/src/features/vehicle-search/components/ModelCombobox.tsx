"use client";

import { useMemo } from "react";
import { useVehicleModels } from "../hooks/useVehicleModels";
import { Combobox } from "./Combobox";

interface ModelComboboxProps {
  makeSlug: string | undefined;
  /** Gewählte Baureihe (siehe ModelGroupCombobox), falls der Hersteller eine Gruppen-Hierarchie hat. */
  modelGroupSlug: string | undefined;
  /**
   * Ob die aktuell gewählte Marke überhaupt Modellgruppen hat (siehe
   * VehicleSearchCard, dieselbe Liste wie ModelGroupCombobox). Nur dann
   * bleibt dieses Feld gesperrt, bis eine Baureihe gewählt wurde – bei
   * Herstellern ohne Gruppen (die meisten) verhält sich das Feld wie zuvor.
   */
  hasModelGroups: boolean;
  value: string | undefined;
  onChange: (slug: string | undefined) => void;
  className?: string;
}

export function ModelCombobox({
  makeSlug,
  modelGroupSlug,
  hasModelGroups,
  value,
  onChange,
  className,
}: ModelComboboxProps) {
  const { models, loading } = useVehicleModels(makeSlug);

  // Bei Herstellern mit Baureihen (z. B. BMW/Mercedes-Benz) nur die Modelle
  // der gewählten Baureihe zeigen - sonst würde die Gruppierung ihren Zweck
  // verfehlen (siehe Aufgabenstellung: "nicht einfach alle Modelle flach in
  // ein einziges Dropdown schreiben").
  const visibleModels = useMemo(
    () => (modelGroupSlug ? models.filter((model) => model.groupSlug === modelGroupSlug) : models),
    [models, modelGroupSlug],
  );

  const waitingForModelGroup = hasModelGroups && !modelGroupSlug;

  return (
    <Combobox
      id="vehicle-search-model"
      label="Modell"
      value={value}
      onChange={onChange}
      items={visibleModels}
      placeholder="Alle Modelle"
      searchPlaceholder="Modell suchen"
      popularLabel="Beliebt"
      allLabel="Alle Modelle"
      historicLabel="Weitere / historische Modelle"
      emptyStateText="Keine Modelle gefunden"
      disabled={!makeSlug || waitingForModelGroup}
      disabledHint={!makeSlug ? "Zuerst Marke wählen" : "Zuerst Baureihe wählen"}
      loading={loading}
      className={className}
    />
  );
}

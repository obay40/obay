export interface SelectOption {
  value: number;
  label: string;
}

/** Erstzulassung ab: aktuelles Jahr rückwärts. Bewusst zur Laufzeit erzeugt statt hart im JSX. */
export function buildYearOptions(fromYear = new Date().getFullYear()): SelectOption[] {
  const options: SelectOption[] = [];
  for (let year = fromYear; year >= 2000; year--) {
    options.push({ value: year, label: String(year) });
  }
  return options;
}

const MILEAGE_STEPS_KM = [
  10_000, 20_000, 30_000, 50_000, 75_000, 100_000, 125_000, 150_000, 200_000,
];

export function buildMileageOptions(): SelectOption[] {
  return MILEAGE_STEPS_KM.map((km) => ({ value: km, label: formatKm(km) }));
}

const RADIUS_STEPS_KM = [10, 20, 50, 100, 200];

export function buildRadiusOptions(): SelectOption[] {
  return [
    ...RADIUS_STEPS_KM.map((km) => ({ value: km, label: `${km} km` })),
    { value: 0, label: "Bundesweit" },
  ];
}

export function formatKm(value: number): string {
  return `${value.toLocaleString("de-DE")} km`;
}

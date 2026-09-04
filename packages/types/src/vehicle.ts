export const FuelType = {
  PETROL: "PETROL",
  DIESEL: "DIESEL",
  ELECTRIC: "ELECTRIC",
  HYBRID: "HYBRID",
  PLUGIN_HYBRID: "PLUGIN_HYBRID",
  LPG: "LPG",
  CNG: "CNG",
  HYDROGEN: "HYDROGEN",
  OTHER: "OTHER",
} as const;
export type FuelType = (typeof FuelType)[keyof typeof FuelType];

export const TransmissionType = {
  MANUAL: "MANUAL",
  AUTOMATIC: "AUTOMATIC",
  SEMI_AUTOMATIC: "SEMI_AUTOMATIC",
} as const;
export type TransmissionType = (typeof TransmissionType)[keyof typeof TransmissionType];

export const BodyType = {
  SEDAN: "SEDAN",
  ESTATE: "ESTATE",
  HATCHBACK: "HATCHBACK",
  SUV: "SUV",
  COUPE: "COUPE",
  CONVERTIBLE: "CONVERTIBLE",
  VAN: "VAN",
  PICKUP: "PICKUP",
  MINIBUS: "MINIBUS",
  OTHER: "OTHER",
} as const;
export type BodyType = (typeof BodyType)[keyof typeof BodyType];

export const VehicleImageCategory = {
  FRONT: "FRONT",
  REAR: "REAR",
  DRIVER_SIDE: "DRIVER_SIDE",
  PASSENGER_SIDE: "PASSENGER_SIDE",
  INTERIOR: "INTERIOR",
  COCKPIT: "COCKPIT",
  ODOMETER: "ODOMETER",
  WHEELS: "WHEELS",
  DAMAGE: "DAMAGE",
  OTHER: "OTHER",
} as const;
export type VehicleImageCategory = (typeof VehicleImageCategory)[keyof typeof VehicleImageCategory];

/** Kanonische Liste der Mindest-Pflichtbilder für Schritt 5 des Verkaufs-Wizards. */
export const REQUIRED_VEHICLE_IMAGE_CATEGORIES: VehicleImageCategory[] = [
  VehicleImageCategory.FRONT,
  VehicleImageCategory.REAR,
  VehicleImageCategory.DRIVER_SIDE,
  VehicleImageCategory.PASSENGER_SIDE,
  VehicleImageCategory.INTERIOR,
  VehicleImageCategory.COCKPIT,
  VehicleImageCategory.ODOMETER,
];

/** Flexibler Ausstattungskatalog statt starrer Boolean-Spalten. */
export const EquipmentCategory = {
  COMFORT: "COMFORT",
  SAFETY: "SAFETY",
  INFOTAINMENT: "INFOTAINMENT",
  EXTERIOR: "EXTERIOR",
  ASSISTANCE: "ASSISTANCE",
} as const;
export type EquipmentCategory = (typeof EquipmentCategory)[keyof typeof EquipmentCategory];

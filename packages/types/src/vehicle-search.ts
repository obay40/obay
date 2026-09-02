import type { FuelType } from "./vehicle.js";

/**
 * Marken-/Modellkatalog für die Fahrzeugsuche. Framework-frei (kein
 * Next.js-Import), damit Web und eine künftige App dieselbe Quelle nutzen.
 *
 * TODO(vehicle-data): Dies ist ein kuratierter Startkatalog für die
 * Entwicklung, KEINE vollständige oder live gepflegte Fahrzeugdatenbank.
 * Sobald ein echter Fahrzeugdaten-Provider angebunden ist (siehe
 * packages/providers), wird dieser Katalog durch eine API-/DB-Abfrage
 * ersetzt – die Typen bleiben dabei stabil.
 */
export interface VehicleModel {
  id: string;
  slug: string;
  name: string;
  popular?: boolean;
}

export interface VehicleMake {
  id: string;
  slug: string;
  name: string;
  popular?: boolean;
  models: VehicleModel[];
}

/** Filterkriterien der Fahrzeugsuche. UI-frei – von Startseiten-Suche und künftiger Detailsuche gleichermaßen nutzbar. */
export interface VehicleSearchFilters {
  makeSlug?: string;
  modelSlug?: string;
  yearFrom?: number;
  mileageTo?: number;
  priceTo?: number;
  location?: string;
  radiusKm?: number;
  fuelTypes?: FuelType[];
}

function model(name: string, popular = false): VehicleModel {
  return { id: name, slug: slugify(name), name, popular };
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function make(name: string, models: VehicleModel[], popular = false): VehicleMake {
  return { id: name, slug: slugify(name), name, popular, models };
}

export const VEHICLE_MAKES: VehicleMake[] = [
  make(
    "BMW",
    [
      model("1er"),
      model("2er"),
      model("3er", true),
      model("4er"),
      model("5er", true),
      model("6er"),
      model("7er"),
      model("8er"),
      model("X1"),
      model("X2"),
      model("X3", true),
      model("X4"),
      model("X5", true),
      model("X6"),
      model("X7"),
      model("i3"),
      model("i4"),
      model("i5"),
      model("i7"),
      model("iX"),
      model("Z4"),
    ],
    true,
  ),
  make(
    "Mercedes-Benz",
    [
      model("A-Klasse"),
      model("B-Klasse"),
      model("C-Klasse", true),
      model("E-Klasse", true),
      model("S-Klasse"),
      model("CLA"),
      model("CLS"),
      model("GLA"),
      model("GLB"),
      model("GLC", true),
      model("GLE"),
      model("GLS"),
      model("EQA"),
      model("EQB"),
      model("EQC"),
      model("EQE"),
      model("EQS"),
      model("Sprinter"),
      model("Vito"),
    ],
    true,
  ),
  make(
    "Audi",
    [
      model("A1"),
      model("A3", true),
      model("A4", true),
      model("A5"),
      model("A6"),
      model("A7"),
      model("A8"),
      model("Q2"),
      model("Q3", true),
      model("Q5", true),
      model("Q7"),
      model("Q8"),
      model("e-tron"),
      model("e-tron GT"),
      model("TT"),
      model("R8"),
    ],
    true,
  ),
  make(
    "Volkswagen",
    [
      model("Polo", true),
      model("Golf", true),
      model("Passat"),
      model("Arteon"),
      model("T-Cross"),
      model("T-Roc", true),
      model("Tiguan", true),
      model("Touareg"),
      model("Touran"),
      model("Sharan"),
      model("Caddy"),
      model("Multivan"),
      model("Transporter"),
      model("ID.3"),
      model("ID.4"),
      model("ID.5"),
      model("ID.7"),
    ],
    true,
  ),
  make(
    "Porsche",
    [
      model("911", true),
      model("718 Boxster/Cayman"),
      model("Panamera"),
      model("Macan", true),
      model("Cayenne", true),
      model("Taycan"),
    ],
    true,
  ),
  make(
    "Škoda",
    [
      model("Fabia"),
      model("Scala"),
      model("Octavia", true),
      model("Superb"),
      model("Kamiq"),
      model("Karoq", true),
      model("Kodiaq", true),
      model("Enyaq"),
    ],
    true,
  ),
  make("Opel", [
    model("Corsa", true),
    model("Astra", true),
    model("Insignia"),
    model("Mokka"),
    model("Crossland"),
    model("Grandland", true),
    model("Zafira"),
  ]),
  make("Ford", [
    model("Fiesta", true),
    model("Focus", true),
    model("Mondeo"),
    model("Puma"),
    model("Kuga", true),
    model("EcoSport"),
    model("Explorer"),
    model("Mustang"),
    model("Mustang Mach-E"),
    model("Transit"),
  ]),
  make("Renault", [
    model("Clio", true),
    model("Captur", true),
    model("Megane"),
    model("Kadjar"),
    model("Austral"),
    model("Scenic"),
    model("Twingo"),
    model("Zoe"),
  ]),
  make("Seat", [
    model("Ibiza", true),
    model("Leon", true),
    model("Arona"),
    model("Ateca"),
    model("Tarraco"),
  ]),
  make("Volvo", [
    model("V40"),
    model("V60"),
    model("V90"),
    model("S60"),
    model("S90"),
    model("XC40", true),
    model("XC60", true),
    model("XC90"),
    model("EX30"),
  ]),
  make("Toyota", [
    model("Yaris", true),
    model("Corolla", true),
    model("Camry"),
    model("C-HR"),
    model("RAV4", true),
    model("Highlander"),
    model("Aygo X"),
    model("Prius"),
    model("bZ4X"),
  ]),
  make("Hyundai", [
    model("i10"),
    model("i20", true),
    model("i30", true),
    model("Kona", true),
    model("Tucson", true),
    model("Santa Fe"),
    model("IONIQ 5"),
    model("IONIQ 6"),
  ]),
  make("Kia", [
    model("Picanto"),
    model("Rio"),
    model("Ceed", true),
    model("Sportage", true),
    model("Sorento"),
    model("Niro"),
    model("EV6"),
    model("EV9"),
  ]),
  make("Fiat", [
    model("500", true),
    model("Panda", true),
    model("Tipo"),
    model("500X"),
    model("500e"),
  ]),
  make("Peugeot", [
    model("208", true),
    model("2008", true),
    model("308"),
    model("3008", true),
    model("5008"),
    model("508"),
  ]),
  make("Mazda", [
    model("2"),
    model("3", true),
    model("CX-3"),
    model("CX-30", true),
    model("CX-5", true),
    model("MX-5"),
  ]),
  make("MINI", [
    model("Cooper", true),
    model("Countryman", true),
    model("Clubman"),
    model("Cabrio"),
  ]),
  make("Tesla", [
    model("Model 3", true),
    model("Model Y", true),
    model("Model S"),
    model("Model X"),
  ]),
  make("Citroën", [model("C3", true), model("C4", true), model("C5 Aircross"), model("Berlingo")]),
  make("Nissan", [
    model("Micra"),
    model("Juke", true),
    model("Qashqai", true),
    model("X-Trail"),
    model("Leaf"),
  ]),
  make("Honda", [model("Jazz"), model("Civic", true), model("CR-V", true), model("HR-V")]),
  make("Suzuki", [model("Swift", true), model("Vitara", true), model("S-Cross")]),
  make("Land Rover", [
    model("Range Rover Evoque", true),
    model("Range Rover Sport", true),
    model("Range Rover"),
    model("Discovery"),
    model("Defender", true),
  ]),
  make("Jaguar", [
    model("XE"),
    model("XF"),
    model("F-Pace", true),
    model("E-Pace"),
    model("I-Pace"),
  ]),
  make("Jeep", [
    model("Renegade"),
    model("Compass", true),
    model("Grand Cherokee"),
    model("Avenger"),
  ]),
  make("Dacia", [model("Sandero", true), model("Duster", true), model("Jogger"), model("Spring")]),
  make("Smart", [model("ForTwo"), model("ForFour"), model("#1")]),
  make("Alfa Romeo", [model("Giulia", true), model("Stelvio", true), model("Tonale")]),
  make("Sonstige", []),
];

export function findMakeBySlug(slug: string): VehicleMake | undefined {
  return VEHICLE_MAKES.find((m) => m.slug === slug);
}

export function findModelBySlug(makeSlug: string, modelSlug: string): VehicleModel | undefined {
  return findMakeBySlug(makeSlug)?.models.find((m) => m.slug === modelSlug);
}

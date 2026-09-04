/**
 * Normalisierungs-Hilfsfunktionen für den Fahrzeugkatalog. Framework-frei,
 * damit sowohl der Importer (Node-Script) als auch spätere serverseitige
 * Such-/Alias-Auflösung dieselbe Logik verwenden – zwei Implementierungen
 * derselben Regel wären genau die Quelle für Karteileichen und
 * "Skoda findet Škoda nicht"-Bugs, die dieses System vermeiden soll.
 */

/** Slug für URLs: `/autos/bmw/3-series`. Diakritika werden gefaltet, nicht escaped. */
export function slugify(value: string): string {
  return foldDiacritics(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** NFKD-Faltung: `Škoda` → `Skoda`, `Citroën` → `Citroen`. */
export function foldDiacritics(value: string): string {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * Suchschlüssel für Alias-/Namensabgleich: diakritikafrei, kleingeschrieben,
 * ohne Trennzeichen. Damit treffen `"Skoda"`, `"Škoda"`, `"škoda"` und
 * `"ŠKODA"` alle denselben Datensatz, ohne dass dafür ein expliziter
 * Alias-Eintrag gepflegt werden muss (siehe docs/vehicle-data-sources.md).
 */
export function normalizedSearchKey(value: string): string {
  return foldDiacritics(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

/**
 * Milde Normalisierung für Dubletten-Erkennung: diakritikafrei,
 * kleingeschrieben, Leerzeichen getrimmt/kollabiert – aber im Unterschied zu
 * `normalizedSearchKey` bleibt die interne Zeichensetzung erhalten. Wichtig,
 * weil manche Hersteller echte, unterschiedliche Baureihen führen, die sich
 * nur durch einen Bindestrich unterscheiden (z. B. Saab `93` von 1956 vs.
 * Saab `9-3` von 1998 – beide real, beide im Katalog, KEINE Dublette).
 * `normalizedSearchKey` würde beide fälschlich auf "93" zusammenfalten.
 */
export function foldForComparison(value: string): string {
  return foldDiacritics(value).toLowerCase().trim().replace(/\s+/g, " ");
}

const NATURAL_SORT_CHUNK = /(\d+)|(\D+)/g;

/**
 * Natural-Sort-Vergleich für Modellnamen: `"2 Series"` vor `"10 Series"`,
 * `"1er"` vor `"2er"` vor `"10er"` – reine String-Sortierung würde
 * `"10 Series"` fälschlich vor `"2 Series"` einsortieren.
 */
export function naturalCompare(a: string, b: string): number {
  const chunksA = a.match(NATURAL_SORT_CHUNK) ?? [];
  const chunksB = b.match(NATURAL_SORT_CHUNK) ?? [];
  const length = Math.max(chunksA.length, chunksB.length);

  for (let i = 0; i < length; i += 1) {
    const chunkA = chunksA[i] ?? "";
    const chunkB = chunksB[i] ?? "";
    if (chunkA === chunkB) continue;

    const numA = Number(chunkA);
    const numB = Number(chunkB);
    const isNumericPair = chunkA !== "" && chunkB !== "" && !Number.isNaN(numA) && !Number.isNaN(numB);
    if (isNumericPair && numA !== numB) return numA - numB;

    return chunkA < chunkB ? -1 : 1;
  }
  return 0;
}

/**
 * Re-Export der Normalisierungs-Hilfsfunktionen aus @autoklick24/types.
 *
 * Sie leben dort (framework-frei, keine Prisma-Abhängigkeit), damit sowohl
 * der Importer/die Queries hier als auch der Browser-Code in apps/web
 * (Combobox-Suche/-Sortierung) exakt dieselbe Implementierung verwenden –
 * zwei Implementierungen derselben Regel wären genau die Quelle für
 * "Skoda findet Škoda nicht"-Bugs, die dieses System vermeiden soll.
 */
export {
  slugify,
  foldDiacritics,
  normalizedSearchKey,
  foldForComparison,
  naturalCompare,
} from "@autoklick24/types";

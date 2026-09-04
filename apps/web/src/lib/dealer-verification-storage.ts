import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  DEALER_VERIFICATION_DOCUMENT_ALLOWED_MIME_TYPES,
  DEALER_VERIFICATION_DOCUMENT_MAX_SIZE_BYTES,
} from "@autoklick24/validation";

/**
 * Ablage für Gewerbenachweise & Co. – bewusst AUSSERHALB von
 * apps/web/public: dieser Ordner wird von Next.js nie als statische Datei
 * ausgeliefert, es gibt also keine erratbare/öffentliche URL dafür (siehe
 * Aufgabenstellung "GEWERBESCHEIN SICHER SPEICHERN"). Zugriff nur über den
 * rollenbeschränkten Endpunkt
 * apps/web/src/app/api/v1/dealers/[dealerId]/verification-documents/[documentId]/route.ts.
 *
 * Lokales Dateisystem ist ein bewusster Platzhalter für die spätere
 * Produktionsanbindung an @autoklick24/providers' StorageProvider
 * (S3-kompatibel, private Buckets) – die Schnittstelle hier (Key rein,
 * Bytes raus) ist so geschnitten, dass ein Austausch später nicht die
 * aufrufenden Routen ändert.
 */
const PRIVATE_STORAGE_ROOT = path.join(process.cwd(), ".private-storage", "dealer-verification");

class DealerDocumentValidationError extends Error {}

const MAGIC_BYTES: { mimeType: string; bytes: number[] }[] = [
  { mimeType: "application/pdf", bytes: [0x25, 0x50, 0x44, 0x46] }, // %PDF
  { mimeType: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { mimeType: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
];

/**
 * Prüft die tatsächlichen ersten Bytes der Datei (Magic Numbers), nicht nur
 * die vom Browser gesendete Dateiendung/den Content-Type-Header (siehe
 * Aufgabenstellung "Nicht nur Dateiendung prüfen"). Gibt den anhand des
 * Inhalts erkannten MIME-Type zurück, oder null, wenn nichts passt.
 */
function sniffMimeType(buffer: Buffer): string | null {
  for (const candidate of MAGIC_BYTES) {
    const matches = candidate.bytes.every((byte, index) => buffer[index] === byte);
    if (matches) return candidate.mimeType;
  }
  return null;
}

export interface StoredDealerDocument {
  storageKey: string;
  mimeType: string;
  fileSize: number;
  originalFileName: string;
}

/**
 * Validiert (Größe, tatsächlicher Dateiinhalt per Magic Bytes, erlaubte
 * Formate) und speichert den Upload unter einem zufälligen Storage-Key -
 * NIE unter dem Originaldateinamen (siehe Aufgabenstellung, Beispiel
 * "gewerbeschein-max-mustermann.pdf" NICHT öffentlich speichern).
 */
export async function saveDealerVerificationDocument(file: File): Promise<StoredDealerDocument> {
  if (file.size <= 0) {
    throw new DealerDocumentValidationError("Datei ist leer.");
  }
  if (file.size > DEALER_VERIFICATION_DOCUMENT_MAX_SIZE_BYTES) {
    throw new DealerDocumentValidationError("Datei ist zu groß (maximal 10 MB).");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const detectedMimeType = sniffMimeType(buffer);
  if (
    !detectedMimeType ||
    !DEALER_VERIFICATION_DOCUMENT_ALLOWED_MIME_TYPES.includes(
      detectedMimeType as (typeof DEALER_VERIFICATION_DOCUMENT_ALLOWED_MIME_TYPES)[number],
    )
  ) {
    throw new DealerDocumentValidationError(
      "Ungültiges Dateiformat. Erlaubt sind PDF, JPG und PNG.",
    );
  }

  await mkdir(PRIVATE_STORAGE_ROOT, { recursive: true });
  const storageKey = randomUUID();
  await writeFile(path.join(PRIVATE_STORAGE_ROOT, storageKey), buffer);

  return {
    storageKey,
    mimeType: detectedMimeType,
    fileSize: buffer.byteLength,
    // Nur für die Anzeige/den Download-Dateinamen gespeichert, NICHT als
    // Storage-Pfad verwendet (siehe storageKey oben).
    originalFileName: file.name.slice(0, 255),
  };
}

export async function readDealerVerificationDocument(storageKey: string): Promise<Buffer> {
  return readFile(path.join(PRIVATE_STORAGE_ROOT, storageKey));
}

/** Für die spätere Aufbewahrungsrichtlinie (siehe Aufgabenstellung "DATENSCHUTZ"). */
export async function deleteDealerVerificationDocument(storageKey: string): Promise<void> {
  await unlink(path.join(PRIVATE_STORAGE_ROOT, storageKey)).catch(() => undefined);
}

export { DealerDocumentValidationError };

import { randomUUID } from "node:crypto";
import type { StorageProvider } from "./StorageProvider";

/**
 * In-Memory-Platzhalter für lokale Entwicklung ohne konfiguriertes S3/MinIO.
 * Liefert plausible, aber nicht funktionsfähige URLs – klar als Dev-Provider
 * zu erkennen an der "mock-storage" Domain.
 */
export class MockStorageProvider implements StorageProvider {
  readonly id = "mock-v1";

  async getSignedUploadUrl(params: {
    folder: string;
    fileName: string;
    contentType: string;
  }): Promise<{ uploadUrl: string; key: string }> {
    const key = `${params.folder}/${randomUUID()}-${params.fileName}`;
    return {
      key,
      uploadUrl: `https://mock-storage.local/upload/${encodeURIComponent(key)}?contentType=${encodeURIComponent(
        params.contentType,
      )}`,
    };
  }

  getPublicUrl(key: string): string {
    return `https://mock-storage.local/${key}`;
  }

  async delete(): Promise<void> {
    // no-op im Mock
  }
}

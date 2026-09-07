export interface UploadResult {
  key: string;
  url: string;
}

/**
 * Abstraktion über S3-kompatiblen Object Storage (Fahrzeugbilder,
 * Benutzerbilder, Fahrzeug-/Händlerdokumente). Produktionsimplementierung
 * nutzt später signierte Upload-URLs (S3_* Env-Variablen), damit Uploads
 * nicht über den App-Server laufen müssen.
 */
export interface StorageProvider {
  readonly id: string;
  getSignedUploadUrl(params: {
    folder: string;
    fileName: string;
    contentType: string;
  }): Promise<{ uploadUrl: string; key: string }>;
  getPublicUrl(key: string): string;
  delete(key: string): Promise<void>;
}

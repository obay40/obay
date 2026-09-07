# Autoklick24 – Architektur

## 1. Systemübersicht

Autoklick24 ist als **Monorepo** (pnpm Workspaces + Turborepo) aufgebaut, damit
Business-Logik, Validierung und Typen künftig sowohl von der Website
(`apps/web`, Next.js) als auch von einer nativen iOS-/Android-App
(`apps/mobile`, später React Native/Expo) genutzt werden können, ohne
Code oder Verhalten zu duplizieren.

```
apps/
  web/          Next.js App Router: UI + API-Route-Handler (/api/v1/...)
  mobile/       (folgt in Phase 11)
packages/
  types/        Geteilte Enums & Interfaces (Rollen, Status, Fahrzeugtypen, ...)
  validation/   Zod-Schemas – EINZIGE Quelle für Input-Validierung
  domain/       Business-Logik: Statusmaschinen, Berechtigungs-Policy
  providers/    Interfaces für externe Dienste + Mock-Implementierungen
  database/     Prisma-Schema, generierter Client, Seed-Skript
  auth/         Auth.js-Konfiguration, requireRole()/can()-Helper
```

Grundprinzip: **UI-Komponenten enthalten keine Geschäftslogik.** Route-Handler
sind dünn (Auth prüfen → validieren → `packages/domain`/Prisma aufrufen →
Response mappen). Das ist Voraussetzung dafür, dass eine künftige App exakt
dieselben Regeln nutzt wie die Website.

## 2. Datenmodell

**Zentrales Prinzip: `Vehicle` ≠ `Listing`.**
`Vehicle` enthält die einmalig erfassten Fahrzeugdaten. `Listing`,
`PurchaseRequest` und `MediationRequest` beschreiben, _wie_ dieses Fahrzeug
aktuell angeboten wird. Dadurch muss ein Kunde seine Fahrzeugdaten nur einmal
eingeben, unabhängig davon, ob er direkt verkauft, vermitteln lässt oder
selbst inseriert (siehe "Ein Fahrzeug. Drei Verkaufswege.").

### Phase 1 (implementiert)

`User` · `Profile` · `Address` · `Dealer` · `DealerEmployee` · `AuditLog`
– siehe `packages/database/prisma/schema.prisma`.

### Spätere Phasen (Modelle noch nicht angelegt)

`Vehicle`, `VehicleSpecification`, `VehicleEquipment`, `VehicleImage`,
`VehicleCondition`, `VehicleHistory` (Phase 3) · `Listing`,
`ListingPriceHistory` (Phase 6) · `PurchaseRequest`, `PurchaseOffer`,
`VehiclePickup` (Phase 4) · `MediationRequest` (Phase 5) · `Favorite`,
`SavedSearch`, `Conversation`, `ConversationParticipant`, `Message`
(Phase 7) · `DealerVerification`, `DealerSubscription`,
`SubscriptionPlan` (Phase 8/10) · `DealerB2BListing`, `DealerWantedVehicle`,
`TradeOffer` (Phase 9) · `Lead`, `LeadNote`, `LeadActivity` (Admin/CRM) ·
`Notification` · `Report`, `AdminNote`.

Diese Modelle werden erst angelegt, wenn die jeweilige Phase beginnt –
siehe Abschnitt 8. Enums/Statuswerte für sie existieren jedoch bereits in
`packages/types/src/status.ts`, damit UI-Prototypen und Domain-Logik früh
konsistent benannt sind.

## 3. Statusmaschinen

Keine willkürlichen String-Übergänge im Code. Jede Statusmaschine wird
zentral in `packages/domain/src/status/*.ts` mit `createStatusMachine()`
definiert: Sie kennt für jeden Status die erlaubten Folgezustände. Ein
Beispiel: Ein `SOLD`-Listing hat keine ausgehenden Übergänge – eine
Reaktivierung ist nur über einen neuen, bewussten Prozess möglich, nicht
durch simples Zurücksetzen des Felds.

## 4. Auth & Berechtigungen

- **Session-Strategie:** JWT (kein Datenbank-Adapter nötig), Rolle wird beim
  Login in den Token geschrieben (`packages/auth/src/config.ts`).
- **Passwort-Hashing:** `scrypt` (Node-eingebaut, `packages/database/src/password.ts`).
- **Serverseitige Prüfung ist Pflicht:** Jeder Route-Handler/jede Server
  Action, die etwas Geschütztes tut, ruft `requireAuth()` oder
  `requireRole([...])` aus `packages/auth` auf. Für ressourcenbezogene
  Entscheidungen (z. B. "darf dieser Nutzer dieses Dealer-Profil bearbeiten?")
  existiert zusätzlich `can()`/`assertCan()` aus `packages/domain`, das eine
  zentrale Policy-Registry (Resource × Action × Rolle/Ownership) auswertet.
- **Nie nur UI-seitig verstecken:** Ein ausgeblendeter Button ist keine
  Berechtigungsprüfung.

### Rollen

| Rolle           | Beschreibung                                   |
| --------------- | ---------------------------------------------- |
| GUEST           | Nicht eingeloggt (nur im Code, keine DB-Rolle) |
| CUSTOMER        | Privatkunde                                    |
| DEALER          | Autohändler (Kontoinhaber)                     |
| DEALER_EMPLOYEE | Mitarbeiter eines Autohauses                   |
| STAFF           | Autoklick24-Mitarbeiter                        |
| ADMIN           | Administrator                                  |
| SUPER_ADMIN     | Vollzugriff                                    |

Erweiterbar um `INSPECTOR`, `DRIVER`, `SUPPORT`, ohne bestehende
Prüfungen zu ändern (neue Policy-Einträge statt Umbau).

Innerhalb eines Händlerkontos gilt zusätzlich `DealerEmployeeRole`:
`OWNER` · `MANAGER` · `SALES` · `EMPLOYEE`.

## 5. API-Prinzipien

- Struktur: `/api/v1/{auth,users,vehicles,listings,purchase-requests,mediation,dealers,b2b,messages,favorites,searches,leads,admin}`.
- Route-Handler sind dünn; Validierung ausschließlich über `packages/validation` (Zod).
- Jede API, die die Website nutzt, ist so gestaltet, dass sie 1:1 von der
  künftigen Mobile-App wiederverwendet werden kann (kein Web-only-Pfad für
  Kernfunktionen).
- OpenAPI-Dokumentation ist für eine spätere Phase vorgesehen, sobald die
  ersten fachlichen Endpunkte (Fahrzeug, Listing, Ankauf) stabil sind.

## 6. Provider-Architektur ("keine Fake-Funktionalität")

Für jede externe Abhängigkeit, die in Version 1 nicht real angebunden ist,
existiert ein **Interface** in `packages/providers` plus eine **Mock-**
oder **Console-Implementierung**. UI-seitig werden Ergebnisse klar als
Schätzung/Demo gekennzeichnet (z. B. `VehicleValuation.isEstimate`).

| Provider                          | Interface             | Aktuelle Implementierung  | Später                                     |
| --------------------------------- | --------------------- | ------------------------- | ------------------------------------------ |
| Fahrzeugbewertung                 | `ValuationProvider`   | `MockValuationProvider`   | Marktdaten-/interner/externer API-Provider |
| Fahrzeugdaten (VIN/HSN-TSN)       | `VehicleDataProvider` | `MockVehicleDataProvider` | Echter Fahrzeugdaten-Anbieter              |
| Objektspeicher (Bilder/Dokumente) | `StorageProvider`     | `MockStorageProvider`     | S3-kompatibel (R2/MinIO/S3)                |
| Transaktions-E-Mail               | `EmailProvider`       | `ConsoleEmailProvider`    | Resend/Postmark o. ä.                      |

Kein Scraping fremder Plattformen für Marktdaten.

## 7. App-Strategie (iOS/Android)

Website und künftige App teilen sich **dieselbe API, Datenbank,
Benutzerkonten und Geschäftsprozesse**. Konsequenzen für die Architektur:

- Kernfunktionen (Registrierung, Fahrzeug erfassen/bewerten/inserieren,
  suchen, Favoriten, Nachrichten, Händlerfunktionen) laufen **ausschließlich**
  über `/api/v1/...`-Endpunkte, niemals nur über serverseitige
  Website-Formulare oder eng gekoppelte Server Actions ohne API-Äquivalent.
- Auth ist JWT-/Token-basiert und damit auch für native Clients geeignet.
- Geteilte Typen/Validierung (`packages/types`, `packages/validation`) sind
  bewusst framework-unabhängig (kein Next.js-Import), damit sie später auch
  in einer React-Native-App importiert werden können.
- Empfohlene Technologie für die App: **React Native + Expo** (Begründung:
  gemeinsame Sprache/Ökosystem mit dem Web-Team, guter Kamera-/Push-Support,
  OTA-Updates) – finale Entscheidung in Phase 11.

## 8. Entwicklungsphasen

| Phase | Inhalt                                                         | Status        |
| ----- | -------------------------------------------------------------- | ------------- |
| 1     | Fundament: Monorepo, Auth, Rollen, Design System, Grundlayout  | **umgesetzt** |
| 2     | Öffentliche Website: Homepage, Marktplatz, Suche, Detailseiten | offen         |
| 3     | Fahrzeugerfassung: Wizard, Daten, Ausstattung, Zustand, Bilder | offen         |
| 4     | Direktankauf: Anfrage, Bewertung, Angebote, Status             | offen         |
| 5     | Vermittlung: Workflow, Vermittlungsfahrzeuge                   | offen         |
| 6     | Selbst inserieren: Listing, Preisbewertung, Veröffentlichung   | offen         |
| 7     | Kundenkonto: Dashboard, Favoriten, Suchaufträge, Nachrichten   | offen         |
| 8     | Händlerportal: Registrierung, Prüfung, Dashboard               | offen         |
| 9     | B2B: Händlerbörse, Gesuche, Tauschangebote                     | offen         |
| 10    | Monetarisierung: Subscriptions, Stripe, Rechnungen             | offen         |
| 11    | Mobile App: React Native/Expo auf stabiler API                 | offen         |

## 9. Sicherheit (Auszug)

- Passwörter: `scrypt`-Hashing, nie im Klartext geloggt.
- Validierung: ausschließlich über zentrale Zod-Schemas, nie ungeprüfte
  Request-Bodies weiterreichen.
- Rollen-/Berechtigungsprüfung ausschließlich serverseitig (`requireRole`, `can`).
- Uploads (ab Phase 3): serverseitige MIME-/Größenprüfung, signierte
  Upload-URLs statt Datei-Uploads über den App-Server.
- `.env` wird nie committet; `.env.example` enthält nur Platzhalter.

## 10. Zukünftige Integrationen (vorbereitet, nicht aktiv)

Stripe (Zahlungen/Abonnements) · Meilisearch/Typesense/OpenSearch (Suche) ·
echte Fahrzeugdaten-/Bewertungs-APIs · SMS-Versand · Push Notifications
(FCM/APNs) · Sentry o. ä. (Error-Tracking).

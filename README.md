# Autoklick24

Autoklick24 ist eine Fahrzeugplattform, die Fahrzeughaltern drei Verkaufswege
bietet: **Direktverkauf an Autoklick24**, **Vermittlung durch Autoklick24**
oder **selbst inserieren** auf dem Autoklick24-Marktplatz. Langfristig kommen
ein Händlerbereich/B2B-Marktplatz sowie native iOS-/Android-Apps hinzu, die
dieselbe API, Datenbank und Benutzerkonten nutzen wie die Website.

> **Status:** Phase 1 (Fundament). Siehe [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
> für die vollständige Architektur und den Phasenplan.

## Tech-Stack

- **Frontend:** Next.js (App Router), React, TypeScript (strict), Tailwind CSS
- **Backend:** Next.js Route Handlers (`/api/v1/...`), API-first
- **Datenbank:** PostgreSQL
- **ORM:** Prisma
- **Auth:** Auth.js (NextAuth v5), Credentials-Provider, JWT-Sessions, Rollen im Token
- **Monorepo:** pnpm Workspaces + Turborepo

## Voraussetzungen

- Node.js ≥ 20
- pnpm ≥ 10 (`corepack enable` aktiviert die passende Version automatisch)
- Eine laufende PostgreSQL-Instanz (lokal, Docker oder gehostet)

## Installation

```bash
pnpm install
cp .env.example .env
# DATABASE_URL, AUTH_SECRET etc. in .env anpassen
```

## Datenbank-Setup

```bash
pnpm db:generate   # Prisma Client generieren
pnpm db:migrate    # Migrationen anwenden (interaktiv, Dev-Modus)
pnpm db:seed       # Demo-Daten einspielen (klar als [DEMO] markiert)
```

`pnpm db:studio` öffnet Prisma Studio zur Ansicht/Bearbeitung der Daten.

## Entwicklung

```bash
pnpm dev
```

Startet alle Apps parallel via Turborepo (aktuell: `apps/web` unter
http://localhost:3000).

## Tests, Lint, Typecheck

```bash
pnpm lint
pnpm typecheck
pnpm test
```

## Production Build

```bash
pnpm build
```

## Environment Variables

Siehe [`.env.example`](.env.example) für alle unterstützten Variablen,
inklusive der für spätere Phasen vorbereiteten (Stripe, Suchengine,
Fahrzeugdaten-APIs, SMS/Push). Es werden **keine Secrets** committet.

## Monorepo-Struktur

```
apps/
  web/                 Next.js Website (App Router)
packages/
  types/               Geteilte Enums/Interfaces (Rollen, Status, ...)
  validation/          Zod-Schemas (Auth, Adresse, Händler, ...)
  domain/              Business-Logik: Statusmaschinen, Berechtigungs-Policy
  providers/            Externe-Schnittstellen: Valuation, Vehicle-Data, Storage, E-Mail (inkl. Mocks)
  database/            Prisma-Schema, Client, Seed
  auth/                Auth.js-Konfiguration, requireRole()-Helper
docs/
  ARCHITECTURE.md      Systemübersicht, Datenmodell, Phasenplan
```

## Rollen

`CUSTOMER`, `DEALER`, `DEALER_EMPLOYEE`, `STAFF`, `ADMIN`, `SUPER_ADMIN`
(`GUEST` existiert nur im Code, nicht als DB-Wert). Details und
Berechtigungskonzept: siehe `docs/ARCHITECTURE.md`.

## Wichtige Workflows

- **Direktverkauf:** Fahrzeug erfassen → Bewertung (Schätzung) → Ankaufanfrage → Angebot → Abholung
- **Vermittlung:** Fahrzeug erfassen → Prüfung → Vermittlungsvereinbarung → Inserat → Verkauf
- **Selbst inserieren:** Fahrzeug erfassen → Preisbewertung ansehen → Inserat veröffentlichen

Alle drei Wege teilen sich dieselbe einmalige Fahrzeugerfassung (`Vehicle`),
die vom eigentlichen Angebot (`Listing`) getrennt modelliert ist.

## Demo-Daten (nur Entwicklung)

Nach `pnpm db:seed` stehen folgende Demo-Konten zur Verfügung (Passwort:
`Demo1234!`):

| Rolle   | E-Mail                          |
| ------- | ------------------------------- |
| Admin   | admin@demo.autoklick24.local    |
| Kunde   | kunde@demo.autoklick24.local    |
| Händler | haendler@demo.autoklick24.local |

Alle Namen sind mit `[DEMO]` markiert und dürfen nicht als echte Daten
missverstanden werden.

# Autoklick24 – Android- und iOS-App (Capacitor)

Die Apps benutzen **dieselbe Web-Codebasis** wie die Webseite. Es gibt keine
zweite Anwendung und keine Kopie der Seite für Android oder iOS.

```
              Autoklick24 Web-Oberfläche (index.html, gh-pages)
                                 |
                          pnpm build:web
                                 |
                             dist/web
                        /                 \
              GitHub Pages              Capacitor
             (Webseite)                /          \
                                  Android         iOS
```

|                    |                                                    |
| ------------------ | -------------------------------------------------- |
| App-Name           | Autoklick24                                        |
| App-ID / Bundle-ID | `de.autoklick24.app`                               |
| `webDir`           | `dist/web`                                         |
| Capacitor          | 8.5.x (`@capacitor/core`, `cli`, `android`, `ios`) |

## Wie die Webseite gebaut wird

Die öffentliche Seite ist eine statische `index.html`, die auf dem Branch
`gh-pages` liegt – bisher **ohne** Build-Schritt. `pnpm build:web`
(`scripts/build-web.mjs`) materialisiert genau diesen Stand nach `dist/web`.
Es wird nichts ins Repository kopiert, die Quelle bleibt eindeutig.

Das Deployment der Webseite ist unverändert: Push auf `gh-pages`.
`dist/web` ist git-ignoriert.

Die Seite nutzt nur relative Asset-Pfade (`./assets/…`) und Hash-Routing
(`#/autos`). Deshalb läuft sie unverändert unter
`https://obay40.github.io/obay/` **und** lokal im App-WebView – es gibt
keinen `/obay/`-Basispfad, der für die App entfernt werden müsste.

## Android

Voraussetzung: Android Studio inkl. Android SDK, JDK 21.

```bash
pnpm install
pnpm build:web
npx cap sync android
npx cap open android
```

## iOS

Voraussetzung: **macOS** mit Xcode und CocoaPods. Auf Linux/Windows lässt
sich das iOS-Projekt erzeugen und konfigurieren, aber nicht bauen.

```bash
pnpm install
pnpm build:web
npx cap sync ios      # führt auf macOS auch `pod install` aus
npx cap open ios
```

## Täglicher Ablauf

```bash
pnpm app:sync      # = pnpm build:web && npx cap sync
npx cap open android   # oder: npx cap open ios
```

Weitere Scripts: `pnpm cap:sync`, `pnpm cap:android`, `pnpm cap:ios`,
`pnpm app:icons`.

## Icons und Splash

`pnpm app:icons` (`scripts/generate-app-icons.mjs`) erzeugt alle Icon- und
Splash-Dateien aus dem vorhandenen `assets/autoklick24-symbol.png` – das
Logo-Symbol, nicht der Schriftzug, weil ein Wortlogo als App-Icon zu klein
wäre. Das Logo wird dabei nicht neu gezeichnet, nur mittig platziert.

Das Quellsymbol ist 302×302 px. Für das 1024er iOS-Icon wird es hochskaliert;
ein höher aufgelöstes Original würde die Icons schärfer machen.

## Native Funktionen (später)

Noch sind **keine** Capacitor-Plugins installiert – erst installieren, wenn
sie wirklich gebraucht werden:

| Funktion                                      | Plugin                          |
| --------------------------------------------- | ------------------------------- |
| Fahrzeugfotos aufnehmen / aus Galerie         | `@capacitor/camera`             |
| Standort für Umkreissuche                     | `@capacitor/geolocation`        |
| Push („Neues Fahrzeug passt zu deiner Suche“) | `@capacitor/push-notifications` |
| Deep Links                                    | `@capacitor/app`                |
| Teilen                                        | `@capacitor/share`              |
| Status-Bar-Farbe                              | `@capacitor/status-bar`         |

Ob die Oberfläche nativ läuft, steht in `window.AUTOKLICK24_IS_NATIVE_APP`
(gesetzt in `index.html`, per `Capacitor.isNativePlatform()` – kein
User-Agent-Sniffing). Nativ bekommt `<html>` zusätzlich die Klasse
`is-native-app`.

## Backend

Web, Android und iOS sollen **dieselbe** API und damit dieselben Konten und
Daten benutzen – keine getrennte App-Datenbank, keine zweite Anmeldung.

Die API-Adresse steht zentral an einer Stelle:
`window.AUTOKLICK24_API_BASE_URL` in `index.html`, aktuell `null`, weil es
noch kein Backend gibt.

GitHub Pages ist reines Frontend-Hosting und wird **nicht** das Backend:
keine Authentifizierung, keine Händlerdokumente, keine Uploads, kein Push.
Secrets und API-Keys gehören ins Backend, nicht in diese Dateien.

Sobald die Next.js-App aus `apps/web/` deployed ist, wird sie das Frontend
und liefert die API; `webDir` zeigt dann auf deren Export statt auf `dist/web`.

## Safe Areas

`index.html` setzt `viewport-fit=cover` und berücksichtigt
`env(safe-area-inset-*)` im Header (oben/links/rechts) und im Footer
(unten/links/rechts). Im Browser ohne Notch sind alle Werte 0, die
Webansicht ändert sich dadurch nicht.

## Was hier bewusst NICHT passiert

- **Kein** `server.url` auf `https://obay40.github.io/obay/`: die App ist
  kein dauerhaftes Remote-WebView, die Web-Dateien liegen lokal in der App.
- Keine Store-Veröffentlichung, keine Zertifikate, keine Signing-Keys,
  keine Provisioning-Profiles.

`android/` und `ios/` sind versioniert; nur generierte Build-, IDE- und
kopierte Web-Dateien sind in `.gitignore`.

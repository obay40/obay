# Autoklick24 – Verteilung über Google Play Internal Testing

Warum dieser Weg: Beim manuellen Installieren einer APK warnt Google Play
Protect, weil die App von außerhalb des Play Stores kommt. Über Internal
Testing installieren Tester Autoklick24 ganz normal aus dem Play Store –
ohne Warnung und ohne „unbekannte Quellen" freizuschalten.

Play Protect wird dabei **nicht** umgangen oder abgeschaltet.

| | |
|---|---|
| Paketname | `de.autoklick24.app` |
| App-Name | Autoklick24 |
| versionName | 0.1.0 |
| versionCode | 1 |

## 1. Upload-Keystore erstellen (einmalig)

Es existiert noch **kein** Release-Keystore. Er wird bewusst nicht
automatisch erzeugt: Der Schlüssel muss dauerhaft sicher liegen, und geht er
verloren, lässt sich die App später nicht mehr aktualisieren.

Auf dem eigenen Rechner erzeugen – **nicht** im Projektordner:

```bash
keytool -genkeypair -v \
  -keystore ~/autoklick24-upload.jks \
  -alias autoklick24-upload \
  -keyalg RSA -keysize 2048 -validity 10000
```

Die Datei `~/autoklick24-upload.jks` und die beiden Passwörter sicher
aufbewahren (Passwortmanager, Backup). Sie gehören **nicht** ins Repository.

Bei Google Play ist standardmäßig **Play App Signing** aktiv: Dieser
Schlüssel ist dann der *Upload*-Schlüssel, den finalen Signaturschlüssel
verwaltet Google. Ein verlorener Upload-Schlüssel lässt sich über den
Play-Support zurücksetzen – der finale Schlüssel nicht.

## 2. Zugangsdaten hinterlegen

`android/keystore.properties` anlegen (ist per `.gitignore` ausgeschlossen):

```properties
storeFile=/absoluter/pfad/zu/autoklick24-upload.jks
storePassword=DEIN_KEYSTORE_PASSWORT
keyAlias=autoklick24-upload
keyPassword=DEIN_KEY_PASSWORT
```

Alternativ für CI die Umgebungsvariablen `AK24_KEYSTORE_FILE`,
`AK24_KEYSTORE_PASSWORD`, `AK24_KEY_ALIAS`, `AK24_KEY_PASSWORD`.

Ohne beides wird der Release-Build **unsigniert** erzeugt – der Build läuft
durch, die Datei ist aber weder installierbar noch bei Play hochladbar.

## 3. Signiertes AAB bauen

```bash
pnpm build:web
npx cap sync android
cd android
./gradlew bundleRelease        # Windows: gradlew.bat bundleRelease
```

Ergebnis: `android/app/build/outputs/bundle/release/app-release.aab`

Signatur prüfen:

```bash
$ANDROID_HOME/build-tools/36.0.0/apksigner verify --print-certs \
  app/build/outputs/apk/release/app-release.apk
```

## 4. In der Google Play Console

1. [play.google.com/console](https://play.google.com/console) öffnen
   (einmalig 25 $ Entwicklerkonto).
2. **App erstellen** → Name „Autoklick24", Sprache Deutsch, App, kostenlos.
3. Paketname `de.autoklick24.app` – wird beim ersten Upload aus dem AAB
   übernommen und ist danach **nicht mehr änderbar**.
4. Links **Testen → Interner Test** öffnen.
5. **Neuen Release erstellen** → `app-release.aab` hochladen.
6. Reiter **Tester** → E-Mail-Liste anlegen und Tester eintragen
   (Google-Konten, mit denen die Tester im Play Store angemeldet sind).
7. **Speichern → Release überprüfen → Freigeben**.
8. Den generierten **Testlink** kopieren und an die Tester schicken.
9. Tester öffnen den Link, treten dem Testprogramm bei und installieren
   Autoklick24 über Google Play.

Interne Tests sind meist in Minuten verfügbar; eine vollständige
Store-Prüfung ist dafür nicht nötig.

## 5. Weitere Versionen

Vor jedem neuen Upload `versionCode` in `android/app/build.gradle` erhöhen
(1 → 2 → 3 …), sonst lehnt Play den Upload ab. `versionName` ist der für
Menschen sichtbare Text (z. B. 0.1.1).

## Optional: Release-APK für lokale Tests

```bash
./gradlew assembleRelease      # Windows: gradlew.bat assembleRelease
```

Ergebnis: `android/app/build/outputs/apk/release/app-release.apk`

Nur für eigene Tests – bei manueller Installation zeigt Play Protect
weiterhin einen Hinweis. Für Tester ist der Weg über Internal Testing
gedacht.

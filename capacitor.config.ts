import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Capacitor-Konfiguration fuer die Autoklick24-Apps (Android + iOS).
 *
 * webDir zeigt auf dist/web - das Ergebnis von `pnpm build:web`
 * (scripts/build-web.mjs). Dort liegt exakt die Web-Oberflaeche, die auch
 * unter https://obay40.github.io/obay/ ausgeliefert wird; die App bettet
 * diese Dateien LOKAL ein.
 *
 * Bewusst KEIN server.url auf die GitHub-Pages-URL: die App soll kein
 * dauerhaftes Remote-WebView sein. Fahrzeug-/Konto-Daten kommen spaeter
 * ueber die API dazu (zentrale URL, siehe MOBILE_APP_SETUP.md) - nicht
 * ueber eine gehostete Seite im WebView.
 */
const config: CapacitorConfig = {
  appId: "de.autoklick24.app",
  appName: "Autoklick24",
  webDir: "dist/web",

  android: {
    // Inhalte nicht hinter Status-/Navigationsleiste rutschen lassen; die
    // Seite selbst beruecksichtigt zusaetzlich env(safe-area-inset-*).
    adjustMarginsForEdgeToEdge: "auto",
  },

  ios: {
    // Kein Gummiband-Scrollen ueber den Seitenrand hinaus - wirkt in einer
    // App sonst schnell wie eine eingebettete Webseite.
    scrollEnabled: true,
    contentInset: "always",
  },
};

export default config;

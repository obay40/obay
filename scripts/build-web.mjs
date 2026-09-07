#!/usr/bin/env node
/**
 * Baut die ausgelieferte Web-Oberflaeche nach dist/web.
 *
 * Hintergrund: Die oeffentliche Autoklick24-Seite ist aktuell eine statische
 * index.html, die auf dem Branch gh-pages liegt (siehe CLAUDE.md). Es gibt
 * dafuer bisher keinen Build-Schritt - "bauen" heisst hier also: den Stand
 * des Deploy-Branches in ein Verzeichnis materialisieren.
 *
 * Damit gibt es weiterhin nur EINE Web-Codebasis: gh-pages liefert die
 * Webseite aus, und Capacitor bettet exakt dieselben Dateien lokal in die
 * Android-/iOS-App ein. Es wird nichts ins Repository kopiert.
 *
 * Die Seite benutzt ausschliesslich relative Asset-Pfade (./assets/...) und
 * Hash-Routing (#/autos). Deshalb funktioniert sie unveraendert sowohl unter
 * https://obay40.github.io/obay/ als auch lokal im Capacitor-WebView - es
 * gibt keinen /obay/-Basispfad, der fuer die App entfernt werden muesste.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, existsSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = resolve(repoRoot, "dist/web");

/** Quelle der ausgelieferten Seite - per Env uebersteuerbar (z. B. fuer CI). */
const SOURCE_REF = process.env.AK24_WEB_SOURCE_REF ?? "origin/gh-pages";

const git = (args, opts = {}) =>
  execFileSync("git", args, { cwd: repoRoot, stdio: "pipe", ...opts });

function resolveRef() {
  try {
    git(["rev-parse", "--verify", `${SOURCE_REF}^{commit}`]);
    return SOURCE_REF;
  } catch {
    // Frischer Clone ohne Remote-Tracking-Branch: einmal nachladen.
    if (SOURCE_REF.startsWith("origin/")) {
      const branch = SOURCE_REF.slice("origin/".length);
      process.stdout.write(`build-web: hole ${SOURCE_REF} ...\n`);
      git(["fetch", "origin", branch, "--depth", "1"], { stdio: "inherit" });
      return SOURCE_REF;
    }
    throw new Error(`build-web: Ref ${SOURCE_REF} nicht gefunden.`);
  }
}

const ref = resolveRef();
const commit = git(["rev-parse", "--short", ref]).toString().trim();

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

// git archive -> tar: uebertraegt den Baumstand ohne Arbeitskopie/Branchwechsel.
const archive = git(["archive", "--format=tar", ref], { maxBuffer: 256 * 1024 * 1024 });
execFileSync("tar", ["-x", "-C", outDir], { input: archive });

if (!existsSync(resolve(outDir, "index.html"))) {
  throw new Error(`build-web: ${ref} enthaelt keine index.html.`);
}

process.stdout.write(
  `build-web: dist/web aus ${ref} (${commit}) erstellt - ${readdirSync(outDir).join(", ")}\n`,
);

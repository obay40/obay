#!/usr/bin/env node
/**
 * Erzeugt App-Icons und Splash-Screens aus dem VORHANDENEN Autoklick24-Symbol
 * (dist/web/assets/autoklick24-symbol.png). Das Logo wird dabei nicht neu
 * gezeichnet und nicht veraendert - es wird nur mittig auf eine quadratische
 * Flaeche in Markenfarbe gesetzt und skaliert.
 *
 * Bewusst der Symbol-Teil des Logos, nicht der Schriftzug: ein App-Icon ist
 * auf dem Homescreen ca. 60px gross, ein Wortlogo waere dort unlesbar.
 *
 * Aufruf: node scripts/generate-app-icons.mjs   (nach `pnpm build:web`)
 */
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(repoRoot, "dist/web/assets/autoklick24-symbol.png");

if (!existsSync(source)) {
  console.error("Quelle fehlt: dist/web/assets/autoklick24-symbol.png - zuerst `pnpm build:web`.");
  process.exit(1);
}

const python = `
import os, sys
from PIL import Image

SRC = ${JSON.stringify(source)}
ROOT = ${JSON.stringify(repoRoot)}
BG = (255, 255, 255, 255)  # ruhiger, heller Markenhintergrund wie im Header

sym = Image.open(SRC).convert("RGBA")

def canvas(size, symbol_ratio, bg=BG):
    """Symbol mittig auf quadratischer Flaeche, symbol_ratio = Anteil der Kantenlaenge."""
    out = Image.new("RGBA", (size, size), bg)
    target = max(1, int(size * symbol_ratio))
    s = sym.resize((target, target), Image.LANCZOS)
    out.paste(s, ((size - target) // 2, (size - target) // 2), s)
    return out

def write(img, path):
    full = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    img.save(full)
    return path

written = []

# ---------- Android: mipmap-Dichten ----------
# launcher + round nutzen dasselbe Bild; foreground fuer adaptive Icons
# braucht mehr Rand, weil Android es beschneidet (Safe Zone ~66%).
android = {"mdpi": 48, "hdpi": 72, "xhdpi": 96, "xxhdpi": 144, "xxxhdpi": 192}
for d, px in android.items():
    icon = canvas(px, 0.66)
    written.append(write(icon, f"android/app/src/main/res/mipmap-{d}/ic_launcher.png"))
    written.append(write(icon, f"android/app/src/main/res/mipmap-{d}/ic_launcher_round.png"))
    # Vordergrund des adaptiven Icons transparent: darunter liegt die
    # Hintergrundebene (@color/ic_launcher_background), sonst waere sie verdeckt.
    written.append(
        write(
            canvas(px, 0.45, (255, 255, 255, 0)),
            f"android/app/src/main/res/mipmap-{d}/ic_launcher_foreground.png",
        )
    )

# Android Splash (portrait/landscape werden von Capacitor skaliert)
for d, px in {"mdpi": 320, "hdpi": 480, "xhdpi": 720, "xxhdpi": 960, "xxxhdpi": 1280}.items():
    written.append(write(canvas(px, 0.34), f"android/app/src/main/res/drawable-{d}/splash.png"))
written.append(write(canvas(480, 0.34), "android/app/src/main/res/drawable/splash.png"))

# ---------- iOS: AppIcon (ein 1024er Universal-Icon reicht seit Xcode 14) ----------
# iOS erlaubt keine Transparenz im App-Icon - der weisse Grund ist Pflicht.
ios_icon = canvas(1024, 0.66).convert("RGB")
p = "ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png"
os.makedirs(os.path.join(ROOT, os.path.dirname(p)), exist_ok=True)
ios_icon.save(os.path.join(ROOT, p))
written.append(p)

# iOS Splash: Capacitor erwartet 2732x2732 (universal, dark, dark@2x)
splash = canvas(2732, 0.18).convert("RGB")
for name in ("splash-2732x2732.png", "splash-2732x2732-1.png", "splash-2732x2732-2.png"):
    p = f"ios/App/App/Assets.xcassets/Splash.imageset/{name}"
    os.makedirs(os.path.join(ROOT, os.path.dirname(p)), exist_ok=True)
    splash.save(os.path.join(ROOT, p))
    written.append(p)

print(f"{len(written)} Dateien geschrieben (Quelle: {os.path.basename(SRC)}, {sym.size[0]}x{sym.size[1]})")
`;

execFileSync("python3", ["-c", python], { stdio: "inherit", cwd: repoRoot });

# Arbeitsauftrag: Plixa-Design + 12 Sprachen + CNC-Panel im Editor-Fork

> **Für eine Claude-Code-Sitzung, die auf `michherm/editor` (den Pascal-Fork) zeigt.**
> Diese Datei ist der komplette Auftrag. Alles Nötige steht hier drin.
> Der bewährte Plugin-Code liegt im Schwester-Repo `michherm/plixa` unter
> `planer/packages/plixa-stairs/` — von dort kopieren, nicht neu erfinden.

## Kontext (in einem Satz)
Der Fork `michherm/editor` ist der **Pascal Editor** (Innenausbau: Wände, Räume,
Möbel, Treppe). Er ist schon auf Vercel deployt (`plixa-editor.vercel.app`,
Root-Ordner `apps/editor`, Next.js). Er soll jetzt **wie Plixa aussehen** und
unser **CNC-Panel** bekommen. Pascals Logik bleibt unangetastet — nur Oberfläche
+ ein zusätzliches Plugin.

---

## Aufgabe 1 — Plixa-Branding (nur Oberfläche)

### 1a. Farben (Plixa-Markenpalette)
Diese Werte 1:1 verwenden (Quelle: `plixa/src/app/globals.css`):

| Rolle | Hex |
|---|---|
| **Leitfarbe Amber (Holz)** | `#d39440` |
| Amber dunkel | `#b3792d` |
| Gold (Highlight) | `#e3b14e` |
| Nachtblau (dunkler Grund) | `#11181f` |
| Nachtblau-2 | `#0d1318` |
| Papier (heller Grund) | `#f7f4ee` |
| Tinte (Text) | `#1a242e` |
| Himmel (Akzent) | `#5b8fb8` |
| Wachstum (Akzent) | `#4e9e78` |
| Gedämpft | `#7c8b9d` |

**Akzent-/Primärfarbe des Editors → Amber `#d39440`.** Aktive Buttons/Tabs mit
Verlauf `linear-gradient(180deg, #e3b14e, #d39440)`, aktive Textfarbe `#18120a`.
Pascal nutzt Tailwind v4 + CSS-Variablen (`apps/editor/app/globals.css`,
`styles/elevation.css`). Dort die Akzent-/Primär-Variablen auf die Plixa-Werte
umbiegen — NICHT die ganze Theme-Struktur umbauen, nur die Farbwerte tauschen.

### 1b. Schriften
- **UI durchgängig:** `Inter` (`--font-body`, `--font-display`).
- **Nur die Wortmarke „Plixa":** `Fraunces` (Serifen).
- Fallbacks: `Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif`
  bzw. `Fraunces, Georgia, 'Times New Roman', serif`.

### 1c. Logo
Zwei fertige Wortmarken liegen in `plixa/public/brand/`:
- `plixa-wortmarke-hell.png` — für **dunkle** Flächen
- `plixa-wortmarke-dunkel.png` — für **helle** Flächen

Diese PNGs nach `apps/editor/public/brand/` kopieren und das Pascal-Logo im
Editor-Header/der Sidebar durch die passende Plixa-Wortmarke ersetzen (je nach
Hintergrund hell/dunkel). Das „x" ist in Amber — gewolltes Erkennungsmerkmal.

### 1d. Titel / Favicon
- Seitentitel + `metadata.title` → **„Plixa Planer"**.
- Favicon → Plixa (aus der Wortmarke ableiten oder vorhandenes Plixa-Favicon).

### 1e. 12 Sprachen (wie in der Haupt-App)
Der Editor muss **dieselben 12 Sprachen** anbieten wie Plixa:
`de, fr, en, pl, it, es, nl, pt, cs, sv, da, ro`.

1. **Pascals UI-Strings** finden (i18n-Setup im Editor; oft `en` fest verdrahtet
   oder ein eigener i18n-Layer). Falls Pascal keine i18n hat: die sichtbaren
   Strings in eine Sprachtabelle ziehen (Schlüssel → Text) und `i18next`
   einbinden — dasselbe Werkzeug wie in Plixa.
2. **12 Locale-Dateien** anlegen. Vorbild/Quelle für Ton & vorhandene Begriffe:
   `plixa/src/i18n/locales.ts` (+ `ui2.ts`, `ui3.ts`, `panels.ts`, `statik.ts`)
   und `plixa/content/landing-texte.ts` — dort stehen alle 12 Sprachen schon.
3. **Sprachumschalter** in den Editor-Header (analog Plixa `LanguageSwitcher`).
4. **Startsprache aus der URL** lesen: `?lng=<code>` (siehe Aufgabe 4) — so
   öffnet der Editor in derselben Sprache, die der Nutzer in Plixa gewählt hat.
5. **Unser CNC-Panel** ist schon auf DE-Strings — beim i18n-Umbau die Texte in
   `packages/plixa-stairs/src/panel.tsx` mit in die Sprachtabelle nehmen.

**Grenzen:** Keine Logik-, Architektur- oder Abhängigkeitsänderungen an Pascals
Kern. Nur Farben, Schrift, Logo, Titel, Sprachen. Alles auf einem Branch +
Vercel-Preview zeigen, bevor es auf `main` geht.

---

## Aufgabe 2 — Plixa-CNC-Panel einbauen

Wir bauen **keine zweite Treppe**: Pascals eingebaute Treppe plant (Geschosse
verbinden, Deckenöffnung schneiden, Geländer). Unser Plugin ist die
**CNC-/Fertigungs-Schicht** — ein Panel „Plixa CNC", das aus der gewählten
Treppe die WikiHouse-Frästeile (DXF/3dm) + DIN-18065/EC5-Bericht macht.

### 2a. Plugin-Paket übernehmen
Den kompletten Ordner `plixa/planer/packages/plixa-stairs/` in den Fork kopieren
(z. B. nach `packages/plixa-stairs/`). Er enthält bereits:
- `src/index.ts` — exportiert `plixaCncPlugin` (Manifest: `id: 'plixa:cnc'`,
  `apiVersion: 1`, ein Panel „Plixa CNC") + `computeStairCnc`.
- `src/cnc.ts` — **echte, reine CNC-Rechnung** `computeStairCnc(params)`:
  Steigung/Auftritt (DIN-18065-Schnellprüfung), Frästeil-Liste (Tritte,
  Setzstufen, 2 Wangen), Plattenbedarf/Nesting und Kosten-Schätzung.
  Abhängigkeitsfrei + per Vitest getestet (`src/cnc.test.ts`, 7 Tests grün).
- `src/panel.tsx` — die Panel-Oberfläche, die `computeStairCnc` schon **live
  rendert** (Maße, DIN-Ampel, Frästeil-Tabelle, Plattenbedarf, Kosten).
  **WIRE-POINT:** die Funktion `useSelectedStairParams()` liefert aktuell nur
  Default-Werte — im Fork an Pascals Store koppeln (Parameter der gewählten
  `stair`-Node lesen → in `StairCncParams` mappen). Der Rest bleibt unverändert.
- `src/schema.ts`, `src/geometry.ts`, `src/definition.ts`, `src/parametrics.ts`
  — der geprüfte Treppen-Spike als Referenz (NICHT im Manifest; für eine
  spätere eigene „über-Eck-Wandtreppe").
- `package.json` (`@plixa/stairs`), `tsconfig.json`.

Ins Monorepo einhängen: als Workspace (`packages/*`) und in `apps/editor` als
Dependency `"@plixa/stairs": "*"` eintragen; falls Next `transpilePackages`
braucht, `@plixa/stairs` dort ergänzen (Vorbild: `plixa/planer/next.config.mjs`).

### 2b. Plugin registrieren
In `apps/editor/lib/bootstrap.ts` (Pascals Discovery-Hook) das Plugin so
anmelden, wie es `plixa/planer/lib/bootstrap.ts` zeigt:

```ts
import { plixaCncPlugin } from '@plixa/stairs'
// … bestehende Built-ins + Trees behalten …
setPluginDiscovery(async () => [treesPlugin, plixaCncPlugin])
```

Danach erscheint links im Editor die Leiste **„Plixa CNC"**.

### 2c. Verifizieren
- `bun install` (Pascal nutzt Bun), Typecheck, `bun run build`.
- Editor öffnen → „Plixa CNC"-Panel sichtbar, Pascals Treppe unverändert.
- Branch pushen → Vercel-Preview prüfen.

---

## Aufgabe 3 (später, eigener Auftrag) — Engine an die Treppe koppeln
Panel liest die Parameter der gewählten `stair` (stairType, totalRise,
stepCount, width, thickness …) → Plixa-Engine (`plixa/src/stair`, Nesting,
DIN 18065, EC5) → **DXF/3dm-Export + Bericht**; dazu ein MCP-Tool
`export_stair_cnc`. Erst NACH Aufgabe 1+2 angehen.

---

## Aufgabe 4 — Nahtlose Integration („ein Plixa", kein Programm-Wechsel)
Ziel (vom Nutzer bestätigt): **eine Adresse, ein Menü, ein Design, eine Sprache.**
Der Nutzer soll nie zwei Programme sehen. Technisch bleiben es zwei Motoren
(Plixa = Next 14/WebGL, Editor = Next 16/WebGPU) — der Editor wird aber unter
die Plixa-Domain gehängt und teilt Kopf/Design/Sprache.

**Fork-Seite (hier, `michherm/editor`):**
1. `basePath: '/innenausbau'` in `apps/editor/next.config.*` setzen, damit alle
   Editor-Routen/Assets unter diesem Pfad laufen (Voraussetzung fürs Einhängen
   unter die Plixa-Domain).
2. `?lng=<code>` beim Start lesen und die i18n-Startsprache daraus setzen
   (Aufgabe 1e). Fällt der Parameter weg → Browser-/Default-Sprache.
3. Optional einen schlanken Plixa-Kopf (Wortmarke + „zurück zu Plixa") oben
   einblenden, damit der Übergang nahtlos wirkt.

**Plixa-Seite (Repo `michherm/plixa`, macht Claude dort):** Vercel-`rewrite`
`/innenausbau/:path*` → auf die Editor-Deployment-URL; Menüpunkt „Innenausbau"
im Konfigurator/der Landing, der mit `?lng=<aktuelle Sprache>` verlinkt.
→ Diese Seite NICHT hier im Fork bauen; sie ist nur zur Info, damit die
`basePath`/`?lng`-Verträge zusammenpassen.

**Vertrag (beide Seiten müssen übereinstimmen):**
- Pfad-Präfix: **`/innenausbau`**
- Sprach-Parameter: **`?lng=<de|fr|en|pl|it|es|nl|pt|cs|sv|da|ro>`**

---

## Wichtige Regeln (aus Plixa CLAUDE.md)
- Keine eigenmächtigen Umbauten; nur das Angefragte.
- Bestand schützen: Pascals Funktionen/Namen/Schnittstellen erhalten.
- Kleine, erklärte Schritte; bei Unklarheit fragen, nicht raten.
- Modell-ID nie in Commits/PRs schreiben.

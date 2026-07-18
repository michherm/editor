# Urheberschaft & Zeitnachweis — Plixa-Anteil

© 2025–2026 HERRMANN SARL (Michael Herrmann). Alle Rechte vorbehalten.
Kontakt: mh.solarkraftwerk@gmail.com

Dieses Dokument hält fest, welcher Anteil dieses Repositories von HERRMANN SARL
stammt, wie er entstanden ist und wie sich die Urheberschaft belegen lässt.

## Was geschützt ist (Plixa-Anteil)

Die **Plixa-Schicht**, aufgebaut auf dem quelloffenen Pascal-Editor (MIT, Pascal
Group Inc. — siehe `/LICENSE`). Eigenleistung von HERRMANN SARL, u. a.:

- **Plixa-Anwendung** `apps/editor/**`: Branding, Willkommens-/Hilfe-Führung,
  Sprachumschaltung (12 Sprachen), Panels.
- **Hin-/Rückweg-Übergabe** (Plixa ↔ Editor): `lib/ifc-handoff.ts`,
  `components/back-to-plixa-button.tsx`, Server-Routen unter `app/api/**`
  (IFC-Proxy, Handoff-Session, Ergebnis-Upload), inkl. iframe-Einbettung
  (`embed=1`) und `postMessage`-Protokoll (`plixa-editor:result/ready`).
- **Kalkulation** `lib/calc/**`: Aufbau-/Mengen-Rezepte, Kosten-/Mengenlogik,
  Flächen-Belegung — die geschäftlich wertvollste Eigenleistung.
- **Flächen-Manifest** `lib/surfaces.ts`, `lib/surfaces-store.ts`.
- **Plugins** `@plixa/stairs`, `@plixa/ai` (KI-Chat) und deren Server-Route.

## Was NICHT HERRMANN SARL gehört

Der quelloffene Unterbau `@pascal-app/{core,viewer,editor,nodes,mcp}` und alle
`node_modules`-Abhängigkeiten. Diese stehen unter ihren eigenen (Open-Source-)
Lizenzen; deren Urhebervermerke bleiben unberührt. Details: `LICENSING.md`.

## Entstehungszeitraum

- Entwicklung der Plixa-Schicht: 2025–2026.
- Der **maßgebliche Zeitnachweis ist die Git-History** dieses Repositories:
  jeder Commit trägt Autor und Zeitstempel. `git log --follow <datei>` zeigt die
  Entstehung jeder Datei; die Copyright-Header und Herkunftsmarker wurden mit
  datiertem Commit gesetzt.

## Verwendete Technologien

Next.js (App Router), React, TypeScript, Three.js / React-Three-Fiber, Turborepo,
bun; Hosting auf Vercel, Objektspeicher Cloudflare R2; KI über die Anthropic-API
(serverseitig). 

## Herkunftsmarker (Wasserzeichen)

Über die Plixa-Dateien sind statistisch eindeutige Marker verteilt. Ihre genaue
Lage ist **vertraulich** in `FORENSIK.md` dokumentiert (nicht im Repository —
siehe `.gitignore`). Zusätzlich schreibt die App beim Start einen passiven
Copyright-Hinweis in die Browser-Konsole (`lib/provenance.ts`, kein Netzwerk-
Zugriff).

## Belegkette im Streitfall

1. Herkunftsmarker im fremden Code nachweisen (Werte aus `FORENSIK.md`).
2. Git-History als Zeitnachweis vorlegen.
3. `apps/editor/LICENSE` (proprietär) + Copyright-Header als Rechtsgrundlage.

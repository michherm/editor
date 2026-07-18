# Phase 2 — Server-Migration (Plan, noch NICHT umgesetzt)

Ziel: die wertvollste Geschäftslogik so verlagern, dass sie im Browser **nicht**
mehr lesbar ist, sondern nur noch als API-Aufruf sichtbar wird. Ehrliche
Einordnung vorweg:

- **Der größte Schutz ist nicht Code-Verlagerung, sondern das private Repo.**
  Solange `apps/editor/**` in einem öffentlichen Repo liegt, ist jede
  Client→Server-Migration wirkungslos (der Code steht ohnehin offen auf GitHub).
  **Repo auf privat stellen** ist Voraussetzung.
- Migration lohnt v. a., **sobald echte Preise** in `lib/calc` stehen. Solange
  `unitPriceEur` leer ist, ist der Schutzgewinn gering.

## Kandidaten (nach Schutzwert)

| Was | Datei(en) | Schutzwert | Aufwand | Risiko | Vorschlag API |
|---|---|---|---|---|---|
| **Kalkulation** (Rezepte + Mengen/Kosten) | `lib/calc/finishes.ts`, `calculate.ts` | **Hoch** (mit Preisen) | Mittel | Mittel | `POST /api/calc` → `{ assignments, surfaces }` ⇒ `{ items[], totals }` |
| Flächen-Manifest-Verarbeitung | `lib/surfaces.ts` | Mittel | Klein | Klein | schon serverseitig denkbar: `GET /api/surfaces?src=…` |
| Handoff-Session-Aufbau | `back-to-plixa-button.tsx` | Gering | — | — | bereits serverseitig (`/api/handoff-session`) |

## Empfohlener erster Schritt: `POST /api/calc`

**Signatur**
```
POST /api/calc
Body:  { surfaces: {id, kind, areaM2}[], assignments: Record<surfaceId, finishId> }
Res:   { positions: {key,label,unit,qty,unitPriceEur?,sumEur?}[], totalEur? }
```

**Vorgehen (risikoarm, in dieser Reihenfolge):**
1. `finishes.ts` (Rezepte, inkl. künftiger Preise) **nur** noch serverseitig
   halten (`app/api/calc/route.ts` importiert sie; nicht mehr aus Client-Code).
2. `calc-panel.tsx` ruft `POST /api/calc` statt der lokalen Berechnung.
3. Client behält nur noch Anzeige-Typen, **keine** Rezepte/Preise.
4. Rate-Limit auf `/api/calc` (siehe unten).

**Risiko:** Die Kalkulation läuft heute rein im Browser (offline-fähig, sofort).
Nach der Migration braucht sie einen Server-Roundtrip → minimal langsamer, und
die Offline-Fähigkeit entfällt. Funktional identisch, wenn die Formeln 1:1
übernommen werden. Deshalb als eigener, testbarer Schritt — **nicht** nebenbei.

## Rate Limiting (gegen Abschöpfen)

Vercel-Serverless hat **keinen** geteilten Speicher zwischen Aufrufen — ein
In-Memory-Limiter ist wirkungslos. Sauber nur mit externem Zähler:
- **Vercel Firewall / Rate Limiting** (Projekt-Einstellung, kein Code), oder
- **Upstash Ratelimit** (`@upstash/ratelimit` + Upstash Redis), pro IP/Route.

Empfehlung: für `/api/calc`, `/api/ai/chat`, `/api/handoff-*` je ein moderates
Limit (z. B. 30–60 Anfragen/Minute/IP). Bewusst NICHT als Fake-In-Memory-Limiter
umgesetzt — das wäre Aufwand ohne Schutz.

## Obfuskation — ehrliche Einschätzung

Für eine Next.js-App bringt echte JS-Obfuskation **wenig** und ist riskant
(Build-Bruch, Debugging-Hölle). Der Code wird ohnehin minifiziert; Source Maps
sind aus. Solange das Repo öffentlich ist, ist Obfuskation ohnehin sinnlos.
**Empfehlung: keine Obfuskation.** Statt dessen: privates Repo + Server-Migration
der wertvollen Logik + juristische Absicherung (Lizenz, Wasserzeichen).

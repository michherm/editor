'use client'
/*
 * © 2025–2026 HERRMANN SARL (Michael Herrmann). Alle Rechte vorbehalten.
 * Proprietär — keine Nutzung/Vervielfältigung/Bearbeitung/Dekompilierung ohne
 * schriftliche Genehmigung. Siehe apps/editor/LICENSE. Kontakt: mh.solarkraftwerk@gmail.com
 */

/**
 * Hinweg-Übergabe (Plixa → Editor): liest `?ifc=<r2-url>` (und optional
 * `&geo=<r2-url>`) aus der URL, holt die Dateien über den Same-Origin-Proxy
 * (`/api/ifc`) und liefert einen Pascal-Szenengraphen zurück.
 *
 * Zwei Wege:
 *  - `?ifc=` → mit `convertIfcToPascal` in editierbare Knoten (Wände/Öffnungen/
 *    Dach) umgesetzt. Das ist der Bearbeitungs-Layer.
 *  - `&geo=` (Weg B) → ein binäres GLB mit der EXAKTEN, maßstabsgetreuen
 *    Plixa-Geometrie (1 Einheit = 1 m, Y-up, nicht gespiegelt). Liegt es an, wird
 *    es als `ItemNode` (bedingungslos gerendertes GLB-Modell, 1 Einheit = 1 m) in
 *    die Szene gelegt und ist die ANGEZEIGTE Geometrie — deckungsgleich per
 *    Konstruktion, weil es dieselbe Mesh ist, die Plixa rendert (nichts wird
 *    rekonstruiert). Der parametrische IFC-Nachbau wird dann ausgeblendet (bleibt
 *    als editierbare Knoten erhalten). Fehlt `&geo=`, rendert der parametrische
 *    Nachbau wie bisher.
 *
 * Warum `ItemNode` statt `ScanNode`? Die Sichtbarkeit einer ScanNode hängt am
 * `showScans`-Schalter des Viewers (scan-system) und ist privacy-gated — als
 * „die angezeigte Hausgeometrie" also fragil. Ein Item rendert sein GLB
 * bedingungslos in nativem Maßstab (Clone mit scale = asset.scale × node.scale;
 * `dimensions` skaliert das Modell NICHT, steuert nur Gizmo/Grundriss).
 *
 * Bewusst als `Editor`-`onLoad`-Funktion gebaut: der Editor lädt sein Ergebnis
 * über den normalen Lade-Lebenszyklus (`applySceneGraphToEditor`), es landet also
 * im gleichen Store, den der Editor rendert.
 */
import { ItemNode } from '@pascal-app/core'
import type { SceneGraph } from '@pascal-app/editor'
import { type FinishAssignments, hydrateFinishes, resetFinishes } from './calc/finishes-store'

/** Liest die IFC-URL aus dem Query-String (nur im Browser). */
export function readIfcHandoffUrl(): string | null {
  return readParam('ifc')
}

/** Liest die exakte-Geometrie-URL (`&geo=<glb>`) aus dem Query-String. */
export function readGeoHandoffUrl(): string | null {
  return readParam('geo')
}

/**
 * Liest die Fortsetzungs-URL (`&session=<https-url>`). NUR wenn Plixa diese
 * explizit anhängt, setzt der Editor die zuvor gespeicherte Bearbeitung fort
 * (er lädt den Szenenstand von genau dieser URL). Fehlt `session`, gewinnt IMMER
 * die frische `ifc`/`geo`-Übergabe — ein eigener zwischengespeicherter Stand darf
 * das frische Plixa-Haus dann NIE überschreiben. Nur `https` wird akzeptiert.
 */
export function readSessionHandoffUrl(): string | null {
  const raw = readParam('session')
  if (!raw) return null
  try {
    return new URL(raw).protocol === 'https:' ? raw : null
  } catch {
    return null
  }
}

/**
 * Liest die stabile Projekt-ID (`&project=<uuid>`). Plixa hängt sie über alle
 * „Gestalten"-Aufrufe DESSELBEN Projekts unverändert an. Wird AUSSCHLIESSLICH
 * benutzt, um die Sitzungs-Datei beim Rückweg projektgebunden in R2 abzulegen
 * (`session/<project>/…`). NICHT für die Cache-Fortsetzung — die läuft allein
 * über `&session=` (siehe `readSessionHandoffUrl`).
 */
export function readProjectHandoffId(): string | null {
  return readParam('project')
}

/**
 * Liest die Flächen-Manifest-URL (`&surfaces=<https-json-url>`). Plixa liefert
 * darin für jede belegbare Hausfläche (Dach/Wand/Boden/Decke) Art, exakte m² und
 * Umriss — Grundlage fürs Anklicken einzelner Flächen und die Kalkulation. Nur
 * `https` wird akzeptiert.
 */
export function readSurfacesHandoffUrl(): string | null {
  const raw = readParam('surfaces')
  if (!raw) return null
  try {
    return new URL(raw).protocol === 'https:' ? raw : null
  } catch {
    return null
  }
}

/**
 * Erkennt die Einbettung (`&embed=1`). Plixa bettet den Editor als Vollbild-iframe
 * ein statt wegzunavigieren. Ist das gesetzt, wird der Rückweg NICHT über eine
 * Navigation zu `?result=` gemacht, sondern per `postMessage` ans Elternfenster
 * (siehe back-to-plixa-button). Das LADEN bleibt unverändert (ifc/geo/session/…).
 */
export function readEmbedFlag(): boolean {
  return readParam('embed') === '1'
}

/**
 * Bestimmt das Ziel-Origin fürs `postMessage` an das einbettende Plixa-Fenster.
 * Nimmt das Origin der `return`-URL (die genaue Plixa-Adresse, auf der der Nutzer
 * plant) und lässt — wie beim CSP `frame-ancestors` — nur `https`-`*.vercel.app`
 * oder lokales `localhost`/`127.0.0.1` zu; sonst der `document.referrer` als
 * zweite Quelle. Bewusst NICHT `'*'` (kein Streuen der R2-URLs an fremde Origins).
 * Fällt nichts Gültiges an, `null` → der Aufrufer nutzt den Konfigurator-Origin.
 */
export function resolvePlixaParentOrigin(): string | null {
  if (typeof window === 'undefined') return null
  const isAllowed = (u: URL): boolean => {
    const host = u.hostname.toLowerCase()
    if (u.protocol === 'https:') return host === 'vercel.app' || host.endsWith('.vercel.app')
    if (u.protocol === 'http:') return host === 'localhost' || host === '127.0.0.1'
    return false
  }
  const candidates = [readParam('return'), window.document.referrer || null]
  for (const raw of candidates) {
    if (!raw) continue
    try {
      const u = new URL(raw)
      if (isAllowed(u)) return u.origin
    } catch {
      // ungültige URL — nächste Quelle probieren
    }
  }
  return null
}

function readParam(name: string): string | null {
  if (typeof window === 'undefined') return null
  const value = new URLSearchParams(window.location.search).get(name)
  return value && value.trim() ? value.trim() : null
}

// Alle eigenen zwischengespeicherten Szenen-/Auswahl-Stände des Editors. Der
// Szenen-Autosave (`pascal-editor-scene`) und die Auswahl (`pascal-editor-
// selection[:projectId]`) sind genau das, was beim erneuten Öffnen fälschlich
// das frische Haus überschreiben würde. `plixa-last-project` ist die veraltete
// Projekt-ID-Marke aus dem früheren Fortsetzungs-Mechanismus.
const STALE_SCENE_KEY_PREFIXES = ['pascal-editor-scene', 'pascal-editor-selection']
const OBSOLETE_KEYS = ['plixa-last-project']

/**
 * Verwirft JEDEN eigenen zwischengespeicherten Szenenstand (localStorage), egal
 * ob global, nach Projekt-ID oder nach geo-URL gekeyt. Wird beim frischen Aufbau
 * aus `ifc`/`geo` aufgerufen, damit der interne Cache das frische Plixa-Haus NIE
 * überschreibt. Bewusst KEIN Löschen der UI-Einstellungen (Sprache, Panels) —
 * nur der Szenen-/Auswahl-Cache.
 */
export function discardEditorCache(): void {
  // Flächen-Belegungen sind In-Memory — beim frischen Aufbau ebenfalls verwerfen,
  // damit nichts vom exakten Haus übrig bleibt.
  resetFinishes()
  if (typeof window === 'undefined') return
  try {
    const toRemove: string[] = []
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i)
      if (!key) continue
      if (STALE_SCENE_KEY_PREFIXES.some((p) => key.startsWith(p)) || OBSOLETE_KEYS.includes(key)) {
        toRemove.push(key)
      }
    }
    for (const key of toRemove) window.localStorage.removeItem(key)
  } catch {
    // Storage nicht verfügbar (Privatmodus o. ä.) — dann gibt es auch keinen
    // Cache, der gewinnen könnte.
  }
}

// Knoten mit sichtbarer Geometrie: werden ausgeblendet, sobald die exakte
// GLB-Geometrie vorliegt (sie bleiben für die Bearbeitung im Baum erhalten).
const GEOMETRY_NODE_TYPES = new Set([
  'wall',
  'roof',
  'roof-segment',
  'slab',
  'door',
  'window',
  'skylight',
  'column',
  'stair',
])

/**
 * Legt das exakte Plixa-GLB als `ItemNode` (immer sichtbares GLB-Modell,
 * 1 Einheit = 1 m) in die Szene und blendet den parametrischen Nachbau aus.
 *
 * Das Modell wird per AABB auf den XZ-Ursprung zentriert und mit der Basis auf
 * den Boden (y=0) der untersten Ebene gesetzt — unabhängig davon, an welcher
 * Bauplatz-Position (cx,cz) die Plixa-„house"-Gruppe stand. Ohne diese
 * Zentrierung könnte das Haus weit vom Ursprung (außerhalb des Sichtfelds)
 * landen. Als Item ist die Sichtbarkeit an KEINEN Schalter gekoppelt (anders als
 * bei einer ScanNode) und der Maßstab ist nativ (scale [1,1,1]).
 */
/**
 * Lädt das exakte-Geometrie-GLB. PRIMÄR direkt von R2 (die öffentliche
 * r2.dev-URL erlaubt GET-CORS für alle Origins) — das umgeht das Puffer-/
 * Größenlimit des Same-Origin-Proxys `/api/ifc` bei großen Häusern. Nur wenn der
 * Direktabruf scheitert (CORS/Netz), wird über den Proxy nachgeladen.
 */
/**
 * Übergabe-Datei (geo/ifc) PRIMÄR direkt von R2 laden (öffentliche r2.dev-URL,
 * GET-CORS) — spart den Proxy-Umweg und dessen Größenlimit. Nur wenn der
 * Direktabruf scheitert (CORS/Netz), über den Same-Origin-Proxy `/api/ifc`.
 *
 * KEIN no-store: Plixa vergibt inhaltsbezogene URLs (geänderter Inhalt = neue
 * URL), der Browser darf also nach URL cachen — beschleunigt Reload/Wiederaufruf,
 * und beim geo-GLB bedient der Cache den zweiten Abruf des Item-Renderers
 * (useGLTF), statt die große Datei doppelt zu ziehen.
 */
async function fetchHandoffArrayBuffer(url: string, label: string): Promise<ArrayBuffer> {
  try {
    const direct = await fetch(url)
    if (direct.ok) return await direct.arrayBuffer()
    console.warn(`[plixa ${label}] Direkt-Abruf R2 nicht ok (HTTP ${direct.status}) → Proxy-Fallback`)
  } catch (e) {
    console.warn(`[plixa ${label}] Direkt-Abruf R2 fehlgeschlagen (CORS/Netz) → Proxy-Fallback`, e)
  }
  const res = await fetch(`/api/ifc?u=${encodeURIComponent(url)}`)
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`${label}-Download fehlgeschlagen (${res.status}) ${detail}`.trim())
  }
  return res.arrayBuffer()
}

function fetchGeoGlb(geoUrl: string): Promise<ArrayBuffer> {
  return fetchHandoffArrayBuffer(geoUrl, 'geo')
}

/**
 * Die exakte AABB (Zentrum, Größe, Bodenhöhe) aus dem TATSÄCHLICH geladenen GLB
 * messen. GLTFLoader baut den Szenengraphen mit allen Knoten-Matrizen → Box3
 * misst echte Weltmeter. Meshopt-Decoder aktivieren (die geo-GLB ist komprimiert).
 * Selbst-gemessen = garantiert deckungsgleich; Plixas `&geobbox=` wird bewusst
 * NICHT zum Positionieren genutzt (schon kleine Abweichungen versetzen das Haus).
 */
async function measureGeoAabb(
  buf: ArrayBuffer,
): Promise<{ center: [number, number, number]; size: [number, number, number]; minY: number }> {
  const [{ GLTFLoader }, three, { MeshoptDecoder }] = await Promise.all([
    import('three/examples/jsm/loaders/GLTFLoader.js'),
    import('three'),
    import('three/examples/jsm/libs/meshopt_decoder.module.js'),
  ])
  const loader = new GLTFLoader()
  loader.setMeshoptDecoder(MeshoptDecoder)
  const gltf = await new Promise<{ scene: unknown }>((resolve, reject) => {
    loader.parse(buf.slice(0), '', (g: { scene: unknown }) => resolve(g), reject)
  })
  const box = new three.Box3().setFromObject(gltf.scene)
  const size = new three.Vector3()
  const center = new three.Vector3()
  box.getSize(size)
  box.getCenter(center)
  return { center: [center.x, center.y, center.z], size: [size.x, size.y, size.z], minY: box.min.y }
}

/**
 * Beim Wiederherstellen einer Sitzung das exakte-Haus-Item auf ORIGINAL-Welt-
 * koordinaten setzen (Position [0,0,0]). Frühere Versionen haben das Haus zentriert
 * gespeichert (auf den Nullpunkt verschoben) — dadurch kamen platzierte Objekte beim
 * Rückweg (?result=) versetzt bei Plixa an. Das Haus NICHT zu verschieben hält den
 * Editor-Frame identisch mit den Plixa-Weltkoordinaten. Synchron (kein Neu-Laden).
 */
function resetExactHousePosition(nodes: Record<string, unknown>): void {
  const house = Object.values(nodes).find(
    (n) =>
      (n as { type?: string }).type === 'item' &&
      (n as { asset?: { id?: string } }).asset?.id === 'plixa-exact-house',
  ) as { position?: unknown } | undefined
  if (house) house.position = [0, 0, 0]
}

async function attachExactGeometry(
  nodes: Record<string, unknown>,
  geoUrl: string,
  buf: ArrayBuffer,
  onProgress?: (message: string, percent: number) => void,
): Promise<void> {
  onProgress?.('Exakte Geometrie …', 92)
  console.info(`[plixa geo] GLB geladen: ${(buf.byteLength / 1e6).toFixed(1)} MB`)

  // Das Haus wird NICHT verschoben — es bleibt in seinen ORIGINAL-Weltkoordinaten
  // (Item-Position [0,0,0], das GLB rendert an seinen nativen Koordinaten). Grund:
  // platzierte Objekte müssen im SELBEN Frame wie die gelieferte geo-GLB liegen,
  // sonst kommen sie beim Rückweg (?result=) um die BBox-Mitte (~halbe Hausbreite)
  // versetzt bei Plixa an. Wir messen Größe UND Weltzentrum: die Größe fürs Gizmo/
  // Grundriss, das Zentrum NUR fürs Kamera-Einrahmen (NICHT zum Verschieben).
  const { center, size } = await measureGeoAabb(buf)
  console.info(
    `[plixa geo] Größe (m): ${size[0].toFixed(1)} × ${size[1].toFixed(1)} × ${size[2].toFixed(1)}`,
  )

  // Das ECHTE Welt-Footprint des gerenderten GLB (XZ) als Knoten-Metadaten
  // hinterlegen. Da das Item auf [0,0,0] steht, das Mesh aber an seinen nativen
  // Weltkoordinaten (Zentrum ~halbe Hausbreite vom Ursprung) rendert, kann die
  // Auto-Einrahmung (computeSceneBoundsXZ) die Hauslage NICHT aus dem Graphen
  // ableiten — sie würde eine winzige Box am Ursprung einrahmen (Haus „viel zu
  // extrem"). Über `metadata.worldBoundsXZ` erhält sie das wahre Rechteck. Die
  // Metadaten wandern in die Sitzung mit → auch „weiter-editieren" rahmt korrekt.
  const worldBoundsXZ = {
    min: [center[0] - size[0] / 2, center[2] - size[2] / 2] as [number, number],
    max: [center[0] + size[0] / 2, center[2] + size[2] / 2] as [number, number],
  }

  type Levelish = {
    type?: string
    id?: string
    children?: string[]
    elevation?: number
    metadata?: { elevation?: number }
  }
  const all = Object.values(nodes) as Levelish[]
  const levels = all.filter((n) => n.type === 'level')
  const elevationOf = (l: Levelish): number => l.elevation ?? l.metadata?.elevation ?? 0
  const ground = levels.sort((a, b) => elevationOf(a) - elevationOf(b))[0]

  const item = ItemNode.parse({
    name: 'Plixa Haus (exakt)',
    // NICHT verschieben: Original-Weltkoordinaten der geo-GLB beibehalten, damit
    // platzierte Objekte im selben Frame liegen und der Rückweg exakt überlagert.
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    parentId: ground?.id ?? null,
    // metadata.worldBoundsXZ: wahres Welt-Footprint fürs Kamera-Einrahmen (siehe
    // oben) — rein informativ, beeinflusst das Rendering NICHT.
    // metadata.backdrop: Das exakte Haus ist eine STATISCHE Referenz-Geometrie,
    // kein Möbelstück. Ohne diese Markierung zählt sein riesiges Grundriss-
    // Rechteck (die ganze Hausausdehnung) als Boden-Kollision → man könnte NICHTS
    // im/ums Haus ablegen (Pflanze, Ball, Bett bleiben am Cursor kleben). Als
    // Backdrop nimmt es weder an Boden-Kollision noch am Ebenen-Lift teil.
    metadata: { worldBoundsXZ, backdrop: true },
    asset: {
      id: 'plixa-exact-house',
      category: 'building',
      name: 'Plixa Haus (exakt)',
      thumbnail: '',
      // Direkte R2-`https`-URL als Modellquelle — NICHT via saveAsset (asset://),
      // denn der Item-Renderer lädt über `useGLTF(resolveCdnUrl(src))`, und
      // resolveCdnUrl löst `asset://` NICHT auf → useGLTF bekäme keine ladbare URL
      // und der Renderer fiele auf die Drahtgitter-Platzhalterbox zurück. Eine
      // http(s)-URL reicht resolveCdnUrl durch; useGLTF lädt sie direkt von R2.
      src: geoUrl,
      dimensions: size,
    },
  })
  ;(nodes as Record<string, unknown>)[item.id] = item
  if (ground) ground.children = [...(ground.children ?? []), item.id]

  // Sichtbare Geometrie kommt jetzt aus dem GLB → parametrischen Nachbau
  // ausblenden (Knoten bleiben editierbar).
  for (const n of all) {
    if (n.type && GEOMETRY_NODE_TYPES.has(n.type)) {
      ;(n as { visible?: boolean }).visible = false
    }
  }
}

/**
 * Baut die `onLoad`-Funktion für den Editor. `convertIfcToPascal` wird erst beim
 * Aufruf dynamisch geladen (zieht die `web-ifc`-WASM), damit der Editor ohne
 * Übergabe nicht damit belastet wird.
 */
export function createIfcOnLoad(
  ifcUrl: string,
  geoUrl: string | null,
  onProgress?: (message: string, percent: number) => void,
  onError?: (message: string) => void,
): () => Promise<SceneGraph> {
  return async () => {
    // Die großen, unabhängigen Arbeiten SOFORT und PARALLEL anstoßen, damit sie
    // sich mit dem IFC-Laden/Umrechnen überlappen (statt nacheinander):
    //  - der große geo-GLB-Download (der größte Brocken)
    //  - das ifc-converter-Modul (zieht die web-ifc-WASM)
    const geoBufPromise: Promise<ArrayBuffer | null> = geoUrl
      ? fetchGeoGlb(geoUrl).catch((e) => {
          console.error('[plixa geo] Vorab-Download fehlgeschlagen — parametrischer Nachbau:', e)
          return null
        })
      : Promise.resolve(null)
    const converterPromise = import('@pascal-app/ifc-converter')
    // Handler anhängen, damit ein evtl. Fehler nicht als „unhandled rejection"
    // gilt, falls der Ablauf vorher abbricht — awaited wird unten regulär.
    converterPromise.catch(() => {})

    try {
      onProgress?.('Lade IFC …', 2)
      // Hebel 4: die IFC direkt von R2 holen (Plixa liefert sie als öffentliche
      // r2.dev-URL) — nur bei CORS/Netz-Fehler über den Proxy. Spart den Umweg.
      const buf = await fetchHandoffArrayBuffer(ifcUrl, 'IFC')

      const { convertIfcToPascal } = await converterPromise
      const graph = await convertIfcToPascal(new Uint8Array(buf), onProgress)

      // Konvertierung „erfolgreich", aber ohne Knoten → für den Nutzer eine leere
      // Szene. Als Fehler behandeln, damit es sichtbar wird statt still leer.
      if (!graph.rootNodeIds || graph.rootNodeIds.length === 0) {
        throw new Error('Die IFC-Datei enthielt keine konvertierbaren Elemente.')
      }

      const nodes = graph.nodes as Record<string, unknown>

      // Weg B: exakte GLB-Geometrie anzeigen (parallel vorgeladen), parametrischen
      // Nachbau ausblenden. Position/Maße werden aus dem geladenen Modell selbst
      // gemessen (deckungsgleich). Schlägt das GLB fehl (geoBuf = null), bleibt der
      // parametrische Nachbau sichtbar (robuster Fallback).
      if (geoUrl) {
        try {
          const geoBuf = await geoBufPromise
          if (geoBuf) await attachExactGeometry(nodes, geoUrl, geoBuf, onProgress)
        } catch (geoErr) {
          console.error(
            '[plixa handoff] Exakte Geometrie (GLB) fehlgeschlagen — nutze parametrischen Nachbau:',
            geoErr,
          )
        }
      }

      return {
        nodes,
        rootNodeIds: graph.rootNodeIds as string[],
        collections: graph.collections as Record<string, unknown> | undefined,
      }
    } catch (err) {
      // Der Editor verschluckt onLoad-Fehler (fällt auf eine leere Szene zurück).
      // Deshalb hier explizit protokollieren und nach oben melden, damit der
      // Nutzer den genauen Grund sieht, statt eines stillen leeren Editors.
      const message = err instanceof Error ? err.message : String(err)
      console.error('[plixa handoff] IFC-Import fehlgeschlagen:', err)
      onError?.(message)
      throw err
    }
  }
}

/**
 * Baut die `onLoad`-Funktion für die FORTSETZUNG (`&session=<https-url>`): lädt
 * den zuvor gespeicherten Szenenstand (JSON-Szenengraph mit `nodes`/`rootNodeIds`)
 * von genau dieser URL und stellt ihn wieder her. Das ist der EINZIGE Weg, auf dem
 * ein gespeicherter Stand geladen wird — ohne gültige `session` gewinnt immer die
 * frische `ifc`/`geo`-Übergabe.
 *
 * Primär direkt (die öffentliche R2-`https`-URL erlaubt GET-CORS); scheitert das
 * (CORS/Netz), über den Same-Origin-Proxy `/api/ifc`.
 */
export function createSessionOnLoad(
  sessionUrl: string,
  onProgress?: (message: string, percent: number) => void,
  onError?: (message: string) => void,
): () => Promise<SceneGraph> {
  return async () => {
    try {
      onProgress?.('Lade gespeicherte Bearbeitung …', 40)
      let text: string
      try {
        const direct = await fetch(sessionUrl, { cache: 'no-store' })
        if (!direct.ok) throw new Error(`HTTP ${direct.status}`)
        text = await direct.text()
      } catch (directErr) {
        console.warn('[plixa session] Direkt-Abruf fehlgeschlagen → Proxy-Fallback', directErr)
        const res = await fetch(`/api/ifc?u=${encodeURIComponent(sessionUrl)}`, {
          cache: 'no-store',
        })
        if (!res.ok) throw new Error(`Sitzungs-Download fehlgeschlagen (${res.status})`)
        text = await res.text()
      }

      const parsed = JSON.parse(text) as Partial<SceneGraph> & {
        plixaFinishes?: FinishAssignments
      }
      if (!parsed || typeof parsed !== 'object' || !parsed.nodes || !parsed.rootNodeIds?.length) {
        throw new Error('Gespeicherte Bearbeitung ist leer oder ungültig.')
      }
      // Flächen-Belegungen (Dachziegel/Tapete/…) aus der Sitzung wiederherstellen.
      hydrateFinishes(parsed.plixaFinishes)
      // Das exakte Haus auf Original-Weltkoordinaten [0,0,0] setzen (gespeicherte,
      // evtl. zentrierte Position nicht vertrauen) — hält den Frame Plixa-konform.
      resetExactHousePosition(parsed.nodes as Record<string, unknown>)
      onProgress?.('Bearbeitung wiederhergestellt', 100)
      return {
        nodes: parsed.nodes,
        rootNodeIds: parsed.rootNodeIds,
        collections: parsed.collections,
        materials: parsed.materials,
      }
    } catch (err) {
      // Anders als beim frischen Aufbau NICHT still auf den lokalen Cache
      // zurückfallen (der könnte veraltet sein) — den Fehler sichtbar melden.
      const message = err instanceof Error ? err.message : String(err)
      console.error('[plixa session] Fortsetzung fehlgeschlagen:', err)
      onError?.(message)
      throw err
    }
  }
}

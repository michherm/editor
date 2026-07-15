'use client'

/**
 * Hinweg-Übergabe (Plixa → Editor): liest `?ifc=<r2-url>` (und optional
 * `&geo=<r2-url>`) aus der URL, holt die Dateien über den Same-Origin-Proxy
 * (`/api/ifc`) und liefert einen Pascal-Szenengraphen zurück.
 *
 * Zwei Wege:
 *  - `?ifc=` → mit `convertIfcToPascal` in editierbare Knoten (Wände/Öffnungen/
 *    Dach) umgesetzt. Das ist der Bearbeitungs-Layer.
 *  - `&geo=` (Weg B) → ein binäres GLB mit der EXAKTEN, maßstabsgetreuen
 *    Plixa-Geometrie (1 Einheit = 1 m, Y-up, Plixa-Weltkoordinaten, nicht
 *    gespiegelt). Liegt es an, wird es als ScanNode (Referenzmodell) in die Szene
 *    gelegt und als ANGEZEIGTE Geometrie verwendet; der parametrische IFC-Nachbau
 *    wird dann ausgeblendet (bleibt aber als editierbare Knoten erhalten). Fehlt
 *    `&geo=`, rendert der parametrische Nachbau wie bisher.
 *
 * Bewusst als `Editor`-`onLoad`-Funktion gebaut: der Editor lädt sein Ergebnis
 * über den normalen Lade-Lebenszyklus (`applySceneGraphToEditor`), es landet also
 * im gleichen Store, den der Editor rendert.
 */
import { ScanNode, saveAsset } from '@pascal-app/core'
import type { SceneGraph } from '@pascal-app/editor'

/** Liest die IFC-URL aus dem Query-String (nur im Browser). */
export function readIfcHandoffUrl(): string | null {
  return readParam('ifc')
}

/** Liest die exakte-Geometrie-URL (`&geo=<glb>`) aus dem Query-String. */
export function readGeoHandoffUrl(): string | null {
  return readParam('geo')
}

function readParam(name: string): string | null {
  if (typeof window === 'undefined') return null
  const value = new URLSearchParams(window.location.search).get(name)
  return value && value.trim() ? value.trim() : null
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
 * Legt das exakte Plixa-GLB als Referenz-`ScanNode` in die Szene und blendet den
 * parametrischen Nachbau aus. Das GLB steht in Plixa-Weltkoordinaten (Y-up,
 * 1 Einheit = 1 m, nicht gespiegelt) — dieselben Koordinaten, in denen der
 * un-gespiegelte IFC-Import seine Knoten baut. Als Kind der Erdgeschoss-Ebene
 * (Elevation 0) fällt die Ebenen-Transformation weg, sodass `position [0,0,0]`
 * das Modell 1:1 über die editierbaren Knoten legt.
 */
async function attachExactGeometry(
  nodes: Record<string, unknown>,
  geoUrl: string,
  onProgress?: (message: string, percent: number) => void,
): Promise<void> {
  onProgress?.('Lade exakte Geometrie …', 92)
  const res = await fetch(`/api/ifc?u=${encodeURIComponent(geoUrl)}`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`GLB-Download fehlgeschlagen (${res.status})`)
  const buf = await res.arrayBuffer()
  const file = new File([buf], 'plixa-haus.glb', { type: 'model/gltf-binary' })
  const assetUrl = await saveAsset(file)

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

  const scan = ScanNode.parse({
    name: 'Plixa (exakte Geometrie)',
    url: assetUrl,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: 1,
    opacity: 100,
    parentId: ground?.id ?? null,
  })
  ;(nodes as Record<string, unknown>)[scan.id] = scan
  if (ground) ground.children = [...(ground.children ?? []), scan.id]

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
    try {
      onProgress?.('Lade IFC …', 2)
      const res = await fetch(`/api/ifc?u=${encodeURIComponent(ifcUrl)}`, { cache: 'no-store' })
      if (!res.ok) {
        const detail = await res.text().catch(() => '')
        throw new Error(`IFC-Download fehlgeschlagen (${res.status}) ${detail}`.trim())
      }
      const buf = await res.arrayBuffer()

      const { convertIfcToPascal } = await import('@pascal-app/ifc-converter')
      const graph = await convertIfcToPascal(new Uint8Array(buf), onProgress)

      // Konvertierung „erfolgreich", aber ohne Knoten → für den Nutzer eine leere
      // Szene. Als Fehler behandeln, damit es sichtbar wird statt still leer.
      if (!graph.rootNodeIds || graph.rootNodeIds.length === 0) {
        throw new Error('Die IFC-Datei enthielt keine konvertierbaren Elemente.')
      }

      const nodes = graph.nodes as Record<string, unknown>

      // Weg B: exakte GLB-Geometrie laden und anzeigen, parametrischen Nachbau
      // ausblenden. Schlägt das GLB fehl, bleibt der parametrische Nachbau
      // sichtbar (robuster Fallback statt leerer Szene).
      if (geoUrl) {
        try {
          await attachExactGeometry(nodes, geoUrl, onProgress)
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

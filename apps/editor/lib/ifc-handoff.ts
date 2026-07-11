'use client'

/**
 * Hinweg-Übergabe (Plixa → Editor): liest `?ifc=<r2-url>` aus der URL, holt die
 * IFC-Datei über den Same-Origin-Proxy (`/api/ifc`), konvertiert sie im Browser
 * mit `convertIfcToPascal` und liefert einen Pascal-Szenengraphen zurück.
 *
 * Bewusst als `Editor`-`onLoad`-Funktion gebaut: der Editor lädt sein Ergebnis
 * über den normalen Lade-Lebenszyklus (`applySceneGraphToEditor`), es landet also
 * im gleichen Store, den der Editor rendert — das Haus ist innen wie außen voll
 * bearbeitbar, ohne Wettlauf mit dem lokalen Autoload.
 */
import type { SceneGraph } from '@pascal-app/editor'

/** Liest die IFC-URL aus dem Query-String (nur im Browser). */
export function readIfcHandoffUrl(): string | null {
  if (typeof window === 'undefined') return null
  const value = new URLSearchParams(window.location.search).get('ifc')
  return value && value.trim() ? value.trim() : null
}

/**
 * Baut die `onLoad`-Funktion für den Editor. `convertIfcToPascal` wird erst beim
 * Aufruf dynamisch geladen (zieht die `web-ifc`-WASM), damit der Editor ohne
 * Übergabe nicht damit belastet wird.
 */
export function createIfcOnLoad(
  ifcUrl: string,
  onProgress?: (message: string, percent: number) => void,
): () => Promise<SceneGraph> {
  return async () => {
    onProgress?.('Lade IFC …', 2)
    const res = await fetch(`/api/ifc?u=${encodeURIComponent(ifcUrl)}`, { cache: 'no-store' })
    if (!res.ok) {
      throw new Error(`IFC-Download fehlgeschlagen: ${res.status}`)
    }
    const buf = await res.arrayBuffer()

    const { convertIfcToPascal } = await import('@pascal-app/ifc-converter')
    const graph = await convertIfcToPascal(new Uint8Array(buf), onProgress)

    return {
      nodes: graph.nodes as Record<string, unknown>,
      rootNodeIds: graph.rootNodeIds as string[],
      collections: graph.collections as Record<string, unknown> | undefined,
    }
  }
}

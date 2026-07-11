'use client'

/**
 * Lokaler GLB/GLTF-Upload (freies Programm, keine Serverspeicherung nötig).
 *
 * Pascals `SitePanel` ruft für hochgeladene 3D-Modelle (.glb/.gltf) den Callback
 * `onUploadAsset` auf — ohne den passiert nichts, deshalb wirkte der Upload
 * „gesperrt". Wir speichern die Datei stattdessen über Pascals lokalen
 * Asset-Store (`saveAsset`, IndexedDB) und legen einen ScanNode an, genau wie es
 * `createLocalGuideImage` für Bilder tut. So kann jeder eigene Modelle laden und
 * bearbeiten, ohne Backend.
 */
import { type AnyNodeId, ScanNode, saveAsset, useScene } from '@pascal-app/core'

function scanName(filename: string): string {
  const trimmed = filename.trim().replace(/\.(glb|gltf)$/i, '')
  return trimmed || 'Modell'
}

export async function uploadLocalScan(file: File, levelId: string): Promise<void> {
  const url = await saveAsset(file)
  const scan = ScanNode.parse({
    name: scanName(file.name),
    url,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: 1,
    opacity: 100,
  })
  useScene.getState().createNode(scan, levelId as AnyNodeId)
}

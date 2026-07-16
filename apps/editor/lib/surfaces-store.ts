'use client'

/**
 * Flächen-Store: hält das geladene Plixa-Flächen-Manifest (Dach/Wände/Böden/
 * Decken mit Art, m² und Umriss) im Speicher, damit Panel und (später) die
 * 3D-Klickflächen es lesen können. Dependency-frei über `useSyncExternalStore`.
 *
 * Die Flächen kommen bei JEDEM „Gestalten" frisch über `&surfaces=` — sie sind
 * kein Cache, sondern die aktuelle Wahrheit von Plixa. Deshalb einfach setzen/
 * zurücksetzen, keine Persistenz.
 */
import { useSyncExternalStore } from 'react'
import type { ManifestSurface } from './surfaces'

type SurfacesSnapshot = { surfaces: ManifestSurface[]; loaded: boolean }

let snapshot: SurfacesSnapshot = { surfaces: [], loaded: false }
const listeners = new Set<() => void>()
function emit(): void {
  for (const listener of listeners) listener()
}

export function getSurfaces(): ManifestSurface[] {
  return snapshot.surfaces
}

export function setSurfaces(surfaces: ManifestSurface[]): void {
  snapshot = { surfaces, loaded: true }
  emit()
}

export function resetSurfaces(): void {
  if (!snapshot.loaded && snapshot.surfaces.length === 0) return
  snapshot = { surfaces: [], loaded: false }
  emit()
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback)
  return () => {
    listeners.delete(callback)
  }
}

function getSnapshot(): SurfacesSnapshot {
  return snapshot
}

/** React-Hook: { surfaces, loaded }. Stabile Referenz zwischen Änderungen. */
export function useSurfaces(): SurfacesSnapshot {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

'use client'
/*
 * © 2025–2026 HERRMANN SARL (Michael Herrmann). Alle Rechte vorbehalten.
 * Proprietär — keine Nutzung/Vervielfältigung/Bearbeitung/Dekompilierung ohne
 * schriftliche Genehmigung. Siehe apps/editor/LICENSE. Kontakt: mh.solarkraftwerk@gmail.com
 */

/**
 * Belegungs-Store: welche Fläche (surfaceId) hat welche Belegung (finishId).
 *
 * Bewusst ein winziger externer Store über Reacts `useSyncExternalStore` (keine
 * neue Abhängigkeit). Der Zustand ist IN-MEMORY; die Dauerhaftigkeit läuft über
 * den Session-Rückweg (die Belegungen werden in die Sitzungs-JSON geschrieben
 * und beim nächsten „Gestalten" per `hydrateFinishes` wiederhergestellt) — genau
 * wie die Szene selbst. Beim frischen `ifc`/`geo`-Aufbau werden sie mit dem
 * übrigen Cache verworfen (`resetFinishes`).
 */
import { useSyncExternalStore } from 'react'
import { calculateAssignments, type AggregatedResult, type SurfaceAssignment } from './calculate'
import type { ManifestSurface } from '../surfaces'

/** surfaceId → finishId. */
export type FinishAssignments = Record<string, string>

let assignments: FinishAssignments = {}
const listeners = new Set<() => void>()
function emit(): void {
  for (const listener of listeners) listener()
}

export function getFinishAssignments(): FinishAssignments {
  return assignments
}

export function setFinish(surfaceId: string, finishId: string): void {
  if (assignments[surfaceId] === finishId) return
  assignments = { ...assignments, [surfaceId]: finishId }
  emit()
}

export function clearFinish(surfaceId: string): void {
  if (!(surfaceId in assignments)) return
  const next = { ...assignments }
  delete next[surfaceId]
  assignments = next
  emit()
}

export function resetFinishes(): void {
  if (Object.keys(assignments).length === 0) return
  assignments = {}
  emit()
}

/** Belegungen aus einer Sitzung (Session-Rückweg) wiederherstellen. */
export function hydrateFinishes(next: FinishAssignments | null | undefined): void {
  assignments = next && typeof next === 'object' ? { ...next } : {}
  emit()
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback)
  return () => {
    listeners.delete(callback)
  }
}

/** React-Hook: reaktiver Zugriff auf die aktuelle Belegungs-Map. */
export function useFinishAssignments(): FinishAssignments {
  return useSyncExternalStore(subscribe, getFinishAssignments, getFinishAssignments)
}

/**
 * Belegungen + Flächen-Manifest → Kalkulations-Eingabe (surfaceId, finishId,
 * areaM2). Die m² kommen aus dem Manifest (die exakten Plixa-Werte). Belegungen
 * ohne passende Fläche werden übersprungen.
 */
export function assignmentsToCalcInput(
  currentAssignments: FinishAssignments,
  surfaces: ManifestSurface[],
): SurfaceAssignment[] {
  const areaById = new Map(surfaces.map((s) => [s.id, s.areaM2]))
  const input: SurfaceAssignment[] = []
  for (const [surfaceId, finishId] of Object.entries(currentAssignments)) {
    const areaM2 = areaById.get(surfaceId)
    if (areaM2 === undefined) continue
    input.push({ surfaceId, finishId, areaM2 })
  }
  return input
}

/** Bequemer Direktweg: aktuelle Belegungen gegen ein Manifest kalkulieren. */
export function calculateForSurfaces(
  currentAssignments: FinishAssignments,
  surfaces: ManifestSurface[],
): AggregatedResult {
  return calculateAssignments(assignmentsToCalcInput(currentAssignments, surfaces))
}

'use client'

/**
 * Flächen-Manifest (Plixa → Editor, `&surfaces=<https-json-url>`).
 *
 * Plixa kennt das Haus parametrisch und liefert deshalb zu JEDER belegbaren
 * Fläche Art, EXAKTE Fläche (m²) und Umriss. Damit kann der Editor einzelne
 * Flächen (Dach Süd, diese Wand, der Boden …) anklickbar machen UND korrekt
 * kalkulieren — beides braucht die exakten m², die nur Plixa hat.
 *
 * Koordinaten liegen im SELBEN System wie das geo-GLB (Weltmeter, Y-up, nicht
 * gespiegelt, vor der Editor-Zentrierung). Der Editor verschiebt sie mit dem
 * IDENTISCHEN Versatz wie das geo-Modell (`applyManifestOffset`), damit die
 * Klick-/Optik-Flächen deckungsgleich auf dem exakten Haus sitzen.
 */
import type { SurfaceKind as FinishableSurfaceKind } from './calc/finishes'

/** Flächenarten im Manifest — die belegbaren plus door/window (anklickbar, aber ohne Aufbau-Rezept). */
export type ManifestSurfaceKind = FinishableSurfaceKind | 'door' | 'window'

const FINISHABLE_KINDS: FinishableSurfaceKind[] = [
  'roof',
  'wall-exterior',
  'wall-interior',
  'floor',
  'ceiling',
]
const ALL_KINDS: ManifestSurfaceKind[] = [...FINISHABLE_KINDS, 'door', 'window']

export type Vec3 = [number, number, number]

export type ManifestSurface = {
  /** Stabile id über alle „Gestalten"-Durchgänge desselben Projekts. */
  id: string
  kind: ManifestSurfaceKind
  /** Menschenlesbarer Name (optional, z. B. „Dachfläche Süd"). */
  name?: string
  /** Etage (0 = EG), optional. */
  level?: number
  /** EXAKTE Fläche in m² (Kalkulationswert; bei Dach die Schrägfläche). */
  areaM2: number
  /** Ebener Umriss als Punktfolge in Weltmetern (geo-Koordinatensystem). */
  polygon: Vec3[]
}

export type SurfaceManifest = {
  coordSystem?: string
  surfaces: ManifestSurface[]
}

/** Nur belegbare Flächen (Dach/Wand/Boden/Decke) bekommen einen Aufbau/Material. */
export function isFinishableKind(kind: ManifestSurfaceKind): kind is FinishableSurfaceKind {
  return (FINISHABLE_KINDS as string[]).includes(kind)
}

function isVec3(v: unknown): v is Vec3 {
  return (
    Array.isArray(v) &&
    v.length === 3 &&
    v.every((n) => typeof n === 'number' && Number.isFinite(n))
  )
}

/** Ein Manifest-Objekt validieren; ungültige Flächen werden verworfen (nicht die ganze Datei). */
export function parseSurfaceManifest(raw: unknown): SurfaceManifest {
  const obj = raw as { coordSystem?: unknown; surfaces?: unknown }
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.surfaces)) {
    throw new Error('Flächen-Manifest ungültig: „surfaces" fehlt.')
  }
  const surfaces: ManifestSurface[] = []
  for (const entry of obj.surfaces as unknown[]) {
    const s = entry as Partial<ManifestSurface>
    if (
      !s ||
      typeof s.id !== 'string' ||
      typeof s.kind !== 'string' ||
      !(ALL_KINDS as string[]).includes(s.kind) ||
      typeof s.areaM2 !== 'number' ||
      !Number.isFinite(s.areaM2) ||
      s.areaM2 <= 0 ||
      !Array.isArray(s.polygon) ||
      s.polygon.length < 3 ||
      !s.polygon.every(isVec3)
    ) {
      console.warn('[plixa surfaces] Fläche übersprungen (ungültig):', s?.id ?? entry)
      continue
    }
    surfaces.push({
      id: s.id,
      kind: s.kind as ManifestSurfaceKind,
      name: typeof s.name === 'string' ? s.name : undefined,
      level: typeof s.level === 'number' ? s.level : undefined,
      areaM2: s.areaM2,
      polygon: s.polygon as Vec3[],
    })
  }
  return { coordSystem: typeof obj.coordSystem === 'string' ? obj.coordSystem : undefined, surfaces }
}

/**
 * Manifest laden. PRIMÄR direkt von R2 (öffentliche r2.dev-URL erlaubt GET-CORS);
 * scheitert das (CORS/Netz), über den Same-Origin-Proxy `/api/ifc`.
 */
export async function fetchSurfaceManifest(url: string): Promise<SurfaceManifest> {
  let text: string
  try {
    const direct = await fetch(url, { cache: 'no-store' })
    if (!direct.ok) throw new Error(`HTTP ${direct.status}`)
    text = await direct.text()
  } catch (directErr) {
    console.warn('[plixa surfaces] Direkt-Abruf fehlgeschlagen → Proxy-Fallback', directErr)
    const res = await fetch(`/api/ifc?u=${encodeURIComponent(url)}`, { cache: 'no-store' })
    if (!res.ok) throw new Error(`Flächen-Manifest-Download fehlgeschlagen (${res.status})`)
    text = await res.text()
  }
  return parseSurfaceManifest(JSON.parse(text))
}

/**
 * Denselben Versatz wie beim geo-Modell auf alle Polygone anwenden, damit die
 * Flächen deckungsgleich auf dem exakten Haus liegen. `offset` ist der in
 * `attachExactGeometry` berechnete Wert `[-center.x, -box.min.y, -center.z]`.
 */
export function applyManifestOffset(manifest: SurfaceManifest, offset: Vec3): SurfaceManifest {
  const [ox, oy, oz] = offset
  return {
    ...manifest,
    surfaces: manifest.surfaces.map((s) => ({
      ...s,
      polygon: s.polygon.map(([x, y, z]) => [x + ox, y + oy, z + oz] as Vec3),
    })),
  }
}

/** Schwerpunkt (Mittel der Eckpunkte) einer Fläche — für Label-/Kamerapositionen. */
export function surfaceCentroid(surface: ManifestSurface): Vec3 {
  const n = surface.polygon.length
  const sum = surface.polygon.reduce(
    (acc, [x, y, z]) => [acc[0] + x, acc[1] + y, acc[2] + z] as Vec3,
    [0, 0, 0] as Vec3,
  )
  return [sum[0] / n, sum[1] / n, sum[2] / n]
}

/** Flächennormale (Newell-Methode), normiert. Fällt bei entarteten Polygonen auf +Y zurück. */
export function surfaceNormal(surface: ManifestSurface): Vec3 {
  let nx = 0
  let ny = 0
  let nz = 0
  const poly = surface.polygon
  for (let i = 0; i < poly.length; i++) {
    const [cx, cy, cz] = poly[i]
    const [px, py, pz] = poly[(i + 1) % poly.length]
    nx += (cy - py) * (cz + pz)
    ny += (cz - pz) * (cx + px)
    nz += (cx - px) * (cy + py)
  }
  const len = Math.hypot(nx, ny, nz)
  if (len === 0) return [0, 1, 0]
  return [nx / len, ny / len, nz / len]
}

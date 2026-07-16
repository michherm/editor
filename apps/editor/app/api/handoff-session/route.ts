/**
 * Rückweg-Übergabe (Sitzung): nimmt den editierbaren Szenengraph als JSON
 * entgegen ({ nodes, rootNodeIds, collections?, materials? } — NICHT das
 * Ergebnis-GLB) und legt ihn projektgebunden in R2 unter
 * `session/<project>/<timestamp>-<rand>.json` ab. Gibt die öffentliche https-URL
 * zurück. Plixa hängt sie beim nächsten „Gestalten" als `&session=` wieder an,
 * der Editor stellt daraus exakt den Stand wieder her (siehe createSessionOnLoad).
 *
 * Bewusst pro Rückgabe eine FRISCHE URL (Timestamp + Zufall), damit kein
 * CDN-/Browser-Cache eine veraltete Sitzung ausliefert und jeder Durchgang auf
 * dem vorigen aufbaut.
 *
 * Secrets bleiben serverseitig (`r2PutObject` liest die R2-Zugangsdaten aus den
 * Env-Variablen).
 */
import { randomUUID } from 'node:crypto'
import { r2PutObject } from '@/lib/r2-upload'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

// 50 MB — der editierbare Szenengraph ist reines JSON (klein gegenüber dem GLB);
// deckelt trotzdem gegen Missbrauch.
const MAX_BYTES = 50 * 1024 * 1024

const PUBLIC_BASE = (
  process.env.NEXT_PUBLIC_ASSETS_CDN_URL ?? 'https://pub-4572f09e779c444fa5bd77e378de46df.r2.dev'
).replace(/\/$/, '')

// Projekt-ID auf sichere Pfad-Segmente beschränken (kein Path-Traversal, keine
// Sonderzeichen). Fällt auf „_" zurück, wenn nichts Brauchbares übrig bleibt.
function safeSegment(value: unknown): string {
  if (typeof value !== 'string') return '_'
  const cleaned = value.replace(/[^A-Za-z0-9._-]/g, '').slice(0, 128)
  return cleaned || '_'
}

export async function POST(request: Request): Promise<Response> {
  let payload: {
    project?: unknown
    scene?: { nodes?: unknown; rootNodeIds?: unknown; collections?: unknown; materials?: unknown }
    finishes?: unknown
  }
  try {
    payload = await request.json()
  } catch {
    return Response.json({ error: 'bad_request' }, { status: 400 })
  }

  const scene = payload?.scene
  const nodes = scene?.nodes
  const rootNodeIds = scene?.rootNodeIds
  if (
    !scene ||
    typeof nodes !== 'object' ||
    nodes === null ||
    !Array.isArray(rootNodeIds) ||
    rootNodeIds.length === 0
  ) {
    return Response.json({ error: 'invalid_scene' }, { status: 400 })
  }

  // Flächen-Belegungen (surfaceId → finishId) mitschreiben, falls vorhanden, damit
  // Dachziegel/Tapete/… beim nächsten „Gestalten" wieder da sind. Nur eine flache
  // string→string-Map akzeptieren.
  const rawFinishes = payload.finishes
  const finishes: Record<string, string> = {}
  if (rawFinishes && typeof rawFinishes === 'object' && !Array.isArray(rawFinishes)) {
    for (const [k, v] of Object.entries(rawFinishes as Record<string, unknown>)) {
      if (typeof v === 'string') finishes[k] = v
    }
  }

  // Nur den editierbaren Stand serialisieren (keine Fremdfelder mitschleppen).
  const body = JSON.stringify({
    nodes,
    rootNodeIds,
    collections: scene.collections,
    materials: scene.materials,
    plixaFinishes: finishes,
  })
  const bytes = Buffer.byteLength(body, 'utf8')
  if (bytes === 0) return Response.json({ error: 'empty_body' }, { status: 400 })
  if (bytes > MAX_BYTES) return Response.json({ error: 'too_large' }, { status: 413 })

  const project = safeSegment(payload.project)
  // Frische, sortierbare, kollisionsfreie URL pro Rückgabe.
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const key = `session/${project}/${stamp}-${randomUUID().slice(0, 8)}.json`

  try {
    await r2PutObject(key, Buffer.from(body, 'utf8'), 'application/json')
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return Response.json({ error: 'upload_failed', message }, { status: 502 })
  }

  return Response.json({ url: `${PUBLIC_BASE}/${key}` })
}

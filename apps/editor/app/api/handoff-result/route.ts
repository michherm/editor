/*
 * © 2025–2026 HERRMANN SARL (Michael Herrmann). Alle Rechte vorbehalten.
 * Proprietär — keine Nutzung/Vervielfältigung/Bearbeitung/Dekompilierung ohne
 * schriftliche Genehmigung. Siehe apps/editor/LICENSE. Kontakt: mh.solarkraftwerk@gmail.com
 */
/**
 * Rückweg-Übergabe: nimmt die exportierte GLB des Nutzer-Hauses entgegen, legt
 * sie in R2 unter `result/<id>.glb` ab und gibt die öffentliche URL zurück. Der
 * Client leitet dann zu Plixa weiter: `…/konfigurator?result=<url>`.
 *
 * Secrets bleiben serverseitig: die R2-Zugangsdaten liest ausschließlich
 * `r2PutObject` (lib/r2-upload.ts, 1:1 aus michherm/plixa) aus den Env-Variablen.
 */
import { randomUUID } from 'node:crypto'
import { r2PutObject } from '@/lib/r2-upload'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

// 200 MB — deckelt die Upload-Größe gegen Missbrauch.
const MAX_BYTES = 200 * 1024 * 1024

// Öffentliche R2-Lesebasis (r2.dev-Domain des `plixa-cad`-Buckets). Fällt auf
// die bekannte Domain zurück, falls die Env-Variable einmal fehlt.
const PUBLIC_BASE = (
  process.env.NEXT_PUBLIC_ASSETS_CDN_URL ?? 'https://pub-4572f09e779c444fa5bd77e378de46df.r2.dev'
).replace(/\/$/, '')

export async function POST(request: Request): Promise<Response> {
  const body = await request.arrayBuffer()
  if (body.byteLength === 0) {
    return Response.json({ error: 'empty_body' }, { status: 400 })
  }
  if (body.byteLength > MAX_BYTES) {
    return Response.json({ error: 'too_large' }, { status: 413 })
  }

  const id = randomUUID()
  const key = `result/${id}.glb`

  try {
    await r2PutObject(key, Buffer.from(body), 'model/gltf-binary')
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return Response.json({ error: 'upload_failed', message }, { status: 502 })
  }

  return Response.json({ url: `${PUBLIC_BASE}/${key}` })
}

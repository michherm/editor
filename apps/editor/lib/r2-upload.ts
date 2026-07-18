/*
 * © 2025–2026 HERRMANN SARL (Michael Herrmann). Alle Rechte vorbehalten.
 * Proprietär — keine Nutzung/Vervielfältigung/Bearbeitung/Dekompilierung ohne
 * schriftliche Genehmigung. Siehe apps/editor/LICENSE. Kontakt: mh.solarkraftwerk@gmail.com
 */
/**
 * r2Upload – Cloudflare-R2-Upload (S3-kompatibel) OHNE externe Abhängigkeit.
 *
 * SERVER-ONLY: läuft ausschließlich in Route-Handlern (Node-Runtime). Nutzt
 * `node:crypto` für eine eigene AWS-SigV4-Signierung. Die Zugangsdaten kommen
 * aus Umgebungsvariablen und verlassen niemals den Server:
 *   R2_ENDPOINT           = https://<account>.r2.cloudflarestorage.com
 *   R2_BUCKET             = plixa-cad
 *   R2_ACCESS_KEY_ID      = <geheim>
 *   R2_SECRET_ACCESS_KEY  = <geheim>
 *
 * Wird für die Editor-Übergabe genutzt (Ergebnis-GLB ablegen). Kein neues npm-Paket.
 * 1:1 übernommen aus michherm/plixa → src/export/r2Upload.ts.
 */
import crypto from 'node:crypto'

const sha256hex = (data: string | Buffer): string =>
  crypto.createHash('sha256').update(data).digest('hex')
const hmac = (key: crypto.BinaryLike | Buffer, data: string): Buffer =>
  crypto.createHmac('sha256', key).update(data).digest()

/** Pfad-Segmente RFC-3986-konform kodieren, „/" bleibt erhalten. */
function encodeS3Path(path: string): string {
  return path.split('/').map((seg) => encodeURIComponent(seg)).join('/')
}

function requireEnv(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`R2-Konfiguration fehlt: ${name} ist nicht gesetzt (Vercel Environment Variables).`)
  return v
}

/**
 * Legt ein Objekt in R2 ab (PUT). `key` z. B. "result/<uuid>.glb".
 * Wirft bei fehlender Konfiguration oder HTTP-Fehler.
 */
export async function r2PutObject(
  key: string,
  body: string | Buffer,
  contentType = 'application/octet-stream',
): Promise<void> {
  const endpoint = requireEnv('R2_ENDPOINT').replace(/\/$/, '')
  const bucket = requireEnv('R2_BUCKET')
  const accessKey = requireEnv('R2_ACCESS_KEY_ID')
  const secret = requireEnv('R2_SECRET_ACCESS_KEY')
  const region = 'auto'
  const service = 's3'

  const host = new URL(endpoint).host
  const bodyBuf = Buffer.isBuffer(body) ? body : Buffer.from(body, 'utf8')
  const payloadHash = sha256hex(bodyBuf)

  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '') // YYYYMMDDTHHMMSSZ
  const dateStamp = amzDate.slice(0, 8)

  const canonicalUri = '/' + encodeS3Path(`${bucket}/${key}`)
  const canonicalHeaders =
    `host:${host}\n` + `x-amz-content-sha256:${payloadHash}\n` + `x-amz-date:${amzDate}\n`
  const signedHeaders = 'host;x-amz-content-sha256;x-amz-date'
  const canonicalRequest = ['PUT', canonicalUri, '', canonicalHeaders, signedHeaders, payloadHash].join('\n')

  const scope = `${dateStamp}/${region}/${service}/aws4_request`
  const stringToSign = ['AWS4-HMAC-SHA256', amzDate, scope, sha256hex(canonicalRequest)].join('\n')

  const kDate = hmac('AWS4' + secret, dateStamp)
  const kRegion = hmac(kDate, region)
  const kService = hmac(kRegion, service)
  const kSigning = hmac(kService, 'aws4_request')
  const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex')

  const authorization =
    `AWS4-HMAC-SHA256 Credential=${accessKey}/${scope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`

  // Host-Header NICHT manuell setzen (undici verbietet es) – fetch setzt ihn selbst.
  const res = await fetch(`${endpoint}${canonicalUri}`, {
    method: 'PUT',
    headers: {
      'x-amz-content-sha256': payloadHash,
      'x-amz-date': amzDate,
      'content-type': contentType,
      authorization,
    },
    body: new Uint8Array(bodyBuf),
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`R2 PUT ${key} fehlgeschlagen: ${res.status} ${detail}`.trim())
  }
}

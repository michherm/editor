/**
 * IFC-Proxy (Hinweg-Übergabe von Plixa).
 *
 * Warum serverseitig: Die IFC-Datei liegt auf Cloudflare R2 (`?ifc=<r2-url>`).
 * Der Browser darf sie wegen CORS oft nicht direkt laden. Diese schlanke Route
 * holt sie same-origin und reicht die Bytes durch — der Client konvertiert sie
 * dann mit `convertIfcToPascal` im Browser.
 *
 * SSRF-Schutz: Es werden ausschließlich Cloudflare-R2-Hosts erlaubt
 * (`*.r2.dev` öffentlich, `*.r2.cloudflarestorage.com` S3-API). Damit kann diese
 * Route nicht zum Abgriff interner Adressen missbraucht werden.
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

// 200 MB — großzügig für IFC-Modelle, aber gedeckelt gegen Missbrauch.
const MAX_BYTES = 200 * 1024 * 1024

function isAllowedR2Host(host: string): boolean {
  const h = host.toLowerCase()
  return h.endsWith('.r2.dev') || h.endsWith('.r2.cloudflarestorage.com')
}

export async function GET(request: Request): Promise<Response> {
  const raw = new URL(request.url).searchParams.get('u')
  if (!raw) {
    return new Response('missing u', { status: 400 })
  }

  let target: URL
  try {
    target = new URL(raw)
  } catch {
    return new Response('bad url', { status: 400 })
  }
  if (target.protocol !== 'https:' || !isAllowedR2Host(target.hostname)) {
    return new Response('forbidden host', { status: 403 })
  }

  let upstream: Response
  try {
    upstream = await fetch(target.toString(), {
      // Nur die Datei holen — keine Cookies/Redirects auf fremde Hosts folgen.
      redirect: 'error',
      headers: { accept: 'application/octet-stream,*/*' },
    })
  } catch {
    return new Response('fetch failed', { status: 502 })
  }
  if (!upstream.ok || !upstream.body) {
    return new Response(`upstream ${upstream.status}`, { status: 502 })
  }

  const declared = Number(upstream.headers.get('content-length') ?? '0')
  if (declared > MAX_BYTES) {
    return new Response('too large', { status: 413 })
  }

  const buf = await upstream.arrayBuffer()
  if (buf.byteLength > MAX_BYTES) {
    return new Response('too large', { status: 413 })
  }

  return new Response(buf, {
    status: 200,
    headers: {
      'content-type': 'application/octet-stream',
      'cache-control': 'private, no-store',
    },
  })
}

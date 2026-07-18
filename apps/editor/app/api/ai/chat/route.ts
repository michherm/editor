/*
 * © 2025–2026 HERRMANN SARL (Michael Herrmann). Alle Rechte vorbehalten.
 * Proprietär — keine Nutzung/Vervielfältigung/Bearbeitung/Dekompilierung ohne
 * schriftliche Genehmigung. Siehe apps/editor/LICENSE. Kontakt: mh.solarkraftwerk@gmail.com
 */
import Anthropic from '@anthropic-ai/sdk'

/**
 * Plixa KI-Assistent — serverseitiger Claude-Proxy (ein Zug pro Aufruf).
 *
 * Warum so: Pascals Szenen-Store (`@pascal-app/core`) ist ein `'use client'`-Modul
 * und läuft in einer Next-Server-Route NICHT (dort nur ein Client-Referenz-Stub).
 * Die Werkzeuge müssen also im BROWSER laufen — dort ist die `SceneBridge` direkt
 * der Live-Editor-Store, Änderungen sind sofort sichtbar und es funktioniert auf
 * Vercel-Serverless. Diese Route macht daher nur die Inferenz:
 *
 *   Client baut die MCP-Tools im Browser → schickt {messages, tools} hierher →
 *   wir rufen Claude EINMAL auf → geben die Antwort (Text + tool_use) zurück →
 *   der Client führt die Tool-Aufrufe lokal gegen die Live-Szene aus → nächster
 *   Zug. Der ANTHROPIC_API_KEY wird ausschließlich hier serverseitig gelesen.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const MODEL = 'claude-opus-4-8'
const MAX_TOKENS = 16000
const MAX_MESSAGE_CHARS = 12000
const MAX_MESSAGES = 80
const MAX_TOOLS = 60

const RATE_WINDOW_MS = 60_000
const RATE_MAX = 40
const rateHits = new Map<string, number[]>()
function rateLimited(ip: string): boolean {
  const now = Date.now()
  const hits = (rateHits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS)
  hits.push(now)
  rateHits.set(ip, hits)
  return hits.length > RATE_MAX
}

const LANG_NAMES: Record<string, string> = {
  de: 'German',
  en: 'English',
  fr: 'French',
  it: 'Italian',
  es: 'Spanish',
  nl: 'Dutch',
  pl: 'Polish',
  pt: 'Portuguese',
  cs: 'Czech',
  sv: 'Swedish',
  da: 'Danish',
  ro: 'Romanian',
}

function systemPrompt(lng: string): string {
  const langName = LANG_NAMES[lng] ?? 'German'
  return [
    'You are the Plixa design assistant, embedded in a live 3D editor.',
    "The user has ALREADY configured and built their house in Plixa; it arrives here as a FINISHED, EXACT model. Your job is to help them design, fit out and furnish it — NOT to rebuild it.",
    'CRITICAL — protect the structure: NEVER modify, move, delete or rebuild the existing house. Its load-bearing exterior walls and its roof structure are final and must stay exactly as they are. You only ever ADD to the house and its surroundings.',
    'You MAY: place furniture, decorations and outdoor objects (sofa, lamps, pool, carport, garden house, PV panels, railings) with place_item / furnish_room / search_assets; apply materials and floor finishes (paint, wood, brick, tile, wallpaper, parquet) with set_surface_material; add interior walls and rooms (create_wall / create_room) to divide up space; fit windows and doors into the design (add_window / add_door / cut_opening); add stairs (create_stair_between_levels).',
    'You must NOT rebuild the shell or roof, create or delete whole storeys, or delete existing house parts — those tools are intentionally unavailable to you.',
    'Distances are in metres. Before adding anything, inspect the scene with get_scene / find_nodes / get_walls so new elements sit in the right place and never overlap or replace the existing house.',
    'Work additively and in small, safe steps. Make reasonable assumptions for unspecified sizes. If a request would require changing the existing structural walls or roof, briefly say those are fixed and offer an additive alternative (e.g. an interior wall, a cladding/material, or an added element) instead.',
    `Always reply to the user in ${langName}. Keep it short — one or two sentences on what you did.`,
  ].join(' ')
}

export async function POST(request: Request): Promise<Response> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'ai_not_configured' }, { status: 200 })
  }

  let body: {
    messages?: Anthropic.MessageParam[]
    tools?: Anthropic.Tool[]
    lng?: string
  }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'bad_request' }, { status: 400 })
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  if (rateLimited(ip)) {
    return Response.json({ error: 'rate_limited' }, { status: 429 })
  }

  const messages = Array.isArray(body.messages) ? body.messages.slice(-MAX_MESSAGES) : []
  const tools = Array.isArray(body.tools) ? body.tools.slice(0, MAX_TOOLS) : []
  const lng = typeof body.lng === 'string' ? body.lng.slice(0, 5) : 'de'

  // Gröbste Eingabelängen-Bremse: die Gesamtgröße der Nutzertexte begrenzen.
  const userTextLength = messages
    .filter((m) => m.role === 'user' && typeof m.content === 'string')
    .reduce((n, m) => n + (m.content as string).length, 0)
  if (messages.length === 0 || tools.length === 0 || userTextLength > MAX_MESSAGE_CHARS) {
    return Response.json({ error: 'bad_request' }, { status: 400 })
  }

  try {
    const anthropic = new Anthropic({ apiKey })
    const runStream = anthropic.messages.stream({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      thinking: { type: 'adaptive' },
      system: systemPrompt(lng),
      tools,
      messages,
    })
    const response = await runStream.finalMessage()
    return Response.json({ content: response.content, stop_reason: response.stop_reason })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return Response.json({ error: 'ai_failed', message }, { status: 502 })
  }
}

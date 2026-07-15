'use client'

/**
 * Plixa-KI-Panel (linke Leiste im Editor). Der Nutzer beschreibt, was gebaut
 * werden soll; Claude ändert die Szene live über Pascals MCP-Werkzeuge.
 *
 * Architektur: Die Werkzeuge laufen im BROWSER (Pascals Szenen-Store ist ein
 * `'use client'`-Modul und existiert nur hier). Wir hängen einen In-Memory-
 * MCP-Client an `createPascalMcpServer` mit einer `SceneBridge`, die direkt den
 * Live-Editor-Store umschließt — jeder Tool-Aufruf ändert also sofort sichtbar
 * die Szene. Die Inferenz macht `/api/ai/chat` (dort lebt der API-Key); pro Zug
 * schicken wir {messages, tools} hin und führen die zurückgegebenen tool_use-
 * Blöcke lokal aus, bis Claude fertig ist.
 */
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

const AMBER = '#d39440'
const MAX_ITERATIONS = 16
// SICHERHEIT: Das Haus kommt als exaktes, fertiges Modell in den Editor. Die KI
// darf es GESTALTEN (Möbel stellen, Material auftragen) und BEFRAGEN — aber NIE
// umbauen. Frühere Bau-/Lösch-Werkzeuge (Wände neu bauen, Öffnungen schneiden,
// Ebenen/Zonen anlegen, löschen, Roh-Patches) haben das exakte Modell zerstört,
// wenn der Nutzer z. B. „setz Fenster ein / mach ein Ziegeldach" sagte. Deshalb
// eine ERLAUBNISLISTE statt Sperrliste: nur bekannt-sichere Werkzeuge, alles
// andere (auch künftige) bleibt draußen.
const TOOL_ALLOWLIST = new Set([
  // Objekte/Einrichtung platzieren (Möbel, Deko, PV-Module, Pool, Carport … als Objekte)
  'place_item',
  'furnish_room',
  'search_assets',
  // Material & Böden (Farbe, Holz, Fliesen, Tapete, Parkett)
  'set_surface_material',
  'list_materials',
  // Additiver Ausbau — HINZUFÜGEN, nie die Kern-Hülle/Dach ersetzen:
  'create_wall', // Innenwände
  'create_room',
  'add_window', // Fenster/Dachfenster in Öffnungen
  'add_door',
  'cut_opening',
  'create_stair_between_levels',
  // Lesen / Prüfen (sicher)
  'get_scene',
  'get_node',
  'describe_node',
  'find_nodes',
  'get_walls',
  'get_zones',
  'list_levels',
  'get_level_summary',
  'measure',
  'check_collisions',
  'verify_scene',
  'validate_scene',
  // Umkehr
  'undo',
  'redo',
])
// BEWUSST NICHT erlaubt (zerstören/ersetzen die exakte Struktur): create_story_shell,
// create_roof, create_level, duplicate_level, delete_node, apply_patch, set_zone.

type DisplayRole = 'user' | 'assistant'
type DisplayMessage = { role: DisplayRole; content: string }

// Anthropic-Message-Form (bewusst schlank gehalten — der Server validiert).
type Block = { type: string; [k: string]: unknown }
type ApiMessage = { role: 'user' | 'assistant'; content: string | Block[] }
type AnthropicTool = { name: string; description: string; input_schema: unknown }

type Mcp = {
  callTool: (args: { name: string; arguments: Record<string, unknown> }) => Promise<unknown>
  tools: AnthropicTool[]
}

const wrap: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  fontSize: 13,
  color: 'var(--foreground, #1a242e)',
}

// Anklickbare Beispiel-Prompts für den Leer-Zustand. Sie zeigen konkret, was die
// KI HEUTE kann (Möbel platzieren, Fenster/Türen schneiden, Fragen zur Szene) —
// bewusst noch KEIN Material/Tapete, das kommt erst mit dem Material-Werkzeug.
// `de` ist der Default; via i18n-Schlüssel später übersetzbar.
const STARTER_PROMPTS: { key: string; de: string }[] = [
  { key: 'ai.starter.paint', de: 'Streich eine Innenwand hellblau.' },
  { key: 'ai.starter.brick', de: 'Mach eine Wand aus Backstein.' },
  { key: 'ai.starter.sofa', de: 'Stell ein Sofa in den größten Raum.' },
  { key: 'ai.starter.window', de: 'Schneide ein Fenster in die Südwand.' },
  { key: 'ai.starter.area', de: 'Wie viele Quadratmeter hat das Erdgeschoss?' },
]

export default function PlixaAiPanel() {
  const { t, i18n } = useTranslation()
  const [messages, setMessages] = useState<DisplayMessage[]>([])
  const [input, setInput] = useState('')
  const [running, setRunning] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const mcpRef = useRef<Mcp | null>(null)
  const apiMessagesRef = useRef<ApiMessage[]>([])

  const scrollToBottom = () => {
    requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }))
  }

  /** In-Memory-MCP im Browser aufbauen (lazy, damit nichts serverseitig lädt). */
  async function getMcp(): Promise<Mcp> {
    if (mcpRef.current) return mcpRef.current
    const [{ SceneBridge, createPascalMcpServer }, { Client }, { InMemoryTransport }] =
      await Promise.all([
        import('@pascal-app/mcp'),
        import('@modelcontextprotocol/sdk/client/index.js'),
        import('@modelcontextprotocol/sdk/inMemory.js'),
      ])
    // SceneBridge umschließt den globalen `useScene`-Store = der Live-Editor.
    const bridge = new SceneBridge()
    const server = createPascalMcpServer({ bridge, name: 'plixa-ai', version: '0.1.0' })
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
    const client = new Client({ name: 'plixa-ai-browser', version: '0.1.0' })
    await server.connect(serverTransport)
    await client.connect(clientTransport)
    const listed = await client.listTools()
    const tools: AnthropicTool[] = listed.tools
      .filter((tool) => TOOL_ALLOWLIST.has(tool.name))
      .map((tool) => ({
        name: tool.name,
        description: tool.description ?? '',
        input_schema: tool.inputSchema,
      }))
    mcpRef.current = {
      callTool: (args) => client.callTool(args),
      tools,
    }
    return mcpRef.current
  }

  function mcpResultToText(result: unknown): { text: string; isError: boolean } {
    const r = result as {
      isError?: boolean
      content?: Array<{ type?: string; text?: string }>
      structuredContent?: unknown
    }
    const parts: string[] = []
    if (Array.isArray(r?.content)) {
      for (const block of r.content) {
        if (block?.type === 'text' && typeof block.text === 'string') parts.push(block.text)
      }
    }
    if (parts.length === 0 && r?.structuredContent !== undefined) {
      parts.push(JSON.stringify(r.structuredContent))
    }
    return { text: parts.join('\n') || 'ok', isError: r?.isError === true }
  }

  const pushAssistant = (text: string) => {
    setMessages((m) => [...m, { role: 'assistant', content: text }])
    scrollToBottom()
  }

  const send = async (preset?: string) => {
    const text = (preset ?? input).trim()
    if (!text || running) return
    setError(null)
    setInput('')
    setMessages((m) => [...m, { role: 'user', content: text }])
    scrollToBottom()
    setRunning(true)
    setStatus(t('ai.thinking'))

    apiMessagesRef.current.push({ role: 'user', content: text })

    try {
      const mcp = await getMcp()

      for (let iter = 0; iter < MAX_ITERATIONS; iter++) {
        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: apiMessagesRef.current,
            tools: mcp.tools,
            lng: i18n.language,
          }),
        })
        const data = (await res.json()) as {
          content?: Block[]
          stop_reason?: string
          error?: string
        }

        if (data.error) {
          setError(data.error === 'ai_not_configured' ? t('ai.notConfigured') : t('ai.failed'))
          break
        }

        const content = Array.isArray(data.content) ? data.content : []
        apiMessagesRef.current.push({ role: 'assistant', content })

        for (const block of content) {
          if (block.type === 'text' && typeof block.text === 'string' && block.text.trim()) {
            pushAssistant(block.text)
          }
        }

        if (data.stop_reason !== 'tool_use') break

        const toolUses = content.filter((b) => b.type === 'tool_use')
        const toolResults: Block[] = []
        for (const use of toolUses) {
          const name = String(use.name ?? '')
          setStatus(t('ai.usingTool', { tool: name }))
          try {
            const result = await mcp.callTool({
              name,
              arguments: (use.input as Record<string, unknown>) ?? {},
            })
            const { text: resultText, isError } = mcpResultToText(result)
            toolResults.push({
              type: 'tool_result',
              tool_use_id: use.id,
              content: resultText,
              is_error: isError,
            })
          } catch (err) {
            toolResults.push({
              type: 'tool_result',
              tool_use_id: use.id,
              content: err instanceof Error ? err.message : String(err),
              is_error: true,
            })
          }
        }
        // Die Tool-Aufrufe haben den Live-Store bereits geändert (sichtbar im 3D).
        apiMessagesRef.current.push({ role: 'user', content: toolResults })
        setStatus(t('ai.thinking'))
      }
    } catch {
      setError(t('ai.failed'))
    } finally {
      setRunning(false)
      setStatus(null)
      scrollToBottom()
    }
  }

  return (
    <div style={wrap}>
      <div style={{ padding: '14px 16px 6px', fontWeight: 700, fontSize: 14 }}>{t('ai.heading')}</div>
      <div style={{ padding: '0 16px 8px', fontSize: 11.5, color: 'var(--muted-foreground, #8a95a0)' }}>
        {t('ai.intro')}
      </div>

      <div
        ref={scrollRef}
        style={{ flex: 1, overflowY: 'auto', padding: '4px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}
      >
        {messages.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 12, color: 'var(--muted-foreground, #8a95a0)', lineHeight: 1.5 }}>
              {t('ai.example')}
            </div>
            {/* Anklickbare Beispiele: ein Tipp startet die KI direkt. */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {STARTER_PROMPTS.map((p) => {
                const label = t(p.key, { defaultValue: p.de })
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => void send(label)}
                    disabled={running}
                    style={{
                      textAlign: 'left',
                      padding: '6px 11px',
                      borderRadius: 999,
                      border: '1px solid var(--border, rgba(20,30,40,0.14))',
                      background: 'var(--background, #fff)',
                      color: 'var(--foreground, #1a242e)',
                      fontSize: 12,
                      lineHeight: 1.2,
                      cursor: running ? 'default' : 'pointer',
                      opacity: running ? 0.6 : 1,
                    }}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '92%',
              padding: '7px 10px',
              borderRadius: 10,
              whiteSpace: 'pre-wrap',
              lineHeight: 1.45,
              background:
                m.role === 'user' ? 'linear-gradient(180deg, #e3b14e, #d39440)' : 'var(--muted, #f4f1ea)',
              color: m.role === 'user' ? '#18120a' : 'var(--foreground, #1a242e)',
              border: m.role === 'user' ? 'none' : '1px solid var(--border, rgba(20,30,40,0.10))',
            }}
          >
            {m.content}
          </div>
        ))}
        {status && (
          <div style={{ fontSize: 11.5, color: AMBER, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="pascal-loader-2" style={{ width: 16, height: 16, color: AMBER }} />
            {status}
          </div>
        )}
        {error && (
          <div style={{ fontSize: 12, color: '#b23b34', background: '#fdeceb', padding: '6px 10px', borderRadius: 8 }}>
            {error}
          </div>
        )}
      </div>

      <div style={{ padding: 12, borderTop: '1px solid var(--border, rgba(20,30,40,0.10))', display: 'flex', gap: 8 }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              void send()
            }
          }}
          placeholder={t('ai.placeholder')}
          rows={2}
          disabled={running}
          style={{
            flex: 1,
            resize: 'none',
            padding: '8px 10px',
            borderRadius: 9,
            border: '1px solid var(--border, rgba(20,30,40,0.18))',
            background: 'var(--background, #fff)',
            color: 'inherit',
            fontSize: 13,
            outline: 'none',
            fontFamily: 'inherit',
          }}
        />
        <button
          type="button"
          onClick={() => void send()}
          disabled={running || !input.trim()}
          style={{
            alignSelf: 'stretch',
            padding: '0 14px',
            borderRadius: 9,
            border: 'none',
            cursor: running || !input.trim() ? 'default' : 'pointer',
            fontWeight: 600,
            fontSize: 13,
            color: '#18120a',
            background:
              running || !input.trim()
                ? 'var(--muted, #e6ddcd)'
                : 'linear-gradient(180deg, #e3b14e, #d39440)',
            opacity: running || !input.trim() ? 0.6 : 1,
          }}
        >
          {t('ai.send')}
        </button>
      </div>
    </div>
  )
}

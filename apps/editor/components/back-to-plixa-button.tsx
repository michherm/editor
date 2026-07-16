'use client'

/**
 * „Zurück zu Plixa" (Rückweg-Übergabe): exportiert die aktuelle Szene als GLB,
 * lädt sie über `/api/handoff-result` nach R2 (`result/<id>.glb`) und öffnet den
 * Plixa-Konfigurator mit `?result=<öffentliche URL>`.
 *
 * Der GLB-Export braucht die Three.js-`scene-renderer`-Gruppe. Statt R3F-Kontext
 * (den es außerhalb des Canvas nicht gibt) laufen wir über `sceneRegistry`: jeder
 * registrierte Knoten ist ein Object3D innerhalb dieser Gruppe, also finden wir
 * sie durch Aufsteigen in der Elternkette. So bleibt Pascals Kern unangetastet.
 */
import { sceneRegistry } from '@pascal-app/core'
import { exportSceneToGlb, nextFrames, useScene, useViewer } from '@pascal-app/editor'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getFinishAssignments } from '@/lib/calc/finishes-store'
import { readProjectHandoffId } from '@/lib/ifc-handoff'

const PLIXA_KONFIGURATOR_URL = 'https://plixa-ten.vercel.app/konfigurator'

/**
 * Ziel-URL für die Rückkehr zu Plixa bestimmen. Plixa hängt an die Editor-URL
 * `&return=<plixa-adresse>` an (die genaue Adresse, auf der der Nutzer geplant
 * hat — localStorage ist pro Adresse getrennt). Wir kehren DORTHIN zurück, mit
 * `result=<glb-url>` und — falls vorhanden — `session=<szene-json-url>`
 * angehängt. Fehlt/ungültig der return-Parameter, fällt es auf die feste
 * Konfigurator-Adresse zurück. Nur https + `*.vercel.app` zugelassen (kein
 * Open-Redirect auf beliebige Hosts).
 */
function buildReturnUrl(resultUrl: string, sessionUrl: string | null): string {
  const append = (url: URL) => {
    url.searchParams.set('result', resultUrl)
    if (sessionUrl) url.searchParams.set('session', sessionUrl)
  }
  const fallback = new URL(PLIXA_KONFIGURATOR_URL)
  append(fallback)
  if (typeof window === 'undefined') return fallback.toString()
  const ret = new URLSearchParams(window.location.search).get('return')
  if (!ret) return fallback.toString()
  try {
    const target = new URL(ret)
    if (target.protocol !== 'https:' || !target.hostname.toLowerCase().endsWith('.vercel.app')) {
      return fallback.toString()
    }
    append(target)
    return target.toString()
  } catch {
    return fallback.toString()
  }
}

/**
 * Den aktuellen editierbaren Szenengraph als JSON nach R2 schreiben und die
 * öffentliche https-URL zurückgeben (oder null, wenn es scheitert). Das ist der
 * VOLLSTÄNDIGE Stand inkl. exaktem Haus-Item — der Editor stellt ihn beim
 * nächsten „Gestalten" über `&session=` 1:1 wieder her. Scheitert der Upload,
 * bleibt die Rückkehr trotzdem möglich (nur ohne Fortsetzung), statt den Nutzer
 * zu blockieren.
 */
async function uploadSessionScene(): Promise<string | null> {
  try {
    const { nodes, rootNodeIds, collections, materials } = useScene.getState()
    const res = await fetch('/api/handoff-session', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        project: readProjectHandoffId(),
        scene: { nodes, rootNodeIds, collections, materials },
        finishes: getFinishAssignments(),
      }),
    })
    const data = (await res.json().catch(() => ({}))) as { url?: string }
    if (!res.ok || !data.url) {
      console.error('[plixa handoff] Sitzung speichern fehlgeschlagen:', res.status, data)
      return null
    }
    return data.url
  } catch (err) {
    console.error('[plixa handoff] Sitzung speichern fehlgeschlagen:', err)
    return null
  }
}

/** Die `scene-renderer`-Gruppe über einen registrierten Knoten finden. */
function findSceneRendererGroup() {
  for (const object of sceneRegistry.nodes.values()) {
    let current: typeof object | null = object
    while (current) {
      if (current.name === 'scene-renderer') return current
      current = current.parent
    }
  }
  return null
}

/**
 * Das exakte Plixa-Haus-Item (die 1:1-Referenzgeometrie aus `&geo=`) für den
 * Rückweg-Export unsichtbar schalten. Plixa HAT das Haus bereits und zeigt das
 * Ergebnis als Schicht DARÜBER — zurück soll also nur, was der Nutzer HINZUGEFÜGT
 * hat (Möbel). Ohne dies bäckt die ~57-MB-Referenz ins Ergebnis-GLB, das dann an
 * der 4,5-MB-Body-Grenze der Serverless-Funktion scheitert (413 → „Export
 * fehlgeschlagen"). `exportSceneToGlb` klont die Szene synchron, sodass diese
 * imperative Sichtbarkeit greift, bevor React sie aus `node.visible` neu setzt.
 * Gibt eine Restore-Funktion zurück.
 */
function hideExactHouseForExport(): () => void {
  const nodes = useScene.getState().nodes
  const houseNode = Object.values(nodes).find(
    (n) =>
      (n as { type?: string }).type === 'item' &&
      (n as { asset?: { id?: string } }).asset?.id === 'plixa-exact-house',
  ) as { id?: string } | undefined
  const obj = houseNode?.id ? sceneRegistry.nodes.get(houseNode.id) : undefined
  if (!obj) return () => {}
  const prev = obj.visible
  obj.visible = false
  return () => {
    obj.visible = prev
  }
}

export function BackToPlixaButton() {
  const { t } = useTranslation()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClick = async () => {
    if (busy) return
    setError(null)
    setBusy(true)
    try {
      // Leere Szene früh abfangen: sonst wirft der Export mit einer kryptischen
      // Meldung. Passiert typischerweise, wenn kein Haus geladen wurde (kein
      // ?ifc= oder Import fehlgeschlagen).
      if (useScene.getState().rootNodeIds.length === 0) {
        throw new Error('empty_scene')
      }

      // R3F/Instancing braucht ein paar Frames, um export-only Geometrie zu
      // committen — wie im Export-Manager: setExporting(true) → warten → export.
      useViewer.getState().setExporting(true)
      await nextFrames()

      const sceneGroup = findSceneRendererGroup()
      if (!sceneGroup) throw new Error('scene-renderer nicht gefunden')

      // Das exakte Plixa-Haus (Referenzgeometrie) NICHT zurückschicken — nur die
      // Ergänzungen des Nutzers. Direkt vor dem (synchronen) Klon ausblenden.
      const restoreHouse = hideExactHouseForExport()
      let buffer: ArrayBuffer
      try {
        buffer = await exportSceneToGlb(sceneGroup, useScene.getState().nodes)
      } finally {
        restoreHouse()
        useViewer.getState().setExporting(false)
      }
      console.info(`[plixa handoff] GLB exportiert: ${(buffer.byteLength / 1024 / 1024).toFixed(2)} MB`)

      const res = await fetch('/api/handoff-result', {
        method: 'POST',
        headers: { 'content-type': 'model/gltf-binary' },
        body: buffer,
      })
      // Bei Fehler kann die Antwort statt JSON eine Plattform-Fehlerseite sein
      // (z. B. Vercels 413, wenn die GLB die 4,5-MB-Body-Grenze der Serverless-
      // Funktion überschreitet). Robust lesen und den Status protokollieren.
      const raw = await res.text()
      let data: { url?: string; error?: string } = {}
      try {
        data = JSON.parse(raw)
      } catch {
        /* nicht-JSON (Plattform-Fehlerseite) */
      }
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? `upload_http_${res.status}: ${raw.slice(0, 200)}`)
      }

      // Editierbaren Szenengraph als Sitzung sichern (für „weiter-editieren" beim
      // nächsten Durchgang). Optional: scheitert es, kehren wir trotzdem zurück
      // (nur ohne Fortsetzung), statt den Rückweg zu blockieren.
      const sessionUrl = await uploadSessionScene()
      if (sessionUrl) {
        console.info(`[plixa handoff] Sitzung gespeichert: ${sessionUrl}`)
      }

      window.location.href = buildReturnUrl(data.url, sessionUrl)
    } catch (err) {
      useViewer.getState().setExporting(false)
      console.error('[plixa handoff] Rückweg fehlgeschlagen:', err)
      const message = err instanceof Error ? err.message : String(err)
      setError(message === 'empty_scene' ? t('handoff.emptyScene') : t('handoff.exportFailed'))
      setBusy(false)
    }
  }

  return (
    <div className="relative inline-flex flex-col items-end">
      <button
        type="button"
        onClick={() => void handleClick()}
        disabled={busy}
        className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3.5 font-semibold text-[13px] text-[#18120a] shadow-sm ring-1 ring-black/10 transition hover:brightness-105 disabled:opacity-70"
        style={{ background: 'linear-gradient(180deg, #e3b14e, #d39440)' }}
      >
        {busy ? (
          <span className="pascal-loader-2" style={{ width: 14, height: 14, color: '#18120a' }} />
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M13 5l-7 7 7 7M6 12h13"
              stroke="#18120a"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        <span>{busy ? t('handoff.exporting') : t('handoff.backToPlixa')}</span>
      </button>
      {error && (
        <span className="absolute top-9 right-0 z-10 max-w-64 rounded-md bg-[#fdeceb] px-2 py-1 text-[#b23b34] text-xs shadow-md">
          {error}
        </span>
      )}
    </div>
  )
}

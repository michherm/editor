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

const PLIXA_KONFIGURATOR_URL = 'https://plixa-ten.vercel.app/konfigurator'

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

      const buffer = await exportSceneToGlb(sceneGroup, useScene.getState().nodes)
      useViewer.getState().setExporting(false)
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

      window.location.href = `${PLIXA_KONFIGURATOR_URL}?result=${encodeURIComponent(data.url)}`
    } catch (err) {
      useViewer.getState().setExporting(false)
      console.error('[plixa handoff] Rückweg fehlgeschlagen:', err)
      const message = err instanceof Error ? err.message : String(err)
      setError(message === 'empty_scene' ? t('handoff.emptyScene') : t('handoff.exportFailed'))
      setBusy(false)
    }
  }

  return (
    <div className="inline-flex flex-col items-end">
      <button
        type="button"
        onClick={() => void handleClick()}
        disabled={busy}
        className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-border bg-background/90 px-3 font-medium text-xs shadow-2xl backdrop-blur-md transition-colors hover:bg-white/8 disabled:opacity-60"
        style={{ color: '#d39440' }}
      >
        {busy ? (
          <span className="pascal-loader-2" style={{ width: 14, height: 14, color: '#d39440' }} />
        ) : (
          <span aria-hidden>←</span>
        )}
        <span>{busy ? t('handoff.exporting') : t('handoff.backToPlixa')}</span>
      </button>
      {error && (
        <span className="mt-1 max-w-56 rounded-md bg-[#fdeceb] px-2 py-1 text-[#b23b34] text-xs">
          {error}
        </span>
      )}
    </div>
  )
}

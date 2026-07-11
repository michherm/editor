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
      // R3F/Instancing braucht ein paar Frames, um export-only Geometrie zu
      // committen — wie im Export-Manager: setExporting(true) → warten → export.
      useViewer.getState().setExporting(true)
      await nextFrames()

      const sceneGroup = findSceneRendererGroup()
      if (!sceneGroup) throw new Error('scene-renderer nicht gefunden')

      const buffer = await exportSceneToGlb(sceneGroup, useScene.getState().nodes)
      useViewer.getState().setExporting(false)

      const res = await fetch('/api/handoff-result', {
        method: 'POST',
        headers: { 'content-type': 'model/gltf-binary' },
        body: buffer,
      })
      const data = (await res.json()) as { url?: string; error?: string }
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? `upload ${res.status}`)
      }

      window.location.href = `${PLIXA_KONFIGURATOR_URL}?result=${encodeURIComponent(data.url)}`
    } catch (err) {
      useViewer.getState().setExporting(false)
      setError(err instanceof Error ? err.message : String(err))
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
          {t('handoff.exportFailed')}
        </span>
      )}
    </div>
  )
}

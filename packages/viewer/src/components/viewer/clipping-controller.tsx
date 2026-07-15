'use client'

/**
 * ClippingController – waagerechter Schnitt („Dach ausblenden / Blick hinein").
 *
 * Blendet alle Bauteil-Meshes aus, deren Mittelpunkt außerhalb des Höhenbands
 * [min, max] (Y in Weltmetern) liegt. Damit lässt sich das exakte, einteilige
 * Haus-Modell wie ein Puppenhaus öffnen — Dach weg (oberer Schnitt) oder nur eine
 * Etage sichtbar (Band) — um innen zu möblieren.
 *
 * Bewusst über MESH-SICHTBARKEIT statt Renderer-Clipping: der Viewer nutzt den
 * WebGPU-Renderer, dessen globale `clippingPlanes` hier nicht greifen. Reine
 * `visible=false` funktioniert renderer-unabhängig. Läuft nur bei Änderung (nicht
 * pro Frame); die ursprüngliche Sichtbarkeit wird beim Ausschalten wiederhergestellt.
 */
import { useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { Box3, type Mesh, Vector3 } from 'three'
import useViewer from '../../store/use-viewer'

export function ClippingController() {
  const scene = useThree((s) => s.scene)
  const invalidate = useThree((s) => s.invalidate)
  const enabled = useViewer((s) => s.sectionEnabled)
  const min = useViewer((s) => s.sectionMin)
  const max = useViewer((s) => s.sectionMax)
  const hiddenRef = useRef<Mesh[]>([])

  useEffect(() => {
    // Zuvor ausgeblendete Meshes wieder einblenden, bevor neu bewertet wird.
    for (const m of hiddenRef.current) m.visible = true
    hiddenRef.current = []

    if (enabled) {
      const box = new Box3()
      const center = new Vector3()
      scene.traverse((object) => {
        const mesh = object as Mesh
        if (!(mesh as unknown as { isMesh?: boolean }).isMesh) return
        if (!mesh.visible) return
        box.setFromObject(mesh)
        if (box.isEmpty()) return
        box.getCenter(center)
        // Außerhalb des Höhenbands → ausblenden (Dach/oben bzw. Boden/unten).
        if (center.y > max || center.y < min) {
          mesh.visible = false
          hiddenRef.current.push(mesh)
        }
      })
    }

    invalidate()
    return () => {
      for (const m of hiddenRef.current) m.visible = true
      hiddenRef.current = []
      invalidate()
    }
  }, [scene, invalidate, enabled, min, max])

  return null
}

export default ClippingController

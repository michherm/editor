'use client'

/**
 * ClippingController – waagerechter Schnitt („Dach ausblenden / Blick hinein").
 *
 * Setzt globale Clipping-Ebenen am Renderer: alles außerhalb des Höhenbands
 * [min, max] (Y in Weltmetern) wird weggeschnitten. Damit lässt sich das exakte,
 * einteilige Haus-Modell wie ein Puppenhaus öffnen — Dach weg (oberer Schnitt)
 * oder nur eine Etage sichtbar (Band zwischen unterem und oberem Schnitt) — um
 * innen zu möblieren. Globale `renderer.clippingPlanes` greifen ohne
 * `localClippingEnabled` auf alle Materialien.
 */
import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import { Plane, Vector3 } from 'three'
import useViewer from '../../store/use-viewer'

export function ClippingController() {
  const gl = useThree((s) => s.gl)
  const invalidate = useThree((s) => s.invalidate)
  const enabled = useViewer((s) => s.sectionEnabled)
  const min = useViewer((s) => s.sectionMin)
  const max = useViewer((s) => s.sectionMax)

  useEffect(() => {
    if (!enabled) {
      gl.clippingPlanes = []
    } else {
      // Ebene 1 (Normale −Y, Konstante max): behält y ≤ max → Dach/oben weg.
      // Ebene 2 (Normale +Y, Konstante −min): behält y ≥ min → Boden/unten weg.
      gl.clippingPlanes = [
        new Plane(new Vector3(0, -1, 0), max),
        new Plane(new Vector3(0, 1, 0), -min),
      ]
    }
    invalidate()
    return () => {
      gl.clippingPlanes = []
      invalidate()
    }
  }, [gl, invalidate, enabled, min, max])

  return null
}

export default ClippingController

import * as THREE from 'three'
import type { StairNode } from './schema'

/**
 * Reiner Geometrie-Builder der Plixa-Treppe (Trittstufen + Setzstufen + zwei
 * Wangen) als three.js-`Group`. Maße mm → Meter. In der echten Integration
 * ruft diese Funktion die Plixa-Engine (`generateStraightStair`/`WinderStair`)
 * auf und baut die Bauteile daraus; hier eine schlanke, aber korrekte Variante
 * (gerade Treppe) als Machbarkeitsnachweis.
 *
 * Pure: kein React, kein Store, keine Szene – testbar und für Preview/Ghost nutzbar.
 */
export function buildStairGeometry(node: StairNode): THREE.Group {
  const g = new THREE.Group()
  const H = node.floorHeight / 1000
  const W = node.width / 1000
  const t = node.thickness / 1000
  const preferredRise = node.targetRiser / 1000

  const n = Math.max(2, Math.round(H / Math.max(0.05, preferredRise))) // Steigungen
  const rise = H / n
  const going = Math.max(0.24, 0.63 - 2 * rise) // Schrittmaß 2·St+Au ≈ 630 mm
  const treads = n - 1

  const treadMat = new THREE.MeshStandardMaterial({ color: '#c8a36a', roughness: 0.6 })
  const riserMat = new THREE.MeshStandardMaterial({ color: '#bb975f', roughness: 0.7 })
  const stringerMat = new THREE.MeshStandardMaterial({ color: '#9c7a46', roughness: 0.65 })

  for (let i = 0; i < treads; i++) {
    const yTop = (i + 1) * rise
    const xMid = i * going + going / 2
    const tread = new THREE.Mesh(new THREE.BoxGeometry(going, t, W), treadMat)
    tread.position.set(xMid, yTop - t / 2, 0)
    g.add(tread)

    const riser = new THREE.Mesh(new THREE.BoxGeometry(t, rise, W), riserMat)
    riser.position.set(i * going + t / 2, yTop - rise / 2, 0)
    g.add(riser)
  }

  // Zwei diagonale Wangen (konstante Bretthöhe), außen an den Stufen.
  const run = treads * going
  const totalRise = treads * rise
  const boardLen = Math.hypot(run, totalRise)
  const angle = Math.atan2(totalRise, run)
  const depth = 0.3
  for (const z of [-W / 2 - t / 2, W / 2 + t / 2]) {
    const board = new THREE.Mesh(new THREE.BoxGeometry(boardLen * 1.02, depth, t), stringerMat)
    board.position.set(run / 2, totalRise / 2 - depth * 0.15, z)
    board.rotation.z = angle
    g.add(board)
  }

  return g
}

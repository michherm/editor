import type { Plugin } from '@pascal-app/core'

/**
 * Plixa-Plugin — die CNC-/Fertigungs-Schicht auf Pascals eingebauter Treppe.
 *
 * Wir bauen KEINE zweite Treppe: Pascals `stair`-Bauteil übernimmt das Planen
 * (Geschosse verbinden, Deckenöffnung schneiden, Geländer). Unser Plugin liefert
 * ein Panel „Plixa CNC", das aus der gewählten Treppe die WikiHouse-Frästeile
 * (DXF/3dm) + den DIN-18065/EC5-Bericht erzeugt.
 *
 * Die Node-Dateien (schema/geometry/definition/parametrics) bleiben als
 * Referenz/Spike im Paket, sind aber NICHT Teil des Manifests — falls wir später
 * eine eigene „über-Eck-Wandtreppe" ergänzen (die Pascal nicht kann), docken sie
 * hier an.
 */
export const plixaCncPlugin: Plugin = {
  id: 'plixa:cnc',
  apiVersion: 1,
  panels: [
    {
      id: 'plixa-cnc',
      label: 'Plixa CNC',
      icon: { kind: 'iconify', name: 'lucide:scissors' },
      component: () => import('./panel'),
    },
  ],
}

// CNC-Rechnung (im Panel genutzt): Treppen-Parameter → Frästeile/Nesting/Kosten.
export {
  computeStairCnc, DEFAULT_ASSUMPTIONS,
  type StairCncParams, type StairCncResult, type CncPart,
  type DinCheck, type NestingEstimate, type CncAssumptions, type StairKind,
} from './cnc'

// Referenz-Exporte (Spike): eigenes Treppen-Bauteil, aktuell nicht im Manifest.
export { stairDefinition } from './definition'
export { StairNode, StairType } from './schema'
export { buildStairGeometry } from './geometry'

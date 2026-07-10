import type { ParametricDescriptor } from '@pascal-app/core'
import type { StairNode } from './schema'

/** Rechter Inspektor der Plixa-Treppe – kommt „gratis" aus dem Descriptor. */
export const stairParametrics: ParametricDescriptor<StairNode> = {
  groups: [
    {
      label: 'Treppe',
      fields: [
        { key: 'stairType', kind: 'enum', options: ['straight', 'quarter_winder', 'half_winder'], display: 'segmented' },
        { key: 'floorHeight', kind: 'number', unit: 'mm', min: 2000, max: 3600, step: 10 },
        { key: 'width', kind: 'number', unit: 'mm', min: 700, max: 1400, step: 10 },
        { key: 'targetRiser', kind: 'number', unit: 'mm', min: 140, max: 200, step: 1 },
        { key: 'thickness', kind: 'number', unit: 'mm', min: 12, max: 60, step: 1 },
      ],
    },
  ],
}

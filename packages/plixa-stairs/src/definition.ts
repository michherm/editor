import type { NodeDefinition } from '@pascal-app/core'
import { buildStairGeometry } from './geometry'
import { stairParametrics } from './parametrics'
import { StairNode } from './schema'

/**
 * Die Plixa-Treppe als Pascal-Node. `geometry` liefert die three.js-Gruppe;
 * `parametrics` erzeugt den Inspektor; `mcp` beschreibt das Bauteil für die KI.
 * In der echten Integration steckt hinter `geometry` die Plixa-Engine
 * (DIN-18065-Prüfung, CNC/DXF/3dm), plus ein 2D-`floorplan` für die Draufsicht.
 */
export const stairDefinition: NodeDefinition<typeof StairNode> = {
  kind: 'plixa:stair',
  schemaVersion: 1,
  schema: StairNode,
  category: 'structure',

  defaults: () => ({
    object: 'node',
    parentId: null,
    visible: true,
    metadata: {},
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    stairType: 'straight',
    floorHeight: 2800,
    width: 1000,
    targetRiser: 175,
    thickness: 40,
  }),

  capabilities: {
    movable: { axes: ['x', 'z'], gridSnap: true },
    rotatable: { axes: ['y'], snapAngles: Array.from({ length: 4 }, (_, i) => (i * Math.PI) / 2) },
    selectable: { hitVolume: 'bbox' },
    duplicable: true,
    deletable: true,
    groupable: true,
    snappable: {},
  },

  parametrics: stairParametrics,

  geometry: (node) => buildStairGeometry(node),

  presentation: {
    label: 'Plixa Treppe',
    icon: { kind: 'iconify', name: 'lucide:stairs' },
    paletteSection: 'structure',
  },

  mcp: {
    description:
      'Parametric WikiHouse/CNC plywood stair (Plixa engine). Straight or winder, DIN 18065 checked, exports DXF/3dm. Params in mm: floorHeight, width, targetRiser, thickness.',
  },
}

import { BaseNode, nodeType, objectId } from '@pascal-app/core'
import { z } from 'zod'

/** Treppenform. Gerade + gewendelt (die volle Geometrie liefert die Plixa-Engine). */
export const StairType = z.enum(['straight', 'quarter_winder', 'half_winder'])
export type StairType = z.infer<typeof StairType>

/**
 * Eine platzierte Plixa-Treppe als Pascal-Node. Maße in mm (Plixa-Konvention);
 * der Renderer/Geometrie rechnet nach Meter um. Kind = `plixa:stair`.
 */
export const StairNode = BaseNode.extend({
  id: objectId('stair'),
  type: nodeType('plixa:stair'),
  position: z.tuple([z.number(), z.number(), z.number()]).default([0, 0, 0]),
  rotation: z.tuple([z.number(), z.number(), z.number()]).default([0, 0, 0]),
  stairType: StairType.default('straight'),
  /** Geschosshöhe (mm). */
  floorHeight: z.number().positive().default(2800),
  /** Laufbreite (mm). */
  width: z.number().positive().default(1000),
  /** Wunsch-Steigung (mm) – DIN 18065 legt die Steigungszahl fest. */
  targetRiser: z.number().positive().default(175),
  /** Materialdicke Sperrholz (mm). */
  thickness: z.number().positive().default(40),
})
export type StairNode = z.infer<typeof StairNode>

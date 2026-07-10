import { describe, expect, it } from 'vitest'
import { computeStairCnc, DEFAULT_ASSUMPTIONS, type StairCncParams } from './cnc'

const base: StairCncParams = {
  stairType: 'straight',
  floorHeightMM: 2800,
  widthMM: 1000,
  targetRiserMM: 175,
  thicknessMM: 40,
}

describe('computeStairCnc', () => {
  it('rechnet Steigungszahl, Steigung und Auftritt konsistent', () => {
    const r = computeStairCnc(base)
    // 2800 / 175 = 16 Steigungen, 15 Tritte (gerade Treppe)
    expect(r.riserCount).toBe(16)
    expect(r.treadCount).toBe(15)
    expect(r.riserMM).toBeCloseTo(175, 5)
    // Auftritt aus Schrittmaßregel 2R+G=630 → 630 - 350 = 280
    expect(r.goingMM).toBeCloseTo(280, 5)
    // totalRise = Geschosshöhe
    expect(r.totalRiseMM).toBeCloseTo(2800, 5)
  })

  it('DIN-Schnellprüfung ist grün bei komfortablen Maßen', () => {
    const r = computeStairCnc(base)
    expect(r.din.ok).toBe(true)
    expect(r.din.issues).toHaveLength(0)
    // Schrittmaß muss die Zielregel treffen
    expect(r.din.stepFormulaMM).toBeCloseTo(630, 5)
  })

  it('meldet DIN-Verstoß bei zu steiler Treppe (fail-closed)', () => {
    const steep = computeStairCnc({ ...base, floorHeightMM: 2800, targetRiserMM: 230 })
    // wenige Steigungen → hohe Steigung > 200 mm
    expect(steep.riserMM).toBeGreaterThan(200)
    expect(steep.din.ok).toBe(false)
    expect(steep.din.issues.some((s) => s.includes('Steigung'))).toBe(true)
  })

  it('liefert drei Frästeil-Gruppen: Tritte, Setzstufen, zwei Wangen', () => {
    const r = computeStairCnc(base)
    const kinds = r.parts.map((p) => p.kind)
    expect(kinds).toEqual(['tread', 'riser', 'stringer'])
    const stringer = r.parts.find((p) => p.kind === 'stringer')!
    expect(stringer.count).toBe(2)
    const tread = r.parts.find((p) => p.kind === 'tread')!
    expect(tread.count).toBe(r.treadCount)
  })

  it('schlägt dicke Bauteile in Lagen auf (40 mm → mehrere 18-mm-Platten)', () => {
    const r = computeStairCnc(base)
    // 40 / 18 ≈ 2 Lagen
    expect(r.nesting.layers).toBe(2)
    expect(r.nesting.sheetsNeeded).toBeGreaterThanOrEqual(2)
    expect(r.costEUR).toBe(r.nesting.sheetsNeeded * DEFAULT_ASSUMPTIONS.pricePerSheetEUR)
  })

  it('fügt bei Wendeltreppen zusätzliche Stufen + einen Hinweis hinzu', () => {
    const q = computeStairCnc({ ...base, stairType: 'quarter_winder' })
    const straight = computeStairCnc(base)
    expect(q.treadCount).toBe(straight.treadCount + 3)
    expect(q.notes.some((n) => n.includes('Wendelstufen'))).toBe(true)
  })

  it('bleibt fail-closed: nie eine Freigabe, immer Disclaimer', () => {
    const r = computeStairCnc(base)
    expect(r.disclaimer).toMatch(/keine Fertigungs- oder Statik-Freigabe/)
  })
})

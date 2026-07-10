/**
 * Plixa-CNC-Rechnung — reine Funktion `computeStairCnc(params)`.
 *
 * Nimmt die Parameter der im Pascal-Editor gewählten Treppe (Geschosshöhe,
 * Laufbreite, Wunsch-Steigung, Materialdicke, Treppenform) und liefert die
 * WikiHouse-/CNC-Vorbemessung: Steigung/Auftritt (DIN-18065-Schnellprüfung),
 * die Frästeil-Liste (Tritte, Setzstufen, Wangen), den Plattenbedarf (Nesting)
 * und eine grobe Materialkosten-Schätzung.
 *
 * FAIL-CLOSED: Das Ergebnis ist eine **Vorbemessung/Schätzung**, KEINE
 * Fertigungs- oder Statik-Freigabe. Die exakte Geometrie (inkl. Verzahnung und
 * gewendelter Stufen) sowie die EC5-Nachweise liefert die Plixa-Engine
 * (`src/stair`). Diese Funktion ist bewusst abhängigkeitsfrei, damit das Plugin
 * unverändert in den Editor-Fork kopiert werden kann.
 */

export type StairKind = 'straight' | 'quarter_winder' | 'half_winder'

export interface StairCncParams {
  stairType: StairKind
  /** Geschosshöhe Boden→Boden (mm). */
  floorHeightMM: number
  /** Laufbreite (mm). */
  widthMM: number
  /** Wunsch-Steigung (mm) — DIN 18065 legt die Steigungszahl fest. */
  targetRiserMM: number
  /** Materialdicke Sperrholz (mm). */
  thicknessMM: number
}

/** Überschreibbare Fertigungs-Annahmen (Platte, Verschnitt, Preis). */
export interface CncAssumptions {
  sheetWidthMM: number
  sheetHeightMM: number
  sheetThicknessMM: number
  wasteFactor: number
  pricePerSheetEUR: number
  /** Wangen-Bretthöhe (mm). */
  stringerDepthMM: number
  /** Fingerzinken-/Verzahnungsbreite (mm) — Skylark-Konstante. */
  jointMM: number
}

export const DEFAULT_ASSUMPTIONS: CncAssumptions = {
  sheetWidthMM: 2500,
  sheetHeightMM: 1250,
  sheetThicknessMM: 18,
  wasteFactor: 1.25,
  pricePerSheetEUR: 78,
  stringerDepthMM: 300,
  jointMM: 18,
}

/** DIN-18065-Grenzen (Wohngebäude, notwendige Treppe) + Schrittmaßregel. */
const DIN = {
  riserMaxMM: 200,
  goingMinMM: 230,
  stepFormulaTargetMM: 630,
  stepFormulaMinMM: 590,
  stepFormulaMaxMM: 650,
} as const

export interface CncPart {
  ref: string
  kind: 'tread' | 'riser' | 'stringer'
  count: number
  lengthMM: number
  widthMM: number
  thicknessMM: number
  /** Fläche eines Stücks (m²). */
  areaM2: number
}

export interface DinCheck {
  riserMM: number
  goingMM: number
  /** Schrittmaß 2·Steigung + Auftritt (mm). */
  stepFormulaMM: number
  ok: boolean
  issues: string[]
}

export interface NestingEstimate {
  sheetWidthMM: number
  sheetHeightMM: number
  sheetAreaM2: number
  /** Gesamtfläche aller Teile inkl. Stückzahl (m²). */
  partsAreaM2: number
  wasteFactor: number
  /** Lagen bei dicken Bauteilen (thickness / sheetThickness). */
  layers: number
  sheetsNeeded: number
}

export interface StairCncResult {
  stairType: StairKind
  riserCount: number
  treadCount: number
  riserMM: number
  goingMM: number
  totalRiseMM: number
  runMM: number
  din: DinCheck
  parts: CncPart[]
  nesting: NestingEstimate
  costEUR: number
  notes: string[]
  disclaimer: string
}

const areaM2 = (aMM: number, bMM: number): number => (aMM / 1000) * (bMM / 1000)
const round1 = (x: number): number => Math.round(x * 10) / 10

/**
 * Zusätzliche Wendelstufen im Eck-Übergang (Näherung). Die exakte
 * winkelverzogene Geometrie kommt aus `WinderStairGenerator` der Plixa-Engine.
 */
function winderExtraTreads(kind: StairKind): number {
  if (kind === 'quarter_winder') return 3
  if (kind === 'half_winder') return 6
  return 0
}

export function computeStairCnc(
  params: StairCncParams,
  assumptions: CncAssumptions = DEFAULT_ASSUMPTIONS,
): StairCncResult {
  const H = Math.max(1, params.floorHeightMM)
  const w = Math.max(1, params.widthMM)
  const t = Math.max(1, params.thicknessMM)
  const a = assumptions

  // Steigungszahl aus Wunsch-Steigung; Auftritt aus Schrittmaßregel (2R+G=630).
  const riserCount = Math.max(2, Math.round(H / Math.max(1, params.targetRiserMM)))
  const riserMM = H / riserCount
  const goingMM = Math.max(0, DIN.stepFormulaTargetMM - 2 * riserMM)
  const baseTreads = Math.max(1, riserCount - 1)
  const treadCount = baseTreads + winderExtraTreads(params.stairType)
  const runMM = baseTreads * goingMM
  const totalRiseMM = riserCount * riserMM

  // DIN-Schnellprüfung (fail-closed: Verstöße werden gemeldet, nichts wird „gerundet").
  const stepFormulaMM = 2 * riserMM + goingMM
  const issues: string[] = []
  if (riserMM > DIN.riserMaxMM) issues.push(`Steigung ${round1(riserMM)} mm > ${DIN.riserMaxMM} mm (DIN 18065)`)
  if (goingMM < DIN.goingMinMM) issues.push(`Auftritt ${round1(goingMM)} mm < ${DIN.goingMinMM} mm (DIN 18065)`)
  if (stepFormulaMM < DIN.stepFormulaMinMM || stepFormulaMM > DIN.stepFormulaMaxMM) {
    issues.push(`Schrittmaß ${round1(stepFormulaMM)} mm außerhalb ${DIN.stepFormulaMinMM}–${DIN.stepFormulaMaxMM} mm`)
  }
  const din: DinCheck = { riserMM, goingMM, stepFormulaMM, ok: issues.length === 0, issues }

  // Frästeile: Tritte, Setzstufen, zwei Wangen.
  const stringerLenMM = Math.hypot(runMM, totalRiseMM)
  const parts: CncPart[] = [
    {
      ref: 'Trittstufe',
      kind: 'tread',
      count: treadCount,
      lengthMM: w,
      widthMM: Math.round(goingMM + a.jointMM), // Auftritt + Nasen-/Verzahnungszugabe
      thicknessMM: t,
      areaM2: round1(areaM2(w, goingMM + a.jointMM) * 100) / 100,
    },
    {
      ref: 'Setzstufe',
      kind: 'riser',
      count: treadCount,
      lengthMM: w,
      widthMM: Math.round(riserMM + a.jointMM),
      thicknessMM: t,
      areaM2: round1(areaM2(w, riserMM + a.jointMM) * 100) / 100,
    },
    {
      ref: 'Wange (eingestemmt)',
      kind: 'stringer',
      count: 2,
      lengthMM: Math.round(stringerLenMM),
      widthMM: a.stringerDepthMM,
      thicknessMM: t,
      areaM2: round1(areaM2(stringerLenMM, a.stringerDepthMM) * 100) / 100,
    },
  ]

  // Nesting/Plattenbedarf: Fläche × Verschnitt, dicke Bauteile in Lagen.
  const partsAreaM2 = parts.reduce((s, p) => s + p.count * p.areaM2, 0)
  const sheetAreaM2 = areaM2(a.sheetWidthMM, a.sheetHeightMM)
  const layers = Math.max(1, Math.round(t / a.sheetThicknessMM))
  const sheetsNeeded = Math.max(1, Math.ceil((partsAreaM2 * a.wasteFactor) / sheetAreaM2) * layers)
  const nesting: NestingEstimate = {
    sheetWidthMM: a.sheetWidthMM,
    sheetHeightMM: a.sheetHeightMM,
    sheetAreaM2: round1(sheetAreaM2 * 100) / 100,
    partsAreaM2: round1(partsAreaM2 * 100) / 100,
    wasteFactor: a.wasteFactor,
    layers,
    sheetsNeeded,
  }

  const costEUR = Math.round(sheetsNeeded * a.pricePerSheetEUR)

  const notes: string[] = []
  if (params.stairType !== 'straight') {
    notes.push(
      'Wendelstufen sind eine Näherung — die exakte winkelverzogene Geometrie (Kite-Stufen) liefert die Plixa-Engine (WinderStairGenerator).',
    )
  }
  if (layers > 1) {
    notes.push(`Materialdicke ${t} mm → ${layers} Lagen à ${a.sheetThicknessMM} mm (verleimt/gestapelt).`)
  }

  return {
    stairType: params.stairType,
    riserCount,
    treadCount,
    riserMM,
    goingMM,
    totalRiseMM,
    runMM,
    din,
    parts,
    nesting,
    costEUR,
    notes,
    disclaimer:
      'Vorbemessung/Schätzung — keine Fertigungs- oder Statik-Freigabe. Exakte Geometrie, Verzahnung und EC5-Nachweise über die Plixa-Engine (DIN 18065 / EC5).',
  }
}

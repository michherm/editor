/*
 * © 2025–2026 HERRMANN SARL (Michael Herrmann). Alle Rechte vorbehalten.
 * Proprietär — keine Nutzung/Vervielfältigung/Bearbeitung/Dekompilierung ohne
 * schriftliche Genehmigung. Siehe apps/editor/LICENSE. Kontakt: mh.solarkraftwerk@gmail.com
 */
/**
 * Mengen-/Kostenkalkulation: Fläche (m²) × Aufbau-Rezept → Stückliste.
 *
 * Für jede belegte Fläche liefert `calculateFinish` je Bauteil die benötigte
 * Menge (inkl. Verschnitt) und — falls ein Einzelpreis hinterlegt ist — die
 * Kosten. `calculateAssignments` summiert über alle belegten Flächen zu einer
 * Gesamt-Stückliste (Bauteile zusammengefasst) plus Gesamtkosten.
 */
import { type Finish, type FinishComponent, getFinishById } from './finishes'

export type CalcLineItem = {
  key: string
  label: string
  unit: string
  /** Benötigte Menge inkl. Verschnitt, sinnvoll gerundet. */
  quantity: number
  unitPriceEur?: number
  /** quantity × unitPriceEur, falls ein Preis hinterlegt ist. */
  costEur?: number
}

export type CalcResult = {
  finishId: string
  finishLabel: string
  areaM2: number
  items: CalcLineItem[]
  /** Summe aller Positionen mit Preis; null, wenn (noch) keine Preise hinterlegt sind. */
  totalEur: number | null
}

/** Eine Zuweisung „Fläche X bekommt Belegung Y" (kommt später aus dem Flächen-Store). */
export type SurfaceAssignment = {
  surfaceId: string
  finishId: string
  areaM2: number
}

// Mengen kaufmännisch runden: Stückzahlen aufrunden (man kann keinen halben
// Ziegel kaufen), Maß-/Gewichtseinheiten auf 2 Nachkommastellen.
function roundQuantity(quantity: number, unit: string): number {
  if (unit === 'Stk') return Math.ceil(quantity)
  return Math.round(quantity * 100) / 100
}

function lineItemFor(component: FinishComponent, areaM2: number): CalcLineItem {
  const raw = component.perM2 * areaM2 * (1 + (component.wastePct ?? 0) / 100)
  const quantity = roundQuantity(raw, component.unit)
  const item: CalcLineItem = {
    key: component.key,
    label: component.label,
    unit: component.unit,
    quantity,
  }
  if (typeof component.unitPriceEur === 'number') {
    item.unitPriceEur = component.unitPriceEur
    item.costEur = Math.round(quantity * component.unitPriceEur * 100) / 100
  }
  return item
}

/** Stückliste + Kosten für EINE belegte Fläche. */
export function calculateFinish(finish: Finish, areaM2: number): CalcResult {
  const items = finish.components.map((c) => lineItemFor(c, areaM2))
  const priced = items.filter((i) => typeof i.costEur === 'number')
  const totalEur =
    priced.length > 0 ? Math.round(priced.reduce((s, i) => s + (i.costEur ?? 0), 0) * 100) / 100 : null
  return { finishId: finish.id, finishLabel: finish.label, areaM2, items, totalEur }
}

export type AggregatedLineItem = CalcLineItem & { sources: string[] }

export type AggregatedResult = {
  perSurface: CalcResult[]
  /** Über alle Flächen zusammengefasste Bauteile (gleicher key + Einheit addiert). */
  totals: AggregatedLineItem[]
  totalEur: number | null
}

/** Gesamt-Stückliste über alle belegten Flächen. Unbekannte finishId wird übersprungen. */
export function calculateAssignments(assignments: SurfaceAssignment[]): AggregatedResult {
  const perSurface: CalcResult[] = []
  for (const a of assignments) {
    const finish = getFinishById(a.finishId)
    if (!finish) continue
    perSurface.push(calculateFinish(finish, a.areaM2))
  }

  // Bauteile über alle Flächen zusammenfassen (Schlüssel: key + Einheit).
  const merged = new Map<string, AggregatedLineItem>()
  for (const result of perSurface) {
    for (const item of result.items) {
      const mapKey = `${item.key}|${item.unit}`
      const existing = merged.get(mapKey)
      if (existing) {
        existing.quantity = roundQuantity(existing.quantity + item.quantity, item.unit)
        if (typeof item.costEur === 'number') {
          existing.costEur = Math.round(((existing.costEur ?? 0) + item.costEur) * 100) / 100
        }
        if (!existing.sources.includes(result.finishLabel)) existing.sources.push(result.finishLabel)
      } else {
        merged.set(mapKey, { ...item, sources: [result.finishLabel] })
      }
    }
  }

  const totals = [...merged.values()]
  const priced = totals.filter((i) => typeof i.costEur === 'number')
  const totalEur =
    priced.length > 0 ? Math.round(priced.reduce((s, i) => s + (i.costEur ?? 0), 0) * 100) / 100 : null

  return { perSurface, totals, totalEur }
}

// Interner Herkunfts-Ref (Beweismittel, siehe FORENSIK.md — nicht entfernen): plx/62028e4c87ad4d385c9e

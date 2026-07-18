'use client'
/*
 * © 2025–2026 HERRMANN SARL (Michael Herrmann). Alle Rechte vorbehalten.
 * Proprietär — keine Nutzung/Vervielfältigung/Bearbeitung/Dekompilierung ohne
 * schriftliche Genehmigung. Siehe apps/editor/LICENSE. Kontakt: mh.solarkraftwerk@gmail.com
 */

/**
 * Gestalten & Kalkulation — Panel im Editor.
 *
 * Listet jede belegbare Hausfläche (Dach, Außen-/Innenwände, Böden, Decken) aus
 * dem Plixa-Flächen-Manifest mit ihrer exakten m²-Zahl und lässt den Nutzer je
 * Fläche einen Aufbau/Material wählen (Dachziegel, Tapete, Parkett, Holz­
 * vertäfelung …). Darunter läuft die Kalkulation live mit: die Gesamt-Stückliste
 * (Fläche × Rezept, siehe lib/calc) plus geschätzte Kosten, sobald Preise
 * hinterlegt sind.
 *
 * Die Belegungen landen im Finish-Store und reisen über den Session-Rückweg mit,
 * sind beim nächsten „Gestalten" also wieder da.
 */
import { useTranslation } from 'react-i18next'
import { finishesForSurfaceKind, type SurfaceKind } from '@/lib/calc/finishes'
import {
  calculateForSurfaces,
  clearFinish,
  setFinish,
  useFinishAssignments,
} from '@/lib/calc/finishes-store'
import { isFinishableKind, type ManifestSurface } from '@/lib/surfaces'
import { useSurfaces } from '@/lib/surfaces-store'
import { cn } from '@/lib/utils'

const KIND_ORDER: SurfaceKind[] = ['roof', 'wall-exterior', 'wall-interior', 'floor', 'ceiling']

const KIND_LABEL: Record<SurfaceKind, { key: string; de: string }> = {
  roof: { key: 'calc.kind.roof', de: 'Dach' },
  'wall-exterior': { key: 'calc.kind.wallExterior', de: 'Außenwände' },
  'wall-interior': { key: 'calc.kind.wallInterior', de: 'Innenwände' },
  floor: { key: 'calc.kind.floor', de: 'Böden' },
  ceiling: { key: 'calc.kind.ceiling', de: 'Decken' },
}

function fmtQty(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2)
}

function fmtEur(n: number): string {
  return `${n.toFixed(2).replace('.', ',')} €`
}

export function CalcPanel() {
  const { t } = useTranslation()
  const { surfaces, loaded } = useSurfaces()
  const assignments = useFinishAssignments()

  const finishable = surfaces.filter((s) => isFinishableKind(s.kind))

  if (!loaded || finishable.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
        <div className="text-2xl">📐</div>
        <p className="text-muted-foreground text-sm">
          {t('calc.empty', {
            defaultValue:
              'Noch keine Flächen-Daten. Öffne dein Haus über Plixa („Gestalten"), dann kannst du hier Dach, Wände, Böden und Decken belegen und kalkulieren.',
          })}
        </p>
      </div>
    )
  }

  const byKind = new Map<SurfaceKind, ManifestSurface[]>()
  for (const s of finishable) {
    const kind = s.kind as SurfaceKind
    const list = byKind.get(kind) ?? []
    list.push(s)
    byKind.set(kind, list)
  }

  const calc = calculateForSurfaces(assignments, surfaces)
  const assignedCount = finishable.filter((s) => assignments[s.id]).length

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-3">
      <div>
        <h2 className="font-semibold text-foreground text-sm">
          {t('calc.title', { defaultValue: 'Gestalten & Kalkulation' })}
        </h2>
        <p className="mt-0.5 text-muted-foreground text-xs">
          {t('calc.subtitle', {
            defaultValue: 'Wähle je Fläche einen Aufbau — die Mengen zählen unten automatisch mit.',
          })}{' '}
          <span className="tabular-nums">
            {assignedCount}/{finishable.length}
          </span>
        </p>
      </div>

      {KIND_ORDER.filter((k) => byKind.has(k)).map((kind) => {
        const list = byKind.get(kind) ?? []
        const options = finishesForSurfaceKind(kind)
        return (
          <section key={kind} className="flex flex-col gap-1.5">
            <div className="font-medium text-muted-foreground text-xs">
              {t(KIND_LABEL[kind].key, { defaultValue: KIND_LABEL[kind].de })}
            </div>
            {list.map((s) => {
              const value = assignments[s.id] ?? ''
              return (
                <div
                  key={s.id}
                  className="flex items-center justify-between gap-2 rounded-lg bg-muted/40 px-2.5 py-1.5"
                >
                  <div className="min-w-0">
                    <div className="truncate text-foreground text-xs">{s.name ?? s.id}</div>
                    <div className="text-[11px] text-muted-foreground tabular-nums">
                      {s.areaM2.toFixed(1)} m²
                    </div>
                  </div>
                  <select
                    className={cn(
                      'max-w-[52%] shrink-0 rounded-md border border-border bg-background px-2 py-1 text-xs',
                      value ? 'text-foreground' : 'text-muted-foreground',
                    )}
                    value={value}
                    onChange={(e) => {
                      const next = e.target.value
                      if (next) setFinish(s.id, next)
                      else clearFinish(s.id)
                    }}
                  >
                    <option value="">{t('calc.none', { defaultValue: '— keine —' })}</option>
                    {options.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>
              )
            })}
          </section>
        )
      })}

      {/* Kalkulation / Stückliste */}
      <div className="mt-1 flex flex-col gap-1.5 rounded-xl border border-border/60 bg-background/60 p-3">
        <div className="font-medium text-foreground text-xs">
          {t('calc.bom', { defaultValue: 'Stückliste (gesamt)' })}
        </div>
        {calc.totals.length === 0 ? (
          <div className="text-muted-foreground text-xs">
            {t('calc.nothingYet', { defaultValue: 'Noch nichts belegt.' })}
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {calc.totals.map((i) => (
              <div key={`${i.key}|${i.unit}`} className="flex items-baseline justify-between gap-2">
                <span className="truncate text-foreground text-xs">{i.label}</span>
                <span className="shrink-0 text-muted-foreground text-xs tabular-nums">
                  {fmtQty(i.quantity)} {i.unit}
                  {typeof i.costEur === 'number' ? ` · ${fmtEur(i.costEur)}` : ''}
                </span>
              </div>
            ))}
          </div>
        )}
        <div className="mt-1 flex items-center justify-between border-border/50 border-t pt-2">
          <span className="font-medium text-foreground text-xs">
            {t('calc.total', { defaultValue: 'Geschätzte Kosten' })}
          </span>
          <span className="font-semibold text-foreground text-sm tabular-nums">
            {calc.totalEur !== null
              ? fmtEur(calc.totalEur)
              : t('calc.noPrices', { defaultValue: 'Preise noch nicht hinterlegt' })}
          </span>
        </div>
      </div>
    </div>
  )
}

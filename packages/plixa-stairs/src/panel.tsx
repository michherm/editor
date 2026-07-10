'use client'

/**
 * Plixa-CNC-Panel (linke Leiste im Pascal-Editor). Nimmt die in der Szene
 * gewählte Treppe (Pascals eingebautes `stair`-Bauteil) und erzeugt daraus die
 * WikiHouse-/CNC-Vorbemessung über `computeStairCnc`: Steigung/Auftritt
 * (DIN-18065-Schnellprüfung), Frästeil-Liste, Plattenbedarf (Nesting) und eine
 * grobe Kosten-Schätzung.
 *
 * WIRE-POINT (im Fork gekoppelt): `useSelectedStairParams()` liest die aktuell
 * gewählte `stair`-Node aus Pascals Store (`useSelection`) und mappt ihre Maße
 * (in Metern) auf `StairCncParams` (in Millimetern, Plixa-Konvention). Ohne
 * Auswahl bleibt es bei einer Standard-Treppe (Vorschau). Rechnung + Darstellung
 * bleiben unverändert; die UI-Texte laufen über i18next (12 Sprachen). Technische
 * Engine-Ausgaben (DIN-Verstöße, Hinweise, Disclaimer) kommen aus `cnc.ts` und
 * bleiben bewusst deutschsprachig.
 */
import { useSelection } from '@pascal-app/editor'
import { useTranslation } from 'react-i18next'
import { computeStairCnc, type StairCncParams, type StairKind } from './cnc'

/** Default-Parameter = Pascals StairNode-Defaults (mm). Fallback ohne Auswahl. */
const DEFAULT_PARAMS: StairCncParams = {
  stairType: 'straight',
  floorHeightMM: 2800,
  widthMM: 1000,
  targetRiserMM: 175,
  thicknessMM: 40,
}

/** Pascal-Treppenform (straight|curved|spiral) → CNC-Form. */
function mapStairKind(pascalType: unknown): StairKind {
  if (pascalType === 'curved') return 'quarter_winder'
  if (pascalType === 'spiral') return 'half_winder'
  return 'straight'
}

/** Pascals gewählte `stair`-Node (Maße in m) → StairCncParams (mm). */
function useSelectedStairParams(): { params: StairCncParams; live: boolean } {
  const { selectedNode } = useSelection()

  if (!selectedNode || (selectedNode as { type?: string }).type !== 'stair') {
    return { params: DEFAULT_PARAMS, live: false }
  }

  const n = selectedNode as unknown as {
    stairType?: string
    width?: number
    totalRise?: number
    stepCount?: number
    thickness?: number
  }

  const totalRiseMM = (n.totalRise ?? 2.5) * 1000
  const stepCount = Math.max(1, Math.round(n.stepCount ?? 10))

  return {
    params: {
      stairType: mapStairKind(n.stairType),
      floorHeightMM: totalRiseMM,
      widthMM: (n.width ?? 1.0) * 1000,
      targetRiserMM: totalRiseMM / stepCount,
      thicknessMM: (n.thickness ?? 0.25) * 1000,
    },
    live: true,
  }
}

const PLIXA_AMBER = '#d39440'
const box: React.CSSProperties = { padding: 16, fontSize: 13, lineHeight: 1.5, color: '#2c3742' }
const th: React.CSSProperties = { textAlign: 'left', fontWeight: 600, padding: '3px 6px', borderBottom: '1px solid #e3ddd2' }
const td: React.CSSProperties = { padding: '3px 6px', borderBottom: '1px solid #f0ece3' }
const tdNum: React.CSSProperties = { ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }

export default function PlixaCncPanel() {
  const { t, i18n } = useTranslation()
  const { params, live } = useSelectedStairParams()
  const r = computeStairCnc(params)
  const mm = (x: number) => `${Math.round(x)} mm`

  return (
    <div style={box}>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{t('cnc.heading')}</div>
      {!live && (
        <div style={{ fontSize: 11.5, color: '#8a95a0', marginBottom: 10 }}>{t('cnc.previewNote')}</div>
      )}

      {/* Maße + DIN-Schnellprüfung */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 11, color: '#8a95a0' }}>{t('cnc.risersTreads')}</div>
          <div style={{ fontWeight: 600 }}>{r.riserCount} × {r.treadCount}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#8a95a0' }}>{t('cnc.riserGoing')}</div>
          <div style={{ fontWeight: 600 }}>{mm(r.riserMM)} / {mm(r.goingMM)}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#8a95a0' }}>{t('cnc.stepFormula')}</div>
          <div style={{ fontWeight: 600 }}>{mm(r.din.stepFormulaMM)}</div>
        </div>
      </div>
      <div
        style={{
          marginBottom: 12, padding: '6px 10px', borderRadius: 6, fontSize: 12,
          background: r.din.ok ? '#eaf5ef' : '#fdeceb',
          color: r.din.ok ? '#2f7d55' : '#b23b34',
        }}
      >
        {r.din.ok ? `✓ ${t('cnc.dinOk')}` : `⚠ ${t('cnc.dinFail')} ${r.din.issues.join('; ')}`}
      </div>

      {/* Frästeile */}
      <div style={{ fontWeight: 600, margin: '0 0 4px' }}>{t('cnc.parts')}</div>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 12 }}>
        <thead>
          <tr>
            <th style={th}>{t('cnc.colPart')}</th>
            <th style={{ ...th, textAlign: 'right' }}>{t('cnc.colQty')}</th>
            <th style={{ ...th, textAlign: 'right' }}>{t('cnc.colDim')}</th>
            <th style={{ ...th, textAlign: 'right' }}>{t('cnc.colArea')}</th>
          </tr>
        </thead>
        <tbody>
          {r.parts.map((p) => (
            <tr key={p.ref}>
              <td style={td}>{p.ref}</td>
              <td style={tdNum}>{p.count}</td>
              <td style={tdNum}>{Math.round(p.lengthMM)} × {Math.round(p.widthMM)}</td>
              <td style={tdNum}>{p.areaM2.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Plattenbedarf + Kosten */}
      <div style={{ fontWeight: 600, margin: '0 0 4px' }}>{t('cnc.nesting')}</div>
      <div style={{ fontSize: 12, marginBottom: 10 }}>
        {r.nesting.partsAreaM2.toFixed(2)} m² {t('cnc.partsWord')} · {r.nesting.layers} {t('cnc.layersWord')} ·
        {' '}{t('cnc.wasteWord')} {Math.round((r.nesting.wasteFactor - 1) * 100)} % →{' '}
        <b>{r.nesting.sheetsNeeded}</b> {t('cnc.platesWord')} ({r.nesting.sheetWidthMM}×{r.nesting.sheetHeightMM})
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: PLIXA_AMBER, marginBottom: 12 }}>
        ≈ {r.costEUR.toLocaleString(i18n.language)} € {t('cnc.material')}
      </div>

      {r.notes.length > 0 && (
        <ul style={{ margin: '0 0 10px', paddingLeft: 18, fontSize: 11.5, color: '#6b7684' }}>
          {r.notes.map((n, i) => <li key={i}>{n}</li>)}
        </ul>
      )}

      <div style={{ fontSize: 11, color: '#8a95a0', borderTop: '1px solid #eee', paddingTop: 8 }}>
        {r.disclaimer}
      </div>
      <div style={{ fontSize: 11, color: '#8a95a0', marginTop: 6 }}>{t('cnc.nextStep')}</div>
    </div>
  )
}

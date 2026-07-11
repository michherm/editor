'use client'

/**
 * Vollflächiger Ladehinweis während der Hinweg-Übergabe: zeigt an, dass das
 * Plixa-Haus aus der IFC-Datei geladen/konvertiert wird, samt Fortschritt.
 */
import { useTranslation } from 'react-i18next'

export function IfcImportOverlay({ message, percent }: { message: string; percent: number }) {
  const { t } = useTranslation()
  const pct = Math.max(0, Math.min(100, Math.round(percent)))

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#12100c]/80 backdrop-blur-sm">
      <div className="flex w-72 flex-col items-center gap-4 rounded-2xl border border-white/10 bg-[#1b1813] px-6 py-7 text-center shadow-2xl">
        <span className="pascal-loader-2" style={{ width: 28, height: 28, color: '#d39440' }} />
        <div>
          <div className="font-semibold text-sm text-white">{t('handoff.importing')}</div>
          <div className="mt-1 text-xs text-white/60">{message}</div>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full transition-[width] duration-300"
            style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #e3b14e, #d39440)' }}
          />
        </div>
      </div>
    </div>
  )
}

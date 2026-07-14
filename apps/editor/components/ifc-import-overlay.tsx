'use client'

/**
 * Vollflächiger Hinweis während der Hinweg-Übergabe: zeigt den Fortschritt beim
 * Laden/Konvertieren des Plixa-Hauses — und im Fehlerfall den genauen Grund,
 * damit ein fehlgeschlagener Import nicht als stiller leerer Editor endet.
 */
import { useTranslation } from 'react-i18next'

export function IfcImportOverlay({
  message,
  percent,
  error,
}: {
  message: string
  percent: number
  error?: string | null
}) {
  const { t } = useTranslation()
  const pct = Math.max(0, Math.min(100, Math.round(percent)))

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#11181f]/25 backdrop-blur-sm">
      <div className="plixa-card plixa-rise flex w-80 flex-col items-center gap-4 px-6 py-7 text-center">
        {error ? (
          <>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-destructive font-bold text-white">
              !
            </div>
            <div>
              <div className="font-semibold text-foreground text-sm">
                {t('handoff.importFailed')}
              </div>
              <div className="mt-1 break-words text-muted-foreground text-xs">{error}</div>
            </div>
          </>
        ) : (
          <>
            <span
              className="pascal-loader-2"
              style={{ width: 28, height: 28, color: 'var(--plixa-amber)' }}
            />
            <div>
              <div className="font-semibold text-foreground text-sm">{t('handoff.importing')}</div>
              <div className="mt-1 text-muted-foreground text-xs">{message}</div>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full transition-[width] duration-300"
                style={{ width: `${pct}%`, background: 'var(--plixa-active-gradient)' }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

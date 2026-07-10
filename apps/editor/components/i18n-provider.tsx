'use client'

/**
 * Initialisiert i18next (Import-Seiteneffekt in `config`) und setzt NACH dem
 * Mounten die Startsprache aus URL `?lng=` / gespeicherter Wahl / Browsersprache.
 * Der erste Render bleibt bei Deutsch (siehe config) — so entstehen keine
 * Hydration-Konflikte, die Sprache springt danach auf die erkannte um.
 */
import { useEffect } from 'react'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/lib/i18n/config'
import { detectInitialLanguage } from '@/lib/i18n/detect'

export function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lng = detectInitialLanguage()
    if (i18n.language !== lng) void i18n.changeLanguage(lng)
  }, [])

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}

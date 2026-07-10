/**
 * Sprachen des Plixa-Editors — dieselben 12 wie die Plixa-Haupt-App.
 * Startsprache: `?lng=<code>` (Vertrag mit Plixa, siehe Aufgabe 4) > eigene,
 * gespeicherte Wahl > Browsersprache > Deutsch.
 */
export const SUPPORTED = ['de', 'fr', 'en', 'pl', 'it', 'es', 'nl', 'pt', 'cs', 'sv', 'da', 'ro'] as const
export type Lang = (typeof SUPPORTED)[number]

/** Key, unter dem eine bewusste Sprachwahl gemerkt wird (überschreibt Auto). */
export const STORAGE_KEY = 'plixa.lang'

export function isSupported(value: string | null | undefined): value is Lang {
  return typeof value === 'string' && (SUPPORTED as readonly string[]).includes(value)
}

/**
 * Startsprache im Browser bestimmen. Läuft NUR nach dem Mounten (im
 * I18nProvider) — der erste Server-/Client-Render bleibt bei Deutsch, damit
 * keine Hydration-Konflikte entstehen.
 */
export function detectInitialLanguage(): Lang {
  if (typeof window === 'undefined') return 'de'

  // 1. ?lng=<code> aus der URL (Sprache, die der Nutzer in Plixa gewählt hat).
  const fromUrl = new URLSearchParams(window.location.search).get('lng')
  if (isSupported(fromUrl)) return fromUrl

  // 2. Eigene, gespeicherte Wahl.
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (isSupported(stored)) return stored
  } catch {
    // localStorage kann blockiert sein — ignorieren.
  }

  // 3. Browsersprache.
  const nav = (window.navigator.language || '').slice(0, 2).toLowerCase()
  if (isSupported(nav)) return nav

  // 4. Deutsch.
  return 'de'
}

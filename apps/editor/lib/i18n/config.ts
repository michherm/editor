/**
 * i18next-Initialisierung für den Plixa-Editor.
 *
 * Synchron mit eingebetteten Ressourcen und fester Startsprache `de`, damit
 * Server- und Client-Render denselben Anfangszustand haben (keine
 * Hydration-Konflikte). Die tatsächliche Startsprache (URL `?lng=`, gespeicherte
 * Wahl, Browsersprache) wird erst NACH dem Mounten im `I18nProvider` gesetzt.
 */
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { resources } from './locales'

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources,
    lng: 'de',
    fallbackLng: 'de',
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  })
}

export default i18n

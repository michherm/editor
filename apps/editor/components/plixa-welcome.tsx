'use client'

/**
 * PlixaWelcome – freundliche, geführte Einführung für den Gestalten-Editor.
 *
 * Zeigt beim ERSTEN Öffnen automatisch vier einfache Schritte (im localStorage
 * gemerkt) und ist danach jederzeit über den „?"-Knopf wieder aufrufbar. Bewusst
 * KI-first: der einfachste Weg für einen unsicheren Nutzer ist, der KI einfach zu
 * sagen, was er möchte — genau das stellt die Einführung in den Vordergrund.
 */
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

const SEEN_KEY = 'plixa-welcome-seen'

export function PlixaWelcome() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  // Beim ersten Besuch automatisch öffnen.
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.localStorage.getItem(SEEN_KEY) !== '1') setOpen(true)
  }, [])

  const dismiss = () => {
    if (typeof window !== 'undefined') window.localStorage.setItem(SEEN_KEY, '1')
    setOpen(false)
  }

  const steps = [
    {
      icon: '🏠',
      title: t('welcome.s1.title', { defaultValue: 'Dein Haus ist schon da' }),
      body: t('welcome.s1.body', {
        defaultValue: 'Du musst nichts neu bauen — du richtest es ein und gestaltest: Wände streichen, Möbel stellen, Fenster setzen.',
      }),
    },
    {
      icon: '💬',
      title: t('welcome.s2.title', { defaultValue: 'Am einfachsten: sag es der KI' }),
      body: t('welcome.s2.body', {
        defaultValue: 'Öffne den Chat und schreib, was du möchtest — z. B. „Streich die Wohnzimmerwand weiß", „Stell ein Sofa rein", „Setz ein Fenster in die Südwand". Die KI macht es für dich.',
      }),
    },
    {
      icon: '👆',
      title: t('welcome.s3.title', { defaultValue: 'Oder klick ein Element an' }),
      body: t('welcome.s3.body', {
        defaultValue: 'Wand oder Möbel anklicken = auswählen. Dann erscheinen Griffe zum Verschieben und Drehen; mit der Taste „P" trägst du ein Material auf.',
      }),
    },
    {
      icon: '↩️',
      title: t('welcome.s4.title', { defaultValue: 'Fertig? Zurück zu Plixa' }),
      body: t('welcome.s4.body', {
        defaultValue: 'Oben rechts auf „Zurück zu Plixa" — deine Bearbeitung wird gespeichert und du kannst später weitermachen.',
      }),
    },
  ]

  return (
    <>
      {/* „?"-Knopf: Hilfe jederzeit wieder öffnen. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t('welcome.help', { defaultValue: 'Hilfe' })}
        className="plixa-card fixed right-5 bottom-5 z-40 hidden h-9 w-9 items-center justify-center rounded-full font-semibold text-[15px] text-foreground shadow-md transition hover:brightness-105 lg:flex"
      >
        ?
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={dismiss}
        >
          <div
            className="plixa-card plixa-rise w-full max-w-md rounded-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-1 font-semibold text-foreground text-lg">
              {t('welcome.title', { defaultValue: 'Willkommen — so gestaltest du dein Haus' })}
            </h2>
            <p className="mb-4 text-muted-foreground text-sm">
              {t('welcome.subtitle', {
                defaultValue: 'Vier kurze Schritte. Diese Hilfe kannst du jederzeit über „?" unten wieder öffnen.',
              })}
            </p>
            <div className="flex flex-col gap-3.5">
              {steps.map((s) => (
                <div key={s.title} className="flex gap-3">
                  <div className="text-xl leading-none">{s.icon}</div>
                  <div>
                    <div className="font-medium text-foreground text-sm">{s.title}</div>
                    <div className="text-muted-foreground text-xs leading-relaxed">{s.body}</div>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={dismiss}
              className="mt-5 w-full rounded-lg px-4 py-2 font-semibold text-[#18120a] text-sm transition hover:brightness-105"
              style={{ background: 'linear-gradient(180deg, #e3b14e, #d39440)' }}
            >
              {t('welcome.cta', { defaultValue: "Los geht's" })}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

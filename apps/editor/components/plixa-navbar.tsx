'use client'

/**
 * Plixa-Kopfleiste (dunkles „Nacht"-Band) über dem Editor — der `navbarSlot` des
 * v2-Layouts. Plixa-Stil: heller Arbeitsbereich unten, dunkle Kopfleiste oben.
 * Links die helle Plixa-Wortmarke, rechts der „Zurück zu Plixa"-Knopf und der
 * Sprachumschalter. Das `dark` auf dem Band stellt die Kinder (Sprachumschalter)
 * lokal auf helle Schrift, obwohl der übrige Editor hell läuft.
 */
import Image from 'next/image'
import { BackToPlixaButton } from './back-to-plixa-button'
import { LanguageSwitcher } from './language-switcher'

/**
 * @param embedded  Editor läuft als iframe INNERHALB von Plixa (`&embed=1`).
 *   Dann liefert die Plixa-Seite bereits Kopfzeile + Logo + Sprache — eine
 *   zweite dunkle Editor-Kopfleiste mit Plixa-Logo/Flagge würde doppelt
 *   erscheinen. Im eingebetteten Modus deshalb nur ein schlankes,
 *   transparentes Band mit dem einzigen funktionalen Knopf „Zurück zu Plixa"
 *   (der speichert + meldet per postMessage zurück), rechtsbündig.
 */
export function PlixaNavbar({ embedded = false }: { embedded?: boolean }) {
  if (embedded) {
    // EINE saubere Leiste im Plixa-Look: helles Band (kein schwarzes Doppel-
    // Band), links das dunkle „Plixa Gestalten"-Logo, rechts der eine orangene
    // „Zurück zu Plixa"-Knopf. Keine Flagge (Plixa liefert die Sprache). Damit
    // KEINE zwei Leisten übereinander erscheinen, blendet Plixa im eingebetteten
    // Modus (embed=1) seine eigene Konfigurator-Kopfzeile aus.
    return (
      <div className="flex h-12 w-full shrink-0 items-center justify-between gap-3 border-black/10 border-b bg-white px-4">
        <span className="flex items-center gap-2.5">
          <span className="relative block h-6 w-[104px] shrink-0">
            <Image
              alt="Plixa"
              src="/brand/plixa-wortmarke-dunkel.png"
              fill
              priority
              sizes="104px"
              className="object-contain object-left"
            />
          </span>
          <span className="font-medium text-[15px] text-[#1a242e]/70">Gestalten</span>
        </span>
        <BackToPlixaButton />
      </div>
    )
  }

  return (
    <div className="dark flex h-12 w-full shrink-0 items-center justify-between gap-3 border-[#d39440]/25 border-b bg-[#11181f] px-4 text-[#f7f4ee]">
      <span className="relative block h-6 w-[122px] shrink-0">
        <Image
          alt="Plixa"
          src="/brand/plixa-wortmarke-hell.png"
          fill
          priority
          sizes="122px"
          className="object-contain object-left"
        />
      </span>
      <div className="flex items-center gap-2.5">
        <BackToPlixaButton />
        <LanguageSwitcher />
      </div>
    </div>
  )
}

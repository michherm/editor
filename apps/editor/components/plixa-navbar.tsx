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

export function PlixaNavbar() {
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

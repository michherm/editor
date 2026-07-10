'use client'

/**
 * Plixa-Kopf oben in der Editor-Sidebar: die Plixa-Wortmarke (das „x" in Amber
 * ist das Erkennungsmerkmal) links, der Sprachumschalter rechts. Auf der hellen
 * Sidebar die dunkle Wortmarke, im Dark-Mode die helle.
 */
import Image from 'next/image'
import { LanguageSwitcher } from './language-switcher'

export function PlixaHeader() {
  return (
    <div className="flex w-full items-center justify-between gap-2">
      <span className="relative block h-6 w-[104px] shrink-0">
        {/* Helle Fläche → dunkle Wortmarke; Dark-Mode → helle Wortmarke. */}
        <Image
          alt="Plixa"
          src="/brand/plixa-wortmarke-dunkel.png"
          fill
          priority
          sizes="104px"
          className="object-contain object-left dark:hidden"
        />
        <Image
          alt="Plixa"
          src="/brand/plixa-wortmarke-hell.png"
          fill
          priority
          sizes="104px"
          className="hidden object-contain object-left dark:block"
        />
      </span>
      <LanguageSwitcher />
    </div>
  )
}

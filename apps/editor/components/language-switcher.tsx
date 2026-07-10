'use client'

/**
 * Sprachumschalter (analog Plixa `LanguageSwitcher`): geschlossen nur die aktive
 * Flagge, ein Klick öffnet Suchfeld + Sprachliste. Suche matcht über eine
 * Alias-Liste je Sprache (diakritik-unabhängig), sodass man in einer beliebigen
 * Sprache tippen kann. Eine bewusste Wahl wird gemerkt (überschreibt Auto).
 * Inline-SVG-Flaggen (Emoji-Flaggen zeigt Windows nicht).
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { STORAGE_KEY } from '@/lib/i18n/detect'

type LangMeta = { code: string; autonym: string; terms: string[] }

const LANG_META: LangMeta[] = [
  { code: 'de', autonym: 'Deutsch', terms: ['deutsch', 'german', 'allemand', 'niemiecki', 'tedesco', 'aleman', 'duits', 'alemao', 'nemcina', 'tyska', 'tysk', 'germana', 'germany', 'deutschland'] },
  { code: 'en', autonym: 'English', terms: ['english', 'englisch', 'anglais', 'angielski', 'inglese', 'ingles', 'engels', 'anglictina', 'engelska', 'engelsk', 'engleza', 'uk', 'gb', 'united kingdom', 'england'] },
  { code: 'fr', autonym: 'Français', terms: ['francais', 'french', 'franzosisch', 'francuski', 'francese', 'frans', 'frances', 'francouzstina', 'franska', 'fransk', 'franceza', 'france', 'frankreich'] },
  { code: 'it', autonym: 'Italiano', terms: ['italiano', 'italian', 'italienisch', 'italien', 'wloski', 'italiaans', 'italstina', 'italienska', 'italiensk', 'italiana', 'italy', 'italia'] },
  { code: 'es', autonym: 'Español', terms: ['espanol', 'spanish', 'spanisch', 'espagnol', 'hiszpanski', 'spagnolo', 'spaans', 'espanhol', 'spanelstina', 'spanska', 'spansk', 'spaniola', 'spain', 'spanien', 'espana', 'castellano'] },
  { code: 'nl', autonym: 'Nederlands', terms: ['nederlands', 'dutch', 'niederlandisch', 'neerlandais', 'holenderski', 'olandese', 'holandes', 'neerlandes', 'nizozemstina', 'nederlandska', 'hollandsk', 'neerlandeza', 'netherlands', 'niederlande', 'holland'] },
  { code: 'pl', autonym: 'Polski', terms: ['polski', 'polish', 'polnisch', 'polonais', 'polacco', 'polaco', 'pools', 'polones', 'polstina', 'polska', 'polsk', 'poloneza', 'poland', 'polen'] },
  { code: 'pt', autonym: 'Português', terms: ['portugues', 'portuguese', 'portugiesisch', 'portugais', 'portugalski', 'portoghese', 'portugees', 'portugalstina', 'portugisiska', 'portugisisk', 'portugheza', 'portugal'] },
  { code: 'cs', autonym: 'Čeština', terms: ['cestina', 'czech', 'tschechisch', 'tcheque', 'czeski', 'ceco', 'checo', 'tsjechisch', 'tcheco', 'tjeckiska', 'tjekkisk', 'ceha', 'czechia', 'tschechien', 'cesko'] },
  { code: 'sv', autonym: 'Svenska', terms: ['svenska', 'swedish', 'schwedisch', 'suedois', 'szwedzki', 'svedese', 'sueco', 'zweeds', 'svedstina', 'svensk', 'suedeza', 'sweden', 'schweden', 'sverige'] },
  { code: 'da', autonym: 'Dansk', terms: ['dansk', 'danish', 'danisch', 'danois', 'dunski', 'danese', 'danes', 'deens', 'dinamarques', 'danstina', 'danska', 'daneza', 'denmark', 'danemark', 'danmark'] },
  { code: 'ro', autonym: 'Română', terms: ['romana', 'romanian', 'rumanisch', 'roumain', 'rumunski', 'rumeno', 'rumano', 'roemeens', 'romeno', 'rumunstina', 'rumanska', 'rumaensk', 'romania', 'rumanien'] },
]

/** Klein-/diakritik-unabhängig für die Suche (é→e, č→c, ł→l, ß→ss …). */
function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/ß/g, 'ss')
    .replace(/ł/g, 'l')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
}

function Flag({ code }: { code: string }) {
  const common = { width: 24, height: 16, viewBox: '0 0 60 40', style: { display: 'block' as const } }
  switch (code) {
    case 'de':
      return (
        <svg {...common}>
          <rect width="60" height="40" fill="#000" />
          <rect y="13.33" width="60" height="13.33" fill="#DD0000" />
          <rect y="26.66" width="60" height="13.34" fill="#FFCE00" />
        </svg>
      )
    case 'fr':
      return (
        <svg {...common}>
          <rect width="60" height="40" fill="#fff" />
          <rect width="20" height="40" fill="#0055A4" />
          <rect x="40" width="20" height="40" fill="#EF4135" />
        </svg>
      )
    case 'pl':
      return (
        <svg {...common}>
          <rect width="60" height="20" fill="#fff" />
          <rect y="20" width="60" height="20" fill="#DC143C" />
        </svg>
      )
    case 'en':
      return (
        <svg {...common}>
          <clipPath id="ukclip">
            <rect width="60" height="40" />
          </clipPath>
          <g clipPath="url(#ukclip)">
            <rect width="60" height="40" fill="#012169" />
            <path d="M0,0 L60,40 M60,0 L0,40" stroke="#fff" strokeWidth="8" />
            <path d="M0,0 L60,40 M60,0 L0,40" stroke="#C8102E" strokeWidth="4" />
            <path d="M30,0 V40 M0,20 H60" stroke="#fff" strokeWidth="12" />
            <path d="M30,0 V40 M0,20 H60" stroke="#C8102E" strokeWidth="6" />
          </g>
        </svg>
      )
    case 'it':
      return (
        <svg {...common}>
          <rect width="60" height="40" fill="#fff" />
          <rect width="20" height="40" fill="#009246" />
          <rect x="40" width="20" height="40" fill="#CE2B37" />
        </svg>
      )
    case 'es':
      return (
        <svg {...common}>
          <rect width="60" height="40" fill="#AA151B" />
          <rect y="10" width="60" height="20" fill="#F1BF00" />
        </svg>
      )
    case 'nl':
      return (
        <svg {...common}>
          <rect width="60" height="40" fill="#fff" />
          <rect width="60" height="13.33" fill="#AE1C28" />
          <rect y="26.66" width="60" height="13.34" fill="#21468B" />
        </svg>
      )
    case 'pt':
      return (
        <svg {...common}>
          <rect width="60" height="40" fill="#FF0000" />
          <rect width="24" height="40" fill="#006600" />
          <circle cx="24" cy="20" r="6" fill="#FFCC00" stroke="#fff" strokeWidth="1" />
        </svg>
      )
    case 'cs':
      return (
        <svg {...common}>
          <rect width="60" height="20" fill="#fff" />
          <rect y="20" width="60" height="20" fill="#D7141A" />
          <path d="M0,0 L30,20 L0,40 Z" fill="#11457E" />
        </svg>
      )
    case 'sv':
      return (
        <svg {...common}>
          <rect width="60" height="40" fill="#006AA7" />
          <rect x="18" width="9" height="40" fill="#FECC00" />
          <rect y="15.5" width="60" height="9" fill="#FECC00" />
        </svg>
      )
    case 'da':
      return (
        <svg {...common}>
          <rect width="60" height="40" fill="#C8102E" />
          <rect x="18" width="9" height="40" fill="#fff" />
          <rect y="15.5" width="60" height="9" fill="#fff" />
        </svg>
      )
    case 'ro':
      return (
        <svg {...common}>
          <rect width="60" height="40" fill="#CE1126" />
          <rect width="20" height="40" fill="#002B7F" />
          <rect x="20" width="20" height="40" fill="#FCD116" />
        </svg>
      )
    default:
      return null
  }
}

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const wrapRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const active = LANG_META.find((l) => l.code === i18n.language) || LANG_META[0]

  const results = useMemo(() => {
    const q = norm(query)
    if (!q) return LANG_META
    return LANG_META.filter(
      (l) => l.code === q || norm(l.autonym).includes(q) || l.terms.some((term) => norm(term).includes(q)),
    )
  }, [query])

  const change = (code: string) => {
    void i18n.changeLanguage(code)
    try {
      localStorage.setItem(STORAGE_KEY, code) // eigene Wahl merken (überschreibt Auto)
    } catch {
      // localStorage kann blockiert sein — ignorieren.
    }
    setOpen(false)
    setQuery('')
  }

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        title={active.autonym}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          cursor: 'pointer',
          padding: '3px 6px 3px 3px',
          borderRadius: 7,
          background: 'var(--card, #fff)',
          border: '1px solid var(--border, rgba(20,30,40,0.18))',
        }}
      >
        <span style={{ lineHeight: 0, borderRadius: 3, overflow: 'hidden', display: 'flex' }}>
          <Flag code={active.code} />
        </span>
        <span
          style={{
            fontSize: 9,
            color: 'var(--muted-foreground, #8a93a0)',
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.12s',
          }}
        >
          ▾
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            width: 220,
            maxHeight: 320,
            display: 'flex',
            flexDirection: 'column',
            padding: 7,
            background: 'var(--popover, #fff)',
            color: 'var(--popover-foreground, #1a242e)',
            borderRadius: 9,
            border: '1px solid var(--border, rgba(20,30,40,0.14))',
            boxShadow: '0 8px 22px rgba(20,30,40,0.18)',
            zIndex: 60,
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('ls.search')}
            style={{
              padding: '7px 9px',
              borderRadius: 7,
              border: '1px solid var(--border, rgba(20,30,40,0.18))',
              background: 'var(--background, #fff)',
              color: 'inherit',
              fontSize: 13,
              marginBottom: 6,
              outline: 'none',
              width: '100%',
              boxSizing: 'border-box',
            }}
          />
          <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {results.map((l) => {
              const isActive = l.code === active.code
              return (
                <button
                  key={l.code}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => change(l.code)}
                  title={l.autonym}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 9,
                    cursor: 'pointer',
                    padding: '6px 8px',
                    borderRadius: 7,
                    background: isActive ? 'rgba(211,148,64,0.15)' : 'transparent',
                    border: isActive ? '1px solid var(--plixa-gold, #e3b14e)' : '1px solid transparent',
                    textAlign: 'left',
                    width: '100%',
                    color: 'inherit',
                  }}
                >
                  <span style={{ lineHeight: 0, borderRadius: 3, overflow: 'hidden', display: 'flex', flex: '0 0 auto' }}>
                    <Flag code={l.code} />
                  </span>
                  <span style={{ fontSize: 13.5 }}>{l.autonym}</span>
                </button>
              )
            })}
            {results.length === 0 && (
              <div style={{ padding: '8px', fontSize: 12.5, color: 'var(--muted-foreground, #8a93a0)' }}>
                {t('ls.none')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import type { ReactNode } from 'react'
import { triggerSFX } from './../../../lib/sfx-bus'
import { cn } from './../../../lib/utils'

export type SidebarTab = {
  id: string
  label: string
  mobileDefaultSnap?: number
  mobileIcon?: ReactNode
  /** Desktop icon shown in the vertical rail (v2 layout). */
  icon?: ReactNode
  /**
   * Where the entry sits in the desktop section nav. `'bottom'` pins it below a
   * flexible spacer (utility sections like settings / calculation), `'top'`
   * (default) keeps it in the main group at the top.
   */
  align?: 'top' | 'bottom'
}

interface TabBarProps {
  tabs: SidebarTab[]
  activeTab: string
  onTabChange: (id: string) => void
}

export function TabBar({ tabs, activeTab, onTabChange }: TabBarProps) {
  return (
    <div className="flex h-10 shrink-0 items-center gap-0.5 border-border/50 border-b px-2">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            className={cn(
              'relative h-7 rounded-md px-3 font-medium text-sm transition-colors',
              isActive
                ? 'bg-accent text-foreground'
                : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
            )}
            key={tab.id}
            onClick={() => {
              triggerSFX('sfx:menu-click')
              onTabChange(tab.id)
            }}
            onMouseEnter={() => triggerSFX('sfx:menu-hover')}
            type="button"
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

interface IconRailProps {
  tabs: SidebarTab[]
  /** Highlighted tab. Stays highlighted while the panel is collapsed. */
  activeTab: string
  /** True when the panel beside the rail is collapsed. */
  collapsed: boolean
  /** Clicking a rail icon: switch tab, or toggle the panel (see layout). */
  onIconClick: (id: string) => void
}

/**
 * Vertical section navigation for the v2 left column — Plixa-style: each entry
 * is a labeled row (icon + text) rather than an icon-only rail, so the sidebar
 * reads like the Plixa configurator's calm "Konfiguration" list. Always visible
 * (even when the detail panel is collapsed) so a click reopens the panel. The
 * active row gets a soft-amber pill with an amber indicator.
 *
 * Width is mirrored by `SECTION_NAV_WIDTH` in `editor-layout-v2` (the resize
 * math offsets the detail panel by it); keep them in sync.
 */
export function IconRail({ tabs, activeTab, collapsed, onIconClick }: IconRailProps) {
  const renderRow = (tab: SidebarTab) => {
    // Only show the active highlight while the panel is open. When collapsed
    // nothing is "open", so every row reads as unselected.
    const showActive = activeTab === tab.id && !collapsed
    return (
      <button
        className={cn(
          'group relative flex h-11 items-center gap-3 rounded-xl px-2.5 text-left font-medium text-[14px] transition-all duration-200',
          '[&_img]:!size-[22px] [&_img]:object-contain [&_img]:transition-[opacity,filter] [&_img]:duration-200 [&_svg]:!size-[22px]',
          showActive
            ? 'bg-sidebar-accent font-semibold text-sidebar-accent-foreground shadow-sm [&_img]:opacity-100 [&_img]:grayscale-0'
            : 'text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground [&_img]:opacity-55 [&_img]:grayscale group-hover:[&_img]:opacity-100 group-hover:[&_img]:grayscale-0',
        )}
        key={tab.id}
        onClick={() => {
          triggerSFX('sfx:menu-click')
          onIconClick(tab.id)
        }}
        onMouseEnter={() => triggerSFX('sfx:menu-hover')}
        type="button"
      >
        {showActive && (
          <span className="-translate-y-1/2 absolute top-1/2 left-0 h-5 w-[3px] rounded-full bg-[var(--plixa-amber)]" />
        )}
        <span className="flex size-[22px] shrink-0 items-center justify-center">
          {tab.icon ?? tab.label.charAt(0)}
        </span>
        <span className="truncate">{tab.label}</span>
      </button>
    )
  }

  // Utility sections (align: 'bottom') sink below a flexible spacer, so
  // primary sections stay grouped at the top and settings/calculation sit at
  // the foot of the nav — the calm Plixa arrangement.
  const topTabs = tabs.filter((t) => t.align !== 'bottom')
  const bottomTabs = tabs.filter((t) => t.align === 'bottom')

  return (
    <div className="flex h-full w-[186px] shrink-0 flex-col gap-1 border-sidebar-border border-r bg-sidebar px-2.5 py-3">
      {topTabs.map(renderRow)}
      {bottomTabs.length > 0 && <div className="mt-auto flex flex-col gap-1">{bottomTabs.map(renderRow)}</div>}
    </div>
  )
}

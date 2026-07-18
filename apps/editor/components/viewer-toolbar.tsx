'use client'
/*
 * © 2025–2026 HERRMANN SARL (Michael Herrmann). Alle Rechte vorbehalten.
 * Proprietär — keine Nutzung/Vervielfältigung/Bearbeitung/Dekompilierung ohne
 * schriftliche Genehmigung. Siehe apps/editor/LICENSE. Kontakt: mh.solarkraftwerk@gmail.com
 */

import { Icon as IconifyIcon } from '@iconify/react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  useEditor,
  useSidebarStore,
  type ViewMode,
} from '@pascal-app/editor'
import {
  CLAY_PALETTE,
  type EdgeMode,
  getSceneTheme,
  SCENE_THEMES,
  useViewer,
} from '@pascal-app/viewer'
import {
  Box,
  Check,
  ChevronsLeft,
  ChevronsRight,
  Columns2,
  Contrast,
  Eye,
  EyeOff,
  Footprints,
  Grid2X2,
  Magnet,
  PenLine,
  Scissors,
  SlidersHorizontal,
  Sparkles,
  SwatchBook,
} from 'lucide-react'
import Image from 'next/image'
import { type ReactNode, useCallback } from 'react'
import { flushSync } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from './toolbar-tooltip'

// Helle Glas-Karte (Plixa) statt dunkler Balken — schwebt über der 3D-Ansicht.
const TOOLBAR_CONTAINER =
  'inline-flex h-8 items-stretch overflow-hidden rounded-xl border border-border bg-card/90 shadow-lg backdrop-blur-md'

const TOOLBAR_BTN =
  'flex w-8 items-center justify-center text-muted-foreground transition-colors hover:bg-accent hover:text-foreground'

// Aktiver Zustand (neutral-warm, kein Zweit-Akzent).
const TOOLBAR_ACTIVE = 'bg-accent text-foreground'

function requestWalkthroughPointerLock() {
  const canvas = document.querySelector<HTMLCanvasElement>('[data-pascal-viewer-3d] canvas')
  if (!canvas) return

  if (!canvas.hasAttribute('tabindex')) {
    canvas.tabIndex = -1
  }
  canvas.focus({ preventScroll: true })

  if (document.pointerLockElement === canvas) return

  try {
    canvas.requestPointerLock?.()
  } catch {
    return
  }
}

function ToolbarTooltip({ children, label }: { children: ReactNode; label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  )
}

const VIEW_MODES: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
  {
    id: '3d',
    label: '3D',
    icon: (
      <Image
        alt=""
        className="h-3.5 w-3.5 object-contain"
        height={14}
        src="/icons/building.webp"
        width={14}
      />
    ),
  },
  {
    id: '2d',
    label: '2D',
    icon: (
      <Image
        alt=""
        className="h-3.5 w-3.5 object-contain"
        height={14}
        src="/icons/blueprint.webp"
        width={14}
      />
    ),
  },
  {
    id: 'split',
    label: 'Split',
    icon: <Columns2 className="h-3 w-3" />,
  },
]

const levelModeOrder = ['stacked', 'exploded', 'solo'] as const
// Modus → i18n-Schlüssel (Beschriftung wird beim Rendern übersetzt).
const levelModeKeys: Record<string, string> = {
  manual: 'levelStack',
  stacked: 'levelStack',
  exploded: 'levelExploded',
  solo: 'levelSolo',
}

const wallModeOrder = ['cutaway', 'up', 'down', 'translucent'] as const
const wallModeConfig: Record<string, { icon: string; key: string }> = {
  up: { icon: '/icons/room.webp', key: 'wallFull' },
  cutaway: { icon: '/icons/wallcut.webp', key: 'wallCutaway' },
  down: { icon: '/icons/walllow.webp', key: 'wallLow' },
  translucent: { icon: '/icons/wall.webp', key: 'wallTranslucent' },
}

const SHADING_OPTIONS = [
  { id: 'solid', nameKey: 'renderSolid', detailKey: 'renderSolidHint', icon: Box },
  { id: 'rendered', nameKey: 'renderRendered', detailKey: 'renderRenderedHint', icon: Sparkles },
] as const

function ViewModeControl() {
  const viewMode = useEditor((state) => state.viewMode)
  const setViewMode = useEditor((state) => state.setViewMode)

  return (
    <div className={TOOLBAR_CONTAINER}>
      {VIEW_MODES.map((mode) => {
        const isActive = viewMode === mode.id
        return (
          <ToolbarTooltip key={mode.id} label={mode.label}>
            <button
              aria-label={mode.label}
              aria-pressed={isActive}
              className={cn(
                'flex items-center justify-center gap-1.5 px-2.5 font-medium text-xs transition-colors',
                isActive
                  ? TOOLBAR_ACTIVE
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
              onClick={() => setViewMode(mode.id)}
              type="button"
            >
              {mode.icon}
              <span>{mode.label}</span>
            </button>
          </ToolbarTooltip>
        )
      })}
    </div>
  )
}

function CollapseSidebarButton() {
  const { t } = useTranslation()
  const isCollapsed = useSidebarStore((state) => state.isCollapsed)
  const setIsCollapsed = useSidebarStore((state) => state.setIsCollapsed)

  const toggle = useCallback(() => {
    setIsCollapsed(!isCollapsed)
  }, [isCollapsed, setIsCollapsed])

  const label = isCollapsed ? t('viewer.expandSidebar') : t('viewer.collapseSidebar')

  return (
    <div className={TOOLBAR_CONTAINER}>
      <ToolbarTooltip label={label}>
        <button aria-label={label} className={TOOLBAR_BTN} onClick={toggle} type="button">
          {isCollapsed ? (
            <ChevronsRight className="h-4 w-4" />
          ) : (
            <ChevronsLeft className="h-4 w-4" />
          )}
        </button>
      </ToolbarTooltip>
    </div>
  )
}

function LevelModeToggle() {
  const { t } = useTranslation()
  const levelMode = useViewer((state) => state.levelMode)
  const setLevelMode = useViewer((state) => state.setLevelMode)
  const isDefault = levelMode === 'stacked' || levelMode === 'manual'

  const cycle = () => {
    if (levelMode === 'manual') {
      setLevelMode('stacked')
      return
    }

    const index = levelModeOrder.indexOf(levelMode as (typeof levelModeOrder)[number])
    const next = levelModeOrder[(index + 1) % levelModeOrder.length]
    if (next) setLevelMode(next)
  }

  const modeLabel = t(`viewer.${levelModeKeys[levelMode] ?? 'levelStack'}`)

  return (
    <ToolbarTooltip label={`${t('viewer.levels')}: ${modeLabel}`}>
      <button
        className={cn(TOOLBAR_BTN, 'w-auto gap-1.5 px-2.5', !isDefault && TOOLBAR_ACTIVE)}
        onClick={cycle}
        type="button"
      >
        {levelMode === 'solo' ? (
          <IconifyIcon height={14} icon="lucide:diamond" width={14} />
        ) : levelMode === 'exploded' ? (
          <IconifyIcon height={14} icon="charm:stack-pop" width={14} />
        ) : (
          <IconifyIcon height={14} icon="charm:stack-push" width={14} />
        )}
        <span className="font-medium text-xs">{modeLabel}</span>
      </button>
    </ToolbarTooltip>
  )
}

function WallModeToggle() {
  const { t } = useTranslation()
  const wallMode = useViewer((state) => state.wallMode)
  const setWallMode = useViewer((state) => state.setWallMode)
  const config = wallModeConfig[wallMode] ?? wallModeConfig.cutaway!

  const cycle = () => {
    const index = wallModeOrder.indexOf(wallMode as (typeof wallModeOrder)[number])
    const next = wallModeOrder[(index + 1) % wallModeOrder.length]
    if (next) setWallMode(next)
  }

  const modeLabel = t(`viewer.${config.key}`)

  return (
    <ToolbarTooltip label={`${t('viewer.walls')}: ${modeLabel}`}>
      <button
        className={cn(
          TOOLBAR_BTN,
          'w-auto gap-1.5 px-2.5',
          wallMode !== 'cutaway'
            ? TOOLBAR_ACTIVE
            : 'opacity-60 grayscale hover:opacity-100 hover:grayscale-0',
        )}
        onClick={cycle}
        type="button"
      >
        <Image alt="" className="h-4 w-4 object-contain" height={16} src={config.icon} width={16} />
        <span className="font-medium text-xs">{modeLabel}</span>
      </button>
    </ToolbarTooltip>
  )
}

// One dropdown that gathers every "how the scene looks" control: grid, shadows,
// camera projection, units, render mode, edges and scene theme.

const EDGE_OPTIONS = [
  { id: 'off', nameKey: 'edgeOff', detailKey: 'edgeOffHint' },
  { id: 'soft', nameKey: 'edgeSoft', detailKey: 'edgeSoftHint' },
  { id: 'strong', nameKey: 'edgeStrong', detailKey: 'edgeStrongHint' },
] as const satisfies readonly { id: EdgeMode; nameKey: string; detailKey: string }[]

const SUBMENU_CONTENT_CLASS = 'min-w-56 rounded-xl border-border/45 bg-popover/95 backdrop-blur-xl'

function DisplayMenu() {
  const showGrid = useViewer((state) => state.showGrid)
  const setShowGrid = useViewer((state) => state.setShowGrid)
  const unit = useViewer((state) => state.unit)
  const setUnit = useViewer((state) => state.setUnit)
  const cameraMode = useViewer((state) => state.cameraMode)
  const setCameraMode = useViewer((state) => state.setCameraMode)
  const shading = useViewer((state) => state.shading)
  const setShading = useViewer((state) => state.setShading)
  const sceneTheme = useViewer((state) => state.sceneTheme)
  const setSceneTheme = useViewer((state) => state.setSceneTheme)
  const edges = useViewer((state) => state.edges)
  const setEdges = useViewer((state) => state.setEdges)
  const shadows = useViewer((state) => state.shadows)
  const setShadows = useViewer((state) => state.setShadows)
  const magneticSnap = useEditor((state) => state.magneticSnap)
  const setMagneticSnap = useEditor((state) => state.setMagneticSnap)

  const { t } = useTranslation()
  const activeShading =
    SHADING_OPTIONS.find((option) => option.id === shading) ?? SHADING_OPTIONS[0]
  const activeEdges = EDGE_OPTIONS.find((option) => option.id === edges) ?? EDGE_OPTIONS[0]
  const activeTheme = getSceneTheme(sceneTheme)

  // Keep the menu open when flipping a toggle.
  const keepOpen = (event: Event, fn: () => void) => {
    event.preventDefault()
    fn()
  }

  return (
    <DropdownMenu>
      <ToolbarTooltip label={t('viewer.displaySettings')}>
        <DropdownMenuTrigger asChild>
          <button
            aria-label={t('viewer.displaySettings')}
            className={cn(TOOLBAR_BTN, 'w-auto gap-1.5 px-2.5 text-foreground')}
            type="button"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 shrink-0" />
            <span className="font-medium text-xs">{t('viewer.display')}</span>
          </button>
        </DropdownMenuTrigger>
      </ToolbarTooltip>
      <DropdownMenuContent
        align="end"
        className="w-60 rounded-xl border-border/45 bg-popover/95 backdrop-blur-xl"
        side="bottom"
        sideOffset={8}
      >
        <DropdownMenuItem onSelect={(e) => keepOpen(e, () => setShowGrid(!showGrid))}>
          <Grid2X2 className="h-4 w-4" />
          <span>{t('viewer.grid')}</span>
          {showGrid ? (
            <Eye className="ml-auto h-4 w-4 text-foreground" />
          ) : (
            <EyeOff className="ml-auto h-4 w-4 text-muted-foreground" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={(e) => keepOpen(e, () => setMagneticSnap(!magneticSnap))}>
          <Magnet className="h-4 w-4" />
          <span>{t('viewer.snap')}</span>
          <span className="ml-auto text-muted-foreground text-xs">
            {magneticSnap ? t('viewer.on') : t('viewer.off')}
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={(e) => keepOpen(e, () => setShadows(!shadows))}>
          <Contrast className="h-4 w-4" />
          <span>{t('viewer.shadows')}</span>
          <span className="ml-auto text-muted-foreground text-xs">
            {shadows ? t('viewer.on') : t('viewer.off')}
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(e) =>
            keepOpen(e, () =>
              setCameraMode(cameraMode === 'perspective' ? 'orthographic' : 'perspective'),
            )
          }
        >
          <IconifyIcon
            height={16}
            icon={cameraMode === 'perspective' ? 'icon-park-outline:perspective' : 'vaadin:grid'}
            width={16}
          />
          <span>{t('viewer.camera')}</span>
          <span className="ml-auto text-muted-foreground text-xs">
            {cameraMode === 'perspective' ? t('viewer.perspective') : t('viewer.ortho')}
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(e) => keepOpen(e, () => setUnit(unit === 'metric' ? 'imperial' : 'metric'))}
        >
          <span className="flex h-4 w-4 items-center justify-center font-semibold text-[10px]">
            {unit === 'metric' ? 'm' : 'ft'}
          </span>
          <span>{t('viewer.units')}</span>
          <span className="ml-auto text-muted-foreground text-xs">
            {unit === 'metric' ? t('viewer.metric') : t('viewer.imperial')}
          </span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <activeShading.icon className="h-4 w-4" />
            <span>{t('viewer.render')}</span>
            <span className="ml-auto text-muted-foreground text-xs">
              {t(`viewer.${activeShading.nameKey}`)}
            </span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className={SUBMENU_CONTENT_CLASS}>
            {SHADING_OPTIONS.map((option) => {
              const OptionIcon = option.icon
              return (
                <DropdownMenuItem key={option.id} onSelect={() => setShading(option.id)}>
                  <OptionIcon className="h-4 w-4" />
                  <div className="flex flex-col">
                    <span className="text-foreground">{t(`viewer.${option.nameKey}`)}</span>
                    <span className="text-muted-foreground text-xs">
                      {t(`viewer.${option.detailKey}`)}
                    </span>
                  </div>
                  {shading === option.id ? (
                    <Check className="ml-auto h-4 w-4 text-foreground" />
                  ) : null}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <PenLine className="h-4 w-4" />
            <span>{t('viewer.edges')}</span>
            <span className="ml-auto text-muted-foreground text-xs">
              {t(`viewer.${activeEdges.nameKey}`)}
            </span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className={SUBMENU_CONTENT_CLASS}>
            {EDGE_OPTIONS.map((option) => (
              <DropdownMenuItem key={option.id} onSelect={() => setEdges(option.id)}>
                <div className="flex flex-col">
                  <span className="text-foreground">{t(`viewer.${option.nameKey}`)}</span>
                  <span className="text-muted-foreground text-xs">
                    {t(`viewer.${option.detailKey}`)}
                  </span>
                </div>
                {edges === option.id ? <Check className="ml-auto h-4 w-4 text-foreground" /> : null}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <SwatchBook className="h-4 w-4" />
            <span>{t('viewer.theme')}</span>
            <span className="ml-auto truncate text-muted-foreground text-xs">
              {activeTheme.name}
            </span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="min-w-48 rounded-xl border-border/45 bg-popover/95 backdrop-blur-xl">
            {SCENE_THEMES.map((theme) => {
              const swatches = (['wall', 'roof', 'floor', 'glazing'] as const).map(
                (role) => theme.clayTints?.[role] ?? CLAY_PALETTE[role],
              )
              return (
                <DropdownMenuItem key={theme.id} onSelect={() => setSceneTheme(theme.id)}>
                  <span
                    className="grid h-5 w-5 shrink-0 grid-cols-2 overflow-hidden rounded-sm border border-black/10"
                    style={{ backgroundColor: theme.background }}
                  >
                    {swatches.map((color, index) => (
                      <span key={`${theme.id}-${index}`} style={{ backgroundColor: color }} />
                    ))}
                  </span>
                  <span className="text-foreground">{theme.name}</span>
                  {sceneTheme === theme.id ? (
                    <Check className="ml-auto h-4 w-4 text-foreground" />
                  ) : null}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// „Dach ausblenden / Blick hinein": waagerechter Schnitt am exakten (einteiligen)
// Haus-Modell. Ein/Aus + zwei Höhen-Regler (oben/unten) → Dach weg oder nur eine
// Etage sichtbar, damit man drin möblieren kann. Radix-Dropdown wird portalt,
// also nicht vom overflow-hidden der Toolbar abgeschnitten.
function SectionControl() {
  const { t } = useTranslation()
  const enabled = useViewer((state) => state.sectionEnabled)
  const min = useViewer((state) => state.sectionMin)
  const max = useViewer((state) => state.sectionMax)
  const setSection = useViewer((state) => state.setSection)

  return (
    <DropdownMenu>
      <ToolbarTooltip label={t('section.title', { defaultValue: 'Dach / Schnitt' })}>
        <DropdownMenuTrigger asChild>
          <button
            aria-label={t('section.title', { defaultValue: 'Dach / Schnitt' })}
            className={cn(TOOLBAR_BTN, 'w-auto gap-1.5 px-2.5', enabled && TOOLBAR_ACTIVE)}
            type="button"
          >
            <Scissors className="h-3.5 w-3.5 shrink-0" />
            <span className="font-medium text-xs">{t('section.short', { defaultValue: 'Dach' })}</span>
          </button>
        </DropdownMenuTrigger>
      </ToolbarTooltip>
      <DropdownMenuContent
        align="end"
        className="w-64 rounded-xl border-border/45 bg-popover/95 p-3 backdrop-blur-xl"
        side="bottom"
        sideOffset={8}
      >
        <label className="flex cursor-pointer items-center justify-between gap-2 text-foreground text-sm">
          <span>{t('section.hide', { defaultValue: 'Dach ausblenden' })}</span>
          <input
            checked={enabled}
            onChange={(e) => setSection({ enabled: e.target.checked })}
            type="checkbox"
          />
        </label>
        <div className={cn('mt-3 flex flex-col gap-3', !enabled && 'pointer-events-none opacity-40')}>
          <div>
            <div className="mb-1 flex justify-between text-muted-foreground text-xs">
              <span>{t('section.top', { defaultValue: 'Schnitt oben' })}</span>
              <span className="tabular-nums">{max.toFixed(1)} m</span>
            </div>
            <input
              className="w-full accent-[var(--plixa-amber,#d39440)]"
              max={12}
              min={0}
              onChange={(e) => setSection({ max: Number(e.target.value) })}
              step={0.1}
              type="range"
              value={max}
            />
          </div>
          <div>
            <div className="mb-1 flex justify-between text-muted-foreground text-xs">
              <span>{t('section.bottom', { defaultValue: 'Schnitt unten' })}</span>
              <span className="tabular-nums">{min.toFixed(1)} m</span>
            </div>
            <input
              className="w-full accent-[var(--plixa-amber,#d39440)]"
              max={12}
              min={0}
              onChange={(e) => setSection({ min: Number(e.target.value) })}
              step={0.1}
              type="range"
              value={min}
            />
          </div>
        </div>
        <button
          className="mt-3 w-full rounded-lg bg-accent px-3 py-1.5 font-medium text-foreground text-xs transition hover:brightness-105"
          onClick={() => setSection({ enabled: true, min: 0, max: 3 })}
          type="button"
        >
          {t('section.groundOnly', { defaultValue: 'Nur Erdgeschoss zeigen' })}
        </button>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function WalkthroughButton() {
  const { t } = useTranslation()
  const isFirstPersonMode = useEditor((state) => state.isFirstPersonMode)
  const setFirstPersonMode = useEditor((state) => state.setFirstPersonMode)
  const handleClick = useCallback(() => {
    if (isFirstPersonMode) {
      setFirstPersonMode(false)
      return
    }

    flushSync(() => setFirstPersonMode(true))
    requestWalkthroughPointerLock()
  }, [isFirstPersonMode, setFirstPersonMode])

  return (
    <ToolbarTooltip label={t('viewer.walkthrough')}>
      <button
        className={cn(TOOLBAR_BTN, isFirstPersonMode && 'bg-accent text-primary')}
        onClick={handleClick}
        type="button"
      >
        <Footprints className="h-4 w-4" />
      </button>
    </ToolbarTooltip>
  )
}

function PreviewButton() {
  const { t } = useTranslation()
  return (
    <ToolbarTooltip label={t('viewer.preview')}>
      <button
        className="flex items-center gap-1.5 px-2.5 font-medium text-muted-foreground text-xs transition-colors hover:bg-accent hover:text-foreground"
        onClick={() => useEditor.getState().setPreviewMode(true)}
        type="button"
      >
        <Eye className="h-3.5 w-3.5 shrink-0" />
        <span>{t('viewer.preview')}</span>
      </button>
    </ToolbarTooltip>
  )
}

export function CommunityViewerToolbarLeft() {
  return (
    <>
      <CollapseSidebarButton />
      <ViewModeControl />
    </>
  )
}

export function CommunityViewerToolbarRight() {
  return (
    <div className={TOOLBAR_CONTAINER}>
      <LevelModeToggle />
      <WallModeToggle />
      <SectionControl />
      <div className="my-1.5 w-px bg-border/50" />
      <DisplayMenu />
      <div className="my-1.5 w-px bg-border/50" />
      <WalkthroughButton />
      <PreviewButton />
    </div>
  )
}

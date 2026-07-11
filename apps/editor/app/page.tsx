'use client'

import { Editor, ItemsPanel } from '@pascal-app/editor'
import { Hammer, Layers, Package, Settings } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BackToPlixaButton } from '@/components/back-to-plixa-button'
import { PlixaHeader } from '@/components/plixa-header'
import { BuildTab } from '@/components/build-tab'
import { IfcImportOverlay } from '@/components/ifc-import-overlay'
import {
  CommunityViewerToolbarLeft,
  CommunityViewerToolbarRight,
} from '@/components/viewer-toolbar'
import { createIfcOnLoad, readIfcHandoffUrl } from '@/lib/ifc-handoff'

// The open-source editor only ships the built-in catalog (no uploaded items),
// so the Library/Community/Mine source chips and tag filters add nothing —
// drop them and keep the panel to plain categories.
function EditorItemsPanel() {
  return <ItemsPanel showSourceFilter={false} showTagFilters={false} />
}

// Static per-tab config; the visible label is translated at render time via the
// `labelKey`, so the sidebar follows the active Plixa language.
const SIDEBAR_TAB_CONFIG = [
  {
    id: 'site',
    labelKey: 'tab.scene',
    component: () => null,
    mobileDefaultSnap: 0.5,
    mobileIcon: <Layers className="h-5 w-5" />,
    icon: (
      <Image
        alt=""
        className="h-8 w-8 object-contain"
        height={32}
        src="/icons/scene.webp"
        width={32}
      />
    ),
  },
  {
    id: 'build',
    labelKey: 'tab.build',
    component: BuildTab,
    mobileDefaultSnap: 0.5,
    mobileIcon: <Hammer className="h-5 w-5" />,
    icon: (
      <Image
        alt=""
        className="h-8 w-8 object-contain"
        height={32}
        src="/icons/build.webp"
        width={32}
      />
    ),
  },
  {
    id: 'items',
    labelKey: 'tab.items',
    component: EditorItemsPanel,
    mobileDefaultSnap: 0.5,
    mobileIcon: <Package className="h-5 w-5" />,
    icon: (
      <Image
        alt=""
        className="h-8 w-8 object-contain"
        height={32}
        src="/icons/couch.webp"
        width={32}
      />
    ),
  },
  {
    id: 'settings',
    labelKey: 'tab.settings',
    component: () => null,
    mobileDefaultSnap: 0.5,
    mobileIcon: <Settings className="h-5 w-5" />,
    icon: (
      <Image
        alt=""
        className="h-8 w-8 object-contain"
        height={32}
        src="/icons/settings.webp"
        width={32}
      />
    ),
  },
] as const

const PROJECT_ID = 'local-editor'

export default function Home() {
  const { t } = useTranslation()
  const sidebarTabs = SIDEBAR_TAB_CONFIG.map((tab) => ({ ...tab, label: t(tab.labelKey) }))

  // Hinweg-Übergabe: liegt `?ifc=<r2-url>` an, lädt der Editor sein Startbild aus
  // der IFC-Datei (statt aus localStorage) — direkt editierbar im gleichen Store.
  const [ifcUrl] = useState<string | null>(() => readIfcHandoffUrl())
  const [importProgress, setImportProgress] = useState<{ message: string; percent: number } | null>(
    null,
  )
  const onLoad = useMemo(
    () =>
      ifcUrl
        ? createIfcOnLoad(ifcUrl, (message, percent) => setImportProgress({ message, percent }))
        : undefined,
    [ifcUrl],
  )

  return (
    <div className="relative h-screen w-screen">
      {ifcUrl && importProgress && importProgress.percent < 100 && (
        <IfcImportOverlay message={importProgress.message} percent={importProgress.percent} />
      )}
      {PROJECT_ID === 'local-editor' && (
        <div className="pointer-events-none absolute top-3 left-1/2 z-40 -translate-x-1/2">
          <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-border/60 bg-background/90 px-4 py-1.5 text-xs shadow-sm backdrop-blur">
            <span className="text-muted-foreground">{t('app.localScenes')}</span>
            <Link className="font-medium text-foreground hover:underline" href="/scenes">
              {t('app.openRecent')}
            </Link>
            <span aria-hidden className="text-muted-foreground">
              ·
            </span>
            <Link className="font-medium text-foreground hover:underline" href="/scenes">
              {t('app.createNew')}
            </Link>
          </div>
        </div>
      )}
      <Editor
        layoutVersion="v2"
        projectId={PROJECT_ID}
        onLoad={onLoad}
        onLoaderChange={(visible) => {
          if (!visible) setImportProgress(null)
        }}
        sidebarTabs={sidebarTabs}
        sidebarTop={<PlixaHeader />}
        viewerToolbarLeft={<CommunityViewerToolbarLeft />}
        viewerToolbarRight={
          <>
            <BackToPlixaButton />
            <CommunityViewerToolbarRight />
          </>
        }
      />
    </div>
  )
}

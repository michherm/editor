'use client'

import { Editor, ItemsPanel, loadSceneFromLocalStorage } from '@pascal-app/editor'
import { Hammer, Layers, Package, Settings } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PlixaNavbar } from '@/components/plixa-navbar'
import { BuildTab } from '@/components/build-tab'
import { IfcImportOverlay } from '@/components/ifc-import-overlay'
import { uploadLocalScan } from '@/lib/local-scan-upload'
import {
  CommunityViewerToolbarLeft,
  CommunityViewerToolbarRight,
} from '@/components/viewer-toolbar'
import {
  createIfcOnLoad,
  readGeoHandoffUrl,
  readIfcHandoffUrl,
  readProjectHandoffId,
} from '@/lib/ifc-handoff'

// Merkt sich die zuletzt geöffnete Plixa-Projekt-ID. Kommt beim erneuten
// „Gestalten" dieselbe `&project=`-ID an, setzt der Editor die gespeicherte
// Bearbeitung fort (statt neu aus `geo` zu bauen).
const LAST_PROJECT_KEY = 'plixa-last-project'

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
  // Weg B: exakte Plixa-Geometrie als GLB (`&geo=`) — falls vorhanden, ist sie
  // die angezeigte Geometrie; die IFC liefert die editierbaren Knoten.
  const [geoUrl] = useState<string | null>(() => readGeoHandoffUrl())
  // Stabile Plixa-Projekt-ID (`&project=`). Gleich wie beim letzten Öffnen →
  // Bearbeitung fortsetzen; neu/anders → frisch aus `geo` bauen.
  const [projectHandoffId] = useState<string | null>(() => readProjectHandoffId())
  const [continueSession] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !projectHandoffId) return false
    return window.localStorage.getItem(LAST_PROJECT_KEY) === projectHandoffId
  })
  // Dieses Projekt als zuletzt geöffnetes merken (für den nächsten „Gestalten"-Sprung).
  useEffect(() => {
    if (projectHandoffId && typeof window !== 'undefined') {
      window.localStorage.setItem(LAST_PROJECT_KEY, projectHandoffId)
    }
  }, [projectHandoffId])
  const [importProgress, setImportProgress] = useState<{ message: string; percent: number } | null>(
    null,
  )
  const [importError, setImportError] = useState<string | null>(null)
  const onLoad = useMemo(() => {
    if (!ifcUrl) return undefined
    const build = createIfcOnLoad(
      ifcUrl,
      geoUrl,
      (message, percent) => setImportProgress({ message, percent }),
      (message) => setImportError(message),
    )
    // Weiterarbeiten: gleiches Projekt wie zuletzt → die gespeicherte Szene
    // (deine Bearbeitung) wiederherstellen, sonst frisch aus `geo` bauen. Fehlt
    // eine gültige gespeicherte Szene, fällt es sauber auf den Neuaufbau zurück.
    if (!continueSession) return build
    return async () => {
      const saved = loadSceneFromLocalStorage()
      if (saved && (saved.rootNodeIds?.length ?? 0) > 0) return saved
      return build()
    }
  }, [ifcUrl, geoUrl, continueSession])

  return (
    <div className="relative h-screen w-screen">
      {ifcUrl && (importError || (importProgress && importProgress.percent < 100)) && (
        <IfcImportOverlay
          message={importProgress?.message ?? ''}
          percent={importProgress?.percent ?? 0}
          error={importError}
        />
      )}
      {PROJECT_ID === 'local-editor' && (
        <div className="pointer-events-none absolute top-16 left-1/2 z-40 hidden -translate-x-1/2 lg:block">
          <div className="plixa-card plixa-rise pointer-events-auto flex items-center gap-3 rounded-full px-4 py-1.5 text-xs">
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
      {/* Dezenter Start-Hinweis: was man hier tun kann (nur Desktop, unten mittig). */}
      <div className="pointer-events-none absolute bottom-24 left-1/2 z-30 hidden -translate-x-1/2 lg:block">
        <div className="plixa-card plixa-rise rounded-full px-3.5 py-1.5 text-[11px] text-muted-foreground">
          {t('app.startHint')}
        </div>
      </div>
      <Editor
        layoutVersion="v2"
        projectId={PROJECT_ID}
        onLoad={onLoad}
        onLoaderChange={(visible) => {
          if (!visible) setImportProgress(null)
        }}
        sidebarTabs={sidebarTabs}
        navbarSlot={<PlixaNavbar />}
        sitePanelProps={{
          // Eigene 3D-Modelle (.glb/.gltf) lokal laden — freies Programm, kein
          // Backend nötig. Bilder (Grundriss/Scan) laufen bereits lokal.
          onUploadAsset: (_projectId, levelId, file, type) => {
            if (type === 'scan') void uploadLocalScan(file, levelId)
          },
        }}
        viewerToolbarLeft={<CommunityViewerToolbarLeft />}
        viewerToolbarRight={<CommunityViewerToolbarRight />}
      />
    </div>
  )
}

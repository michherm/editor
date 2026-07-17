'use client'

import { cn } from '../../lib/utils'

interface SceneLoaderProps {
  className?: string
  fullScreen?: boolean
}

/**
 * Einheitlicher Warte-Indikator: immer die drei senkrechten Balken, die hoch und
 * runter laufen (`pascal-loader-2`) — bewusst NICHT mehr zufällig gewählt, damit
 * überall im Editor dasselbe „Wartesystem" erscheint (wie im Import-Overlay und
 * am „Zurück zu Plixa"-Knopf). Farbe: Plixa-Amber, Fallback auf currentColor.
 */
export function SceneLoader({ className, fullScreen = false }: SceneLoaderProps) {
  return (
    <div
      className={cn(
        'z-100 flex items-center justify-center bg-background/80 backdrop-blur-md transition-opacity duration-300',
        fullScreen ? 'fixed inset-0' : 'absolute inset-0',
        className,
      )}
    >
      <div
        className="pascal-loader-2 opacity-90"
        style={{ color: 'var(--plixa-amber, currentColor)' }}
      />
    </div>
  )
}

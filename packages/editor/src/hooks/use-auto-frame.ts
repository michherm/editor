'use client'

import { emitter, useScene } from '@pascal-app/core'
import { useEffect, useRef } from 'react'
import { computeSceneBoundsXZ } from '../lib/scene-bounds'

/**
 * Auto-frame the camera onto a freshly loaded scene.
 *
 * Motivation: when the MCP `setScene` tool (or any other entry point) swaps
 * the scene graph while the default camera is pointing at empty space, the
 * user sees a black viewport. This hook subscribes to the core scene store
 * and, whenever `nodes` transitions from empty → non-empty, computes the
 * XZ bounds of the new scene and emits `camera-controls:fit-scene`. The
 * `<CustomCameraControls />` component picks up that event and frames the
 * camera onto the bounds.
 *
 * Mount in exactly ONE component (the Editor). It holds no state of its own;
 * the subscription is torn down on unmount.
 */
export function useAutoFrame(): void {
  // Track the previous node count so we can detect the empty → non-empty edge.
  const wasEmptyRef = useRef(true)

  useEffect(() => {
    // Initialise from current store state so a remount after a setScene
    // doesn't re-frame an already-populated scene.
    wasEmptyRef.current = Object.keys(useScene.getState().nodes).length === 0

    const unsubscribe = useScene.subscribe((state) => {
      const isEmpty = Object.keys(state.nodes).length === 0
      const wasEmpty = wasEmptyRef.current
      wasEmptyRef.current = isEmpty

      // Only react to empty → non-empty transitions. Normal edits keep both
      // flags false; a `clearScene()` goes non-empty → empty and is ignored.
      if (!wasEmpty || isEmpty) return

      const bounds = computeSceneBoundsXZ(state.nodes)
      emitter.emit('camera-controls:fit-scene', bounds ? { bounds } : {})
    })

    return unsubscribe
  }, [])
}

/**
 * Imperatively frame the camera onto whatever is CURRENTLY in the scene store.
 *
 * `useAutoFrame` only reacts to an empty → non-empty edge, which a host that
 * SWAPS one scene for another (e.g. the editor replacing a bootstrap scene with
 * an imported house via `onLoad`) never crosses — so the imported scene would
 * keep the default camera pose. Call this after such a load completes to force a
 * correct fit. Safe to call any time; a null-bounds scene falls back to the
 * camera's default pose.
 */
export function frameCurrentScene(): void {
  const bounds = computeSceneBoundsXZ(useScene.getState().nodes)
  emitter.emit('camera-controls:fit-scene', bounds ? { bounds } : {})
}

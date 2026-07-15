import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import {
  getCatalogMaterialById,
  MATERIAL_CATALOG,
  MATERIAL_CATEGORIES,
  toLibraryMaterialRef,
} from '@pascal-app/core'
import type { AnyNode, AnyNodeId } from '@pascal-app/core/schema'
import { z } from 'zod'
import type { SceneOperations } from '../operations'
import { ErrorCode, throwMcpError } from './errors'
import { publishLiveSceneSnapshot } from './live-sync'

/**
 * `list_materials` – expose the built-in material catalog so the assistant can
 * pick a finish by id when calling `set_surface_material`. Pure data (id, label,
 * category); optionally filtered by category.
 */
export function registerListMaterials(server: McpServer): void {
  server.registerTool(
    'list_materials',
    {
      title: 'List materials',
      description:
        'List the built-in material catalog (flat colours plus textures: wood, stone, brick, tile, concrete, metal, fabric, leather, roofing, glass) that can be applied with set_surface_material. Optionally filter by category. Returns each material as { id, label, category } — pass the id to set_surface_material.',
      inputSchema: { category: z.enum(MATERIAL_CATEGORIES).optional() },
      outputSchema: {
        materials: z.array(
          z.object({ id: z.string(), label: z.string(), category: z.string() }),
        ),
      },
    },
    async ({ category }) => {
      const materials = MATERIAL_CATALOG.filter((m) => !category || m.category === category).map(
        (m) => ({ id: m.id, label: m.label, category: m.category }),
      )
      const payload = { materials }
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(payload) }],
        structuredContent: payload,
      }
    },
  )
}

const SURFACE_SIDE = z.enum(['interior', 'exterior', 'both'])

/**
 * `set_surface_material` – apply a catalog material to a wall surface. Walls
 * store finishes on `slots.interior` / `slots.exterior` as a `library:<id>`
 * reference (same model the manual paint mode writes). Reading the existing
 * slots and merging keeps the other side untouched.
 */
export function registerSetSurfaceMaterial(server: McpServer, bridge: SceneOperations): void {
  server.registerTool(
    'set_surface_material',
    {
      title: 'Set surface material',
      description:
        'Apply a catalog material (get valid ids from list_materials) to a wall. side: "interior" = the room-facing face (default), "exterior" = the outside/facade, "both". Use find_nodes / get_scene to get the wall nodeId.',
      inputSchema: {
        nodeId: z.string(),
        materialId: z.string(),
        side: SURFACE_SIDE.optional(),
      },
      outputSchema: {
        nodeId: z.string(),
        side: z.string(),
        materialId: z.string(),
        label: z.string(),
      },
    },
    async ({ nodeId, materialId, side }) => {
      const node = bridge.getNode(nodeId as AnyNodeId)
      if (!node) {
        throwMcpError(ErrorCode.InvalidParams, `Node not found: ${nodeId}`)
      }
      if (node.type !== 'wall') {
        throwMcpError(
          ErrorCode.InvalidParams,
          `Node ${nodeId} is a ${node.type}; set_surface_material currently supports walls. Use list_materials for valid materials.`,
        )
      }
      const material = getCatalogMaterialById(materialId)
      if (!material) {
        throwMcpError(
          ErrorCode.InvalidParams,
          `Unknown materialId "${materialId}". Call list_materials to see valid ids.`,
        )
      }

      const ref = toLibraryMaterialRef(materialId)
      const existing = { ...((node as { slots?: Record<string, string> }).slots ?? {}) }
      const sides = side === 'both' ? (['interior', 'exterior'] as const) : [side ?? 'interior']
      for (const s of sides) existing[s] = ref

      bridge.applyPatch([
        { op: 'update', id: nodeId as AnyNodeId, data: { slots: existing } as Partial<AnyNode> },
      ])
      await publishLiveSceneSnapshot(bridge, 'set_surface_material')

      const payload = { nodeId, side: side ?? 'interior', materialId, label: material.label }
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(payload) }],
        structuredContent: payload,
      }
    },
  )
}

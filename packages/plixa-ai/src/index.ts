import type { Plugin } from '@pascal-app/core'

/**
 * Plixa-KI-Plugin — ein Chat-Panel „Plixa KI" in der linken Leiste. Der Nutzer
 * beschreibt in Alltagssprache, was gebaut/geändert werden soll; Claude fährt
 * serverseitig (`/api/ai/chat`) Pascals MCP-Werkzeuge und die Szene ändert sich
 * live im Browser. Der API-Key bleibt serverseitig.
 */
export const plixaAiPlugin: Plugin = {
  id: 'plixa:ai',
  apiVersion: 1,
  panels: [
    {
      id: 'plixa-ai',
      label: 'Plixa KI',
      icon: { kind: 'iconify', name: 'lucide:sparkles' },
      component: () => import('./panel'),
    },
  ],
}

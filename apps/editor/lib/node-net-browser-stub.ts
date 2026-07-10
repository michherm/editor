/**
 * Browser-Stub für `node:net`, nur im Client-Bundle aliasiert (siehe
 * next.config `turbopack.resolveAlias`).
 *
 * Grund: `@pascal-app/mcp` zieht über die (im Chat ungenutzten) Vision-Tools
 * `lib/safe-fetch` herein, das `isIPv4`/`isIPv6` aus `node:net` importiert.
 * Diese Funktionen laufen nur in der SSRF-Prüfung serverseitiger Fetches — im
 * Browser werden die Vision-Tools nie aufgerufen. Diese leichten Ersätze reichen
 * also, damit das Client-Bundle baut; serverseitig bleibt das echte `node:net`.
 */
export function isIPv4(value: string): boolean {
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(value)
}

export function isIPv6(value: string): boolean {
  return typeof value === 'string' && value.includes(':')
}

export default { isIPv4, isIPv6 }

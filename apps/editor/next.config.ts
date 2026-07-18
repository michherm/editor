import type { NextConfig } from 'next'

// Origins, die den Editor in einem iframe einbetten dürfen (Plixa bettet ihn als
// Vollbild-iframe ein, statt wegzunavigieren). `frame-ancestors` ersetzt das alte
// X-Frame-Options und erlaubt gezielt nur diese Origins — kein DENY/SAMEORIGIN,
// sonst würde das Framing scheitern. `*.vercel.app` deckt die Plixa-Preview- und
// Prod-Deployments ab; localhost fürs lokale Testen.
const FRAME_ANCESTORS = [
  "'self'",
  'https://plixa-ten.vercel.app',
  'https://*.vercel.app',
  'http://localhost:3000',
].join(' ')

const nextConfig: NextConfig = {
  logging: {
    browserToTerminal: true,
  },
  // Härtung: KEINE öffentlichen Browser-Source-Maps in Produktion. Das ist zwar
  // ohnehin der Next-Default, aber explizit gesetzt, damit niemand es versehentlich
  // aktiviert — Source Maps würden den lesbaren Originalcode vollständig preisgeben.
  productionBrowserSourceMaps: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: `frame-ancestors ${FRAME_ANCESTORS}` },
        ],
      },
    ]
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: [
    'three',
    '@pascal-app/viewer',
    '@pascal-app/core',
    '@pascal-app/editor',
    '@pascal-app/ifc-converter',
    '@pascal-app/mcp',
    '@pascal-app/plugin-trees',
    '@plixa/stairs',
    '@plixa/ai',
    '@dgreenheck/ez-tree',
  ],
  turbopack: {
    resolveAlias: {
      react: './node_modules/react',
      three: './node_modules/three',
      '@react-three/fiber': './node_modules/@react-three/fiber',
      '@react-three/drei': './node_modules/@react-three/drei',
      // Nur im Browser-Bundle: `node:net` durch einen Stub ersetzen, damit die
      // clientseitigen Plixa-KI-Tools (@pascal-app/mcp) bauen. Serverseitig
      // bleibt das echte Modul. Siehe lib/node-net-browser-stub.ts.
      'node:net': { browser: './lib/node-net-browser-stub.ts' },
    },
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
  images: {
    unoptimized: process.env.NEXT_PUBLIC_ASSETS_CDN_URL?.startsWith('http://localhost') ?? false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
}

export default nextConfig

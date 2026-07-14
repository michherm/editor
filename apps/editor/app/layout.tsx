import { Agentation } from 'agentation'
import { GeistPixelSquare } from 'geist/font/pixel'
import type { Metadata } from 'next'
import { Barlow, Fraunces, Inter, JetBrains_Mono } from 'next/font/google'
import localFont from 'next/font/local'
import { I18nProvider } from '@/components/i18n-provider'
import { ClientBootstrap } from './client-bootstrap'
import './globals.css'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
})

const barlow = Barlow({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-barlow',
  display: 'swap',
})

// Plixa-Markenschriften: Inter durchgängig für die UI, Fraunces (Serifen) nur
// für die Wortmarke „Plixa".
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
})
const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600', '900'],
  variable: '--font-fraunces',
  display: 'swap',
})
// Zahlen/Maße im Plixa-Stil: JetBrains Mono mit Tabellenziffern.
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Plixa Planer',
  description: 'Plixa Innenausbau-/Grundriss-Planer (Pascal-basiert) mit CNC-Treppen-Plugin.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      className={`${geistSans.variable} ${geistMono.variable} ${GeistPixelSquare.variable} ${barlow.variable} ${inter.variable} ${fraunces.variable} ${jetbrainsMono.variable}`}
      lang="de"
    >
      <head>
        {process.env.NODE_ENV === 'development' && (
          <script async crossOrigin="anonymous" src="//unpkg.com/react-scan/dist/auto.global.js" />
        )}
      </head>
      <body className="font-sans">
        <I18nProvider>
          <ClientBootstrap>{children}</ClientBootstrap>
        </I18nProvider>
        {process.env.NODE_ENV === 'development' && <Agentation />}
      </body>
    </html>
  )
}

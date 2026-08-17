import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Bricolage_Grotesque, Hanken_Grotesk } from 'next/font/google'
import './globals.css'
import { PipMount } from '@/components/pip/pip-mount'

/**
 * Typography standardisation, 17 August 2026.
 *
 * The canonical public landing (repo IELPS-new-landing-page, branch
 * hero-banner, a6e1cf1) loads exactly two faces: Hanken Grotesk as its body
 * face and Bricolage Grotesque as its display face. This panel already used
 * Bricolage for display, so the whole of the instruction reduces to one
 * substitution — Inter gives way to Hanken Grotesk as the interface face.
 *
 * Inter is deliberately still loaded. Authored learning content keeps the
 * typography it has today, and that typography is Inter. It is carried by
 * --font-content in globals.css and applied at the one place the lesson player
 * hands over to authored material. See globals.css for the boundary.
 */

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const hanken = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-hanken',
  display: 'swap',
})

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'IELPS — One account, one placement, one clear learning route',
  description:
    'The IELPS account and placement hub. Choose your pathway — junior learners, adult scholars, parents, teachers, tutors, schools and studio creators — and continue to the right lesson player, wired to the live EILPS platform.',
  generator: 'v0.app',
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#512eab',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${hanken.variable} ${inter.variable} ${bricolage.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        {children}
        {/* PiP is part of the approved Access Panel: the 12 August approved hero
            carries it, and the panel running in production has it today. It is
            mounted here so a promotion cannot silently remove it. */}
        <PipMount />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

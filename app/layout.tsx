import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Bricolage_Grotesque } from 'next/font/google'
import './globals.css'
import { PipMount } from '@/components/pip/pip-mount'
import { ReferralCapture } from '@/components/referral-capture'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
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
    <html lang="en" className={`${inter.variable} ${bricolage.variable} bg-background`}>
      <body className="font-sans antialiased">
        {children}
        {/* Pip is part of the approved Access Panel: the 12 August approved hero
            carries it, and the panel running in production has it today. It is
            mounted here so a promotion cannot silently remove it. */}
        <PipMount />
        <ReferralCapture />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

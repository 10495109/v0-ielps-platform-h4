import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { AccessHeader } from '@/components/access/access-header'
import { CefrPanel } from '@/components/access/cefr-panel'

/**
 * The Access Panel, as approved on 16 August 2026.
 *
 * This replaces the seven-card "Choose your access route" gateway that was
 * previously at this address and that was declared NOT APPROVED. Nothing of
 * that version survives — the file it lived in has been removed rather than
 * left dormant.
 *
 * The design is reproduced from the package supplied with that approval. Its
 * markup, classes, copy and spacing are unchanged. The only edits made while
 * bringing it into this app are the ones that turn a static preview into a
 * working page: the palette tokens it uses are aliased onto the Pearson values
 * this app already defines, its typeface is loaded, and every control that
 * arrived as href="#" now points at an address that already exists here.
 */

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'IELPS Learning — Choose your English level',
  description:
    'Pick your CEFR English level (A1–C2) to open the right IELPS learning path.',
}

export default function AccessPage() {
  return (
    <main
      className={`relative min-h-screen overflow-hidden bg-indigo ${jakarta.variable}`}
      style={{ fontFamily: 'var(--font-jakarta), var(--font-inter), system-ui, sans-serif' }}
    >
      {/* subtle gold glow accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-40 size-96 rounded-full bg-yellow/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-1/3 size-80 rounded-full bg-purple/25 blur-3xl"
      />
      <AccessHeader />
      <div className="relative">
        <CefrPanel />
      </div>
    </main>
  )
}

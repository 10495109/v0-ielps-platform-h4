import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { CefrPanel } from '@/components/access/cefr-panel'

/**
 * The CEFR ladder.
 *
 * Rebuilt on 18 August 2026. The 6 August package this page was reproduced
 * from — its dark indigo shell, its own header and its own typeface — was
 * revoked that day, and only that. The page is now the same page as the rest of
 * the learner system: the same document shell, the same header, the same
 * background, the same width, the same footer, and the typography the layout
 * already supplies. No typeface is loaded here, because there is no longer one
 * of its own to load.
 *
 * What it says is unchanged. The approved CEFR content lives on inside the
 * canonical system, which is what the instruction asked for.
 */

export const metadata: Metadata = {
  title: 'IELPS Learning — Choose your English level',
  description:
    'Pick your CEFR English level (A1–C2) to open the right IELPS learning path.',
}

export default function AccessPage() {
  return (
    <main className="min-h-screen bg-background">
      <SiteHeader away />
      <CefrPanel />
      <SiteFooter />
    </main>
  )
}

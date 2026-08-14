import { Suspense } from 'react'
import { SiteHeader } from '@/components/site-header'
import { Hero } from '@/components/hero'
import { LevelBand } from '@/components/level-band'
import { WelcomeSection } from '@/components/welcome-section'
import { PathwaysSection } from '@/components/pathways-section'
import { AdultFlowSection } from '@/components/adult-flow-section'
import { PlacementSection } from '@/components/placement-section'
import { SiteFooter } from '@/components/site-footer'

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <SiteHeader />
      <Hero />
      {/* useSearchParams needs a boundary on a statically rendered route.
          The fallback is null because the band renders nothing without a level. */}
      <Suspense fallback={null}>
        <LevelBand />
      </Suspense>
      <WelcomeSection />
      <PathwaysSection />
      <AdultFlowSection />
      <PlacementSection />
      <SiteFooter />
    </main>
  )
}

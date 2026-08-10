import { SiteHeader } from '@/components/site-header'
import { Hero } from '@/components/hero'
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
      <WelcomeSection />
      <PathwaysSection />
      <AdultFlowSection />
      <PlacementSection />
      <SiteFooter />
    </main>
  )
}

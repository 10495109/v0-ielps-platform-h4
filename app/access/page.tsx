import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { AccessGateway } from '@/components/access/access-gateway'

export const metadata = {
  title: 'Choose your access route — IELPS',
}

/**
 * The single pathway-choice gateway.
 *
 * It lives inside the Access Panel at /learner/access/ and nowhere else. The
 * public landing hands off to this page; it never carries a chooser of its own.
 */
export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <SiteHeader />
      <AccessGateway />
      <SiteFooter />
    </main>
  )
}

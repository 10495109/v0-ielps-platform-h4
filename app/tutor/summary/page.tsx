import { SessionSummary } from '@/components/tutoring/session-summary'
import { SiteHeader } from '@/components/site-header'

export const metadata = { title: 'Session summary — IELPS' }

export default function SessionSummaryPage() {
  return (
    <>
      <SiteHeader />
      <SessionSummary />
    </>
  )
}

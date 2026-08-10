import { TutorMarketplace } from '@/components/tutoring/tutor-marketplace'
import { SiteHeader } from '@/components/site-header'

export const metadata = { title: 'Online and live tutors — IELPS' }

export default function TutorsPage() {
  return (
    <>
      <SiteHeader />
      <TutorMarketplace />
    </>
  )
}

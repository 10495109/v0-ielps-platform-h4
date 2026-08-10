import { TutorProfile } from '@/components/tutoring/tutor-profile'
import { SiteHeader } from '@/components/site-header'

export const metadata = { title: 'Tutor profile — IELPS' }

export default function TutorProfilePage() {
  return (
    <>
      <SiteHeader />
      <TutorProfile />
    </>
  )
}

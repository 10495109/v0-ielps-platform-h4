import { LiveLobby } from '@/components/tutoring/live-lobby'
import { SiteHeader } from '@/components/site-header'

export const metadata = { title: 'Lesson lobby — IELPS' }

export default function LiveLobbyPage() {
  return (
    <>
      <SiteHeader />
      <LiveLobby />
    </>
  )
}

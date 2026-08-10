'use client'

import { JuniorPlayer } from './players/junior-player'
import { AdultPlayer } from './players/adult-player'
import { TeacherPlayer } from './players/teacher-player'
import { TutorPlayer } from './players/tutor-player'
import { SchoolPlayer } from './players/school-player'
import { StudioPlayer } from './players/studio-player'

/**
 * Lesson player dispatcher. Each IELPS account type gets its own visually
 * distinct player shell — different layout, chrome, interactions and behaviour
 * matching the role's personality — while sharing one headless engine
 * (use-lesson-engine) so the 15-step pedagogical spec stays identical.
 */
const PLAYERS: Record<string, (props: { slug: string }) => React.ReactNode> = {
  junior: JuniorPlayer,
  adult: AdultPlayer,
  teachers: TeacherPlayer,
  tutors: TutorPlayer,
  schools: SchoolPlayer,
  studio: StudioPlayer,
  // Parents reuse the calm Adult "Focus" shell for their preview walkthrough.
  parents: AdultPlayer,
}

export function LessonPlayer({ slug }: { slug: string }) {
  const Player = PLAYERS[slug] ?? AdultPlayer
  return <Player slug={slug} />
}

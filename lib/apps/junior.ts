import {
  Baby,
  LayoutDashboard,
  BookOpenText,
  Gamepad2,
  Radio,
  TrendingUp,
} from 'lucide-react'
import type { AccountApp } from './types'
import { catalogLessons, lessonBlurb } from './catalog'

function asArray(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw
  if (raw && typeof raw === 'object') {
    const o = raw as Record<string, unknown>
    for (const k of ['items', 'data', 'results', 'lessons', 'list']) {
      if (Array.isArray(o[k])) return o[k] as unknown[]
    }
  }
  return []
}

export const junior: AccountApp = {
  slug: 'junior',
  name: 'Junior Learners',
  role: 'Under-12 learner',
  tagline: 'A playful, safe path into English',
  intro:
    'Class-code or parent-linked sign in, then a friendly guided dashboard that takes younger learners straight into their next lesson, games and rewards.',
  accent: 'turquoise',
  icon: Baby,
  image: '/pathways/junior.png',
  liveEntry: '/student-login',
  onboarding: {
    headline: 'Join your class',
    sub: 'Ask your teacher or grown-up for a class code. It takes two steps to start learning.',
    steps: [
      {
        key: 'profile',
        title: 'Find your class',
        description: 'Enter the class code your teacher gave you to load your class profile.',
        endpoint: { method: 'POST', path: '/api/auth/student-profiles' },
        fields: [
          { name: 'classCode', label: 'Class code', type: 'code', placeholder: 'e.g. SKY-42B' },
        ],
        cta: 'Find my class',
      },
      {
        key: 'login',
        title: 'Pick your name & PIN',
        description: 'Choose your name from the class list and enter your picture PIN to sign in.',
        endpoint: { method: 'POST', path: '/api/auth/student-login' },
        fields: [
          { name: 'displayName', label: 'Your name', type: 'text', placeholder: 'Alex' },
          { name: 'pin', label: 'Picture PIN', type: 'password', placeholder: '••••' },
        ],
        cta: 'Start learning',
      },
    ],
  },
  screens: [
    {
      slug: 'dashboard',
      label: 'My Home',
      icon: LayoutDashboard,
      title: 'Hello, Alex! Ready to learn?',
      description: 'Your next lesson, games and rewards are all right here.',
      panels: [
        {
          id: 'progress',
          title: 'Your progress',
          kind: 'stat',
          endpoint: { method: 'GET', path: '/api/progress' },
          transform: (raw) => {
            const o = (raw ?? {}) as Record<string, unknown>
            return [
              { label: 'Lessons done', value: String(o.lessonsCompleted ?? '18') },
              { label: 'Day streak', value: String(o.streak ?? '5') },
              { label: 'Stars', value: String(o.stars ?? '240') },
            ]
          },
          sample: [
            { label: 'Lessons done', value: '18' },
            { label: 'Day streak', value: '5' },
            { label: 'Stars', value: '240' },
          ],
          span: 3,
        },
        {
          id: 'next',
          title: 'Continue learning',
          kind: 'cards',
          endpoint: { method: 'GET', path: '/api/curriculum/deep-catalog' },
          transform: (raw) =>
            catalogLessons(raw)
              .slice(0, 3)
              .map((o, i) => ({
                title: String(o.title ?? 'Lesson'),
                subtitle: `${String(o.level ?? 'A1')} · ${String(o.unitTitle ?? 'Course unit')}`,
                body: lessonBlurb(o, 'Tap to keep going.'),
                tag: i === 0 ? 'Continue' : 'Play',
              })),
          sample: [
            { title: 'At the Zoo', subtitle: 'A1 · Animals', body: 'Learn animal names and sounds.', tag: 'Continue' },
            { title: 'My Family', subtitle: 'A1 · People', body: 'Talk about who is in your family.', tag: 'Play' },
            { title: 'Colours & Shapes', subtitle: 'A1 · Describing', body: 'Match colours to fun pictures.', tag: 'Play' },
          ],
          span: 3,
        },
        {
          id: 'rewards',
          title: 'Rewards to claim',
          kind: 'list',
          endpoint: { method: 'GET', path: '/api/gamification/profile' },
          transform: (raw) => {
            const o = (raw ?? {}) as Record<string, unknown>
            return asArray(o.rewards).map((r) => {
              const x = r as Record<string, unknown>
              return { title: String(x.name ?? 'Reward'), meta: String(x.cost ?? ''), status: 'info' as const }
            })
          },
          sample: [
            { title: 'Explorer badge', meta: '100 stars', status: 'ok' },
            { title: 'New avatar hat', meta: '150 stars', status: 'info' },
            { title: 'Bonus mini-game', meta: '300 stars', status: 'pending' },
          ],
          span: 2,
        },
        {
          id: 'safety',
          title: 'Safe learning',
          kind: 'note',
          sample: null,
          note: 'Junior accounts use class-code or parent-linked access only. No open messaging, and grown-ups can always see progress.',
          span: 1,
        },
      ],
    },
    {
      slug: 'lessons',
      label: 'Lessons',
      icon: BookOpenText,
      title: 'Lesson library',
      description: 'All your lessons, sorted by topic and level.',
      panels: [
        {
          id: 'catalog',
          title: 'Lesson catalogue',
          kind: 'cards',
          endpoint: { method: 'GET', path: '/api/curriculum/deep-catalog' },
          transform: (raw) =>
            catalogLessons(raw).slice(0, 6).map((o) => ({
              title: String(o.title ?? 'Lesson'),
              subtitle: String(o.level ?? 'A1'),
              body: lessonBlurb(o),
              tag: 'Open',
            })),
          sample: [
            { title: 'At the Zoo', subtitle: 'A1', body: 'Animals and sounds', tag: 'Open' },
            { title: 'My Family', subtitle: 'A1', body: 'People around me', tag: 'Open' },
            { title: 'Yummy Food', subtitle: 'A1', body: 'Food and drink words', tag: 'Open' },
            { title: 'Weather Today', subtitle: 'A2', body: 'Sunny, rainy, windy', tag: 'Open' },
            { title: 'My School Day', subtitle: 'A2', body: 'Classroom routines', tag: 'Open' },
            { title: 'Fun Sports', subtitle: 'A2', body: 'Actions and games', tag: 'Open' },
          ],
          span: 3,
        },
      ],
    },
    {
      slug: 'games',
      label: 'Games',
      icon: Gamepad2,
      title: 'Practice games',
      description: 'Play, review and earn stars while you learn.',
      panels: [
        {
          id: 'review',
          title: 'Review queue',
          kind: 'list',
          endpoint: { method: 'GET', path: '/api/review/due' },
          transform: (raw) =>
            asArray(raw).slice(0, 5).map((r) => {
              const o = r as Record<string, unknown>
              return { title: String(o.title ?? o.word ?? 'Review'), meta: String(o.due ?? 'due now'), status: 'pending' as const }
            }),
          sample: [
            { title: 'Animal words', meta: '6 cards due', status: 'pending' },
            { title: 'Colour match', meta: '4 cards due', status: 'pending' },
            { title: 'Number song', meta: '3 cards due', status: 'ok' },
          ],
          span: 2,
        },
        {
          id: 'next-game',
          title: 'Suggested next',
          kind: 'cards',
          endpoint: { method: 'GET', path: '/api/practice/next' },
          transform: (raw) => {
            const o = (raw ?? {}) as { item?: Record<string, unknown>; reason?: string }
            if (!o.item) return []
            return [{
              title: String(o.item.title ?? 'Practice'),
              subtitle: `${String(o.item.level ?? 'A1')} · ${String(o.item.skillFocus ?? 'Practice')}`,
              body: String(o.item.topic ?? ''),
              tag: 'Play',
            }]
          },
          sample: [
            { title: 'Word Splash', subtitle: 'Vocabulary', body: 'Pop the correct words!', tag: 'Play' },
            { title: 'Sound Safari', subtitle: 'Listening', body: 'Match the sound to the animal.', tag: 'Play' },
          ],
          span: 1,
        },
      ],
    },
    {
      slug: 'classroom',
      label: 'Classroom',
      icon: Radio,
      title: 'Live classroom',
      description: 'Join your teacher when a live session is on.',
      panels: [
        {
          id: 'sessions',
          title: 'Upcoming sessions',
          kind: 'timeline',
          endpoint: { method: 'GET', path: '/api/tutoring/bookings' },
          sample: [
            { time: 'Today 15:30', title: 'Story time with Ms. Lee', detail: 'Room opens 5 minutes before.' },
            { time: 'Thu 15:30', title: 'Show & tell in English', detail: 'Bring your favourite toy!' },
          ],
          span: 3,
        },
      ],
    },
    {
      slug: 'progress',
      label: 'Progress',
      icon: TrendingUp,
      title: 'Your progress',
      description: 'See how far you have come.',
      panels: [
        {
          id: 'summary',
          title: 'This month',
          kind: 'stat',
          endpoint: { method: 'GET', path: '/api/progress' },
          transform: (raw) => {
            const o = (raw ?? {}) as { state?: Record<string, unknown>; completions?: unknown[] }
            const s = o.state ?? {}
            return [
              { label: 'Lessons done', value: String(o.completions?.length ?? 0) },
              { label: 'Day streak', value: String(s.streak ?? 0) },
              { label: 'Stars', value: String(s.xp ?? 0) },
            ]
          },
          sample: [
            { label: 'Minutes learned', value: '320' },
            { label: 'Lessons', value: '18' },
            { label: 'Badges', value: '7' },
          ],
          span: 3,
        },
        {
          id: 'leaderboard',
          title: 'Class leaderboard',
          kind: 'table',
          endpoint: { method: 'GET', path: '/api/gamification/leaderboard' },
          sample: {
            columns: ['Rank', 'Name', 'Stars'],
            rows: [
              ['1', 'Mia', '410'],
              ['2', 'You (Alex)', '240'],
              ['3', 'Sam', '220'],
              ['4', 'Priya', '180'],
            ],
          },
          span: 3,
        },
      ],
    },
  ],
  endpoints: [
    { method: 'POST', path: '/api/auth/student-profiles' },
    { method: 'POST', path: '/api/auth/student-login' },
    { method: 'GET', path: '/api/curriculum/deep-catalog' },
    { method: 'GET', path: '/api/progress' },
    { method: 'GET', path: '/api/gamification/profile' },
    { method: 'GET', path: '/api/gamification/leaderboard' },
    { method: 'GET', path: '/api/review/due' },
    { method: 'GET', path: '/api/practice/next' },
  ],
}

import {
  Baby,
  GraduationCap,
  Users,
  School,
  Video,
  Building2,
  Clapperboard,
  type LucideIcon,
} from 'lucide-react'

export type Endpoint = { method: string; path: string }

export type Pathway = {
  slug: string
  name: string
  short: string
  blurb: string
  entry: string
  next: string[]
  backend: Endpoint[]
  image: string
  icon: LucideIcon
  accent: 'primary' | 'secondary' | 'turquoise' | 'gold' | 'indigo'
}

export const PATHWAYS: Pathway[] = [
  {
    slug: 'junior',
    name: 'Junior Learners',
    short: 'Under 12s',
    blurb:
      'Safe class-code, QR or parent-linked access for younger learners, straight into a playful guided dashboard.',
    entry: '/student-login',
    next: ['/dashboard', '/learner?lesson=:id', '/practice', '/classroom', '/progress'],
    backend: [
      { method: 'POST', path: '/api/auth/student-profiles' },
      { method: 'POST', path: '/api/auth/student-login' },
    ],
    image: '/pathways/junior.png',
    icon: Baby,
    accent: 'turquoise',
  },
  {
    slug: 'adult',
    name: 'Adult Scholars & Self-Starters',
    short: 'Self-paced',
    blurb:
      'Independent route from placement to course continuation, resolving straight into the authoritative adult lesson player.',
    entry: '/signup/student',
    next: ['/dashboard', '/learner?lesson=:id'],
    backend: [
      { method: 'POST', path: '/api/auth/register' },
      { method: 'GET', path: '/api/assessment/level-check' },
      { method: 'POST', path: '/api/assessment/level-check/score' },
    ],
    image: '/pathways/adult.png',
    icon: GraduationCap,
    accent: 'primary',
  },
  {
    slug: 'parents',
    name: 'Parents & Guardians',
    short: 'Family',
    blurb:
      'Child profile management, home access linking, progress reports and billing in one supportive place.',
    entry: '/signup/parent',
    next: ['/parent', '/parent/link', '/dashboard', '/reports', '/account/billing'],
    backend: [
      { method: 'POST', path: '/api/auth/register' },
      { method: 'POST', path: '/api/auth/child-profiles' },
      { method: 'GET', path: '/api/auth/pathways' },
    ],
    image: '/pathways/parents.png',
    icon: Users,
    accent: 'secondary',
  },
  {
    slug: 'teachers',
    name: 'Educators & Classroom Teachers',
    short: 'Classroom',
    blurb:
      'Class setup, assignments, live classroom delivery and progress evidence for every learner you teach.',
    entry: '/signup/teacher',
    next: ['/teacher', '/teacher/classes', '/teacher/assignments', '/teacher/reports'],
    backend: [
      { method: 'POST', path: '/api/auth/register' },
      { method: 'GET', path: '/api/school/classes' },
      { method: 'POST', path: '/api/school/classes/:id/assignments' },
    ],
    image: '/pathways/teachers.png',
    icon: School,
    accent: 'indigo',
  },
  {
    slug: 'tutors',
    name: 'Online & Live Tutors',
    short: 'Tutoring',
    blurb:
      'Verified tutoring, marketplace booking and secure live rooms for one-to-one and small-group teaching.',
    entry: '/tutor',
    next: ['/tutors', '/tutor', '/classroom'],
    backend: [
      { method: 'GET', path: '/api/tutoring/tutors' },
      { method: 'POST', path: '/api/tutoring/bookings' },
      { method: 'POST', path: '/api/tutoring/application/identity' },
    ],
    image: '/pathways/tutors.png',
    icon: Video,
    accent: 'secondary',
  },
  {
    slug: 'schools',
    name: 'Schools & Educational Organisations',
    short: 'Institution',
    blurb:
      'Institution licensing, bulk rostering, admin reporting and compliance exports at organisation scale.',
    entry: '/school',
    next: ['/school', 'roster', 'licenses', 'reports'],
    backend: [
      { method: 'GET', path: '/api/school/admin/overview' },
      // STOPPED AND REPORTED 18 Aug 2026, not guessed and not removed.
      // GET /api/roster/providers is not registered by the running backend.
      // backend/src/index.js mounts roster_provider.js at /api/roster, and that
      // router registers only POST /organizations/:id/connections/:provider/
      // exchange, POST /organizations/:id/sync/:provider and GET
      // /organizations/:id/connections. The provider list itself is a literal
      // array inside the exchange handler and is not exposed by any route.
      // Nothing anywhere else in the 266 registered routes serves it. The card
      // is display-only, so this label makes no request and nothing fails; it
      // is left exactly as declared until the correct route is confirmed.
      { method: 'GET', path: '/api/roster/providers' },
      { method: 'GET', path: '/api/billing/subscription' },
    ],
    image: '/pathways/schools.png',
    icon: Building2,
    accent: 'primary',
  },
  {
    slug: 'studio',
    name: 'Studio & Content Creator',
    short: 'Authoring',
    blurb:
      'Authoring, coursebook conversion, StarPath resources and AI governance for the people who build the lessons.',
    entry: '/studio',
    next: ['/studio', '/studio/project/:id', '/studio/coursebook', '/studio/starpath'],
    backend: [
      { method: 'POST', path: '/api/authoring/projects' },
      // Corrected 18 Aug 2026: the backend registers GET .../uploads (list) and
      // POST .../uploads/pdf and .../uploads/text (create). There is no plain
      // POST .../uploads. This card is about putting a coursebook into a
      // project, so it names the route that really does it.
      { method: 'POST', path: '/api/studio/coursebook/projects/:id/uploads/pdf' },
      { method: 'GET', path: '/api/addons/starpath/resources' },
    ],
    image: '/pathways/studio.png',
    icon: Clapperboard,
    accent: 'gold',
  },
]

export const ADULT_FLOW = [
  {
    step: '01',
    title: 'My Course',
    route: '/dashboard',
    detail: 'Loads course state and the recommended next lesson.',
  },
  {
    step: '02',
    title: 'Continue Lesson',
    route: 'CTA',
    detail: 'The continue action resolves the next eligible lesson ID.',
  },
  {
    step: '03',
    title: 'Lesson Player',
    route: '/learner?lesson=:id',
    detail: 'Opens IELPS-A1-C2 Lesson Player — Integrated Final.',
  },
  {
    step: '04',
    title: 'Completion',
    route: '/api/progress/lesson',
    detail: 'Saves progress, then returns to course, Discover or StarPath.',
  },
]

export const PLACEMENT = {
  page: '/placement',
  items: 144,
  perLevel: 24,
  levels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
  skills: [
    'Grammar',
    'Vocabulary',
    'Reading',
    'Listening',
    'Functional language',
    'Writing cohesion',
    'Speaking response',
    'Integrated evidence',
    'Language in context',
  ],
  endpoints: [
    { method: 'GET', path: '/api/assessment/level-check?limit=144', label: 'Load items' },
    { method: 'POST', path: '/api/assessment/level-check/score', label: 'Score route' },
    { method: 'POST', path: '/api/assessment/placement/calibrate', label: 'Skill weighting' },
  ],
  standardsNote:
    'Operational diagnostic aligned to CEFR / Cambridge-style progression with IELTS-style four-skill awareness. Not an official Cambridge, IELTS or high-stakes CEFR certificate. Advanced placement still requires speaking and writing confirmation.',
}

export const SAMPLE_QUESTION = {
  level: 'B1',
  skill: 'Reading & evidence',
  title: 'Workplace shift update',
  prompt:
    'Read the message and choose the answer that links the evidence to the practical next action.',
  options: [
    { text: 'Uses the source evidence and states the correct next action.', correct: true },
    { text: 'A vague answer that does not use any source detail.', correct: false },
    { text: 'An answer with a grammar problem for this level.', correct: false },
    { text: 'An answer that changes the purpose of the message.', correct: false },
  ],
}

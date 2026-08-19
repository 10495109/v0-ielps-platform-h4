import {
  GraduationCap,
  LayoutDashboard,
  PlayCircle,
  Compass,
  Repeat,
  BarChart3,
  Mic2,
  Users,
  CreditCard,
} from 'lucide-react'
import type { AccountApp } from './types'

function asArray(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw
  if (raw && typeof raw === 'object') {
    const o = raw as Record<string, unknown>
    for (const k of ['items', 'data', 'results', 'lessons', 'catalogue']) {
      if (Array.isArray(o[k])) return o[k] as unknown[]
    }
  }
  return []
}

export const adult: AccountApp = {
  slug: 'adult',
  name: 'Adult Scholars & Self-Starters',
  role: 'Self-paced learner',
  tagline: 'Placement to fluency, on your schedule',
  intro:
    'An independent route from a CEFR placement check straight into the authoritative adult lesson player, with adaptive review, discovery and progress tracking.',
  accent: 'primary',
  icon: GraduationCap,
  image: '/pathways/adult.png',
  liveEntry: '/signup/student',
  onboarding: {
    headline: 'Create your learning account',
    sub: 'Two quick steps and a short placement check to find your level.',
    steps: [
      {
        key: 'register',
        title: 'Your details',
        description: 'Create an account to save your progress across devices.',
        endpoint: { method: 'POST', path: '/api/auth/register' },
        fields: [
          { name: 'name', label: 'Full name', type: 'text', placeholder: 'Jordan Rivera' },
          { name: 'email', label: 'Email', type: 'email', placeholder: 'you@email.com' },
          { name: 'password', label: 'Password', type: 'password', placeholder: 'Choose a password' },
        ],
        cta: 'Create account',
      },
      {
        key: 'goal',
        title: 'Your goal',
        description: 'Tell us why you are learning so we can tailor your path.',
        fields: [
          {
            name: 'goal',
            label: 'Main goal',
            type: 'select',
            options: ['Work & career', 'Study & exams', 'Travel', 'Everyday confidence'],
          },
        ],
        cta: 'Continue',
      },
      {
        key: 'placement',
        title: 'Placement check',
        description:
          'A 144-item diagnostic across six CEFR levels finds your starting point. You can start it now or later.',
        endpoint: { method: 'GET', path: '/api/assessment/level-check?limit=144' },
        cta: 'Start placement',
      },
    ],
  },
  screens: [
    {
      slug: 'dashboard',
      label: 'My Course',
      icon: LayoutDashboard,
      title: 'Welcome back, Jordan',
      description: 'Pick up where you left off and keep your streak alive.',
      panels: [
        {
          id: 'level',
          title: 'Your standing',
          kind: 'stat',
          endpoint: { method: 'GET', path: '/api/progress' },
          transform: (raw) => {
            const o = (raw ?? {}) as Record<string, unknown>
            return [
              { label: 'Current level', value: String(o.level ?? 'Not reported'), hint: 'CEFR' },
              { label: 'Course progress', value: o.percent == null ? 'Not reported' : `${o.percent}%` },
              { label: 'Day streak', value: String(o.streak ?? 'Not reported') },
              { label: 'Words mastered', value: String(o.mastery ?? 'Not reported') },
            ]
          },
          sample: [
            { label: 'Current level', value: 'B1', hint: 'CEFR' },
            { label: 'Course progress', value: '46%' },
            { label: 'Day streak', value: '12' },
            { label: 'Words mastered', value: '812' },
          ],
          span: 3,
        },
        {
          id: 'continue',
          title: 'Continue lesson',
          kind: 'cards',
          endpoint: { method: 'GET', path: '/api/curriculum/deep-summary' },
          transform: (raw) => {
            const root = (raw || {}) as Record<string, unknown>
            const summary = (root.summary || root) as Record<string, unknown>
            if (!summary.lessons) return []
            return [{
              title: 'Your structured A1–C2 course',
              subtitle: `${summary.levels} CEFR levels`,
              body: `${summary.lessons} lessons across ${summary.units} units`,
              tag: 'Resume',
            }]
          },
          sample: [
            { title: 'Making a complaint politely', subtitle: 'B1 · Functional language', body: 'Resume in the integrated A1–C2 lesson player.', tag: 'Resume' },
            { title: 'Past experiences', subtitle: 'B1 · Grammar in use', body: 'Present perfect vs. past simple.', tag: 'Start' },
          ],
          span: 2,
        },
        {
          id: 'schedule',
          title: 'Today\u2019s plan',
          kind: 'list',
          endpoint: { method: 'GET', path: '/api/engine/schedule' },
          sample: [
            { title: '1 lesson', subtitle: 'Making a complaint politely', status: 'pending' },
            { title: '12 review cards', subtitle: 'Spaced repetition due', status: 'pending' },
            { title: '1 speaking task', subtitle: 'AI tutor roleplay', status: 'info' },
          ],
          span: 1,
        },
      ],
    },
    {
      slug: 'player',
      label: 'Lesson Player',
      icon: PlayCircle,
      title: 'Integrated lesson player',
      description: 'The authoritative IELPS A1–C2 lesson experience.',
      panels: [
        {
          id: 'lesson',
          title: 'Now playing',
          kind: 'note',
          sample: null,
          note: 'Continue resolves the next eligible lesson ID and opens IELPS-A1-C2 Lesson Player — Integrated Final. Completion posts to /api/progress/lesson, then returns you to My Course, Discover or StarPath.',
          span: 2,
        },
        {
          id: 'engine',
          title: 'Adaptive next steps',
          kind: 'list',
          endpoint: { method: 'GET', path: '/api/engine/next' },
          sample: [
            { title: 'Vocabulary consolidation', subtitle: 'Recommended after this lesson', status: 'info' },
            { title: 'Listening booster', subtitle: 'Targets your weakest skill', status: 'pending' },
          ],
          span: 1,
        },
        // Wired 19 Aug 2026 to the registered live-session response route.
        //
        // POST /api/authoring/live-sessions/:id/responses is what a learner's
        // answer goes to during a teacher-run live lesson. The session id is
        // the real one the learner joined and is typed in or carried from the
        // join step; there is no alternate response endpoint anywhere in this
        // build, and no wrapper that is declared but never called.
        //
        // The server stores the response against the signed-in account and
        // answers 201 with the stored record. That record is what is shown. A
        // failure is shown as a failure — an answer is never displayed as sent
        // because the request left the browser.
        {
          id: 'live-response',
          title: 'Live lesson answer',
          kind: 'action',
          endpoint: { method: 'POST', path: '/api/authoring/live-sessions/:id/responses' },
          sample: null,
          action: {
            endpoint: { method: 'POST', path: '/api/authoring/live-sessions/:id/responses' },
            note: 'Sends your answer to the live lesson your teacher is running. The session code is the one shown when you joined.',
            params: [
              {
                name: 'id',
                label: 'Live session code',
                hint: 'Shown when you joined the live lesson.',
              },
            ],
            fields: [
              { name: 'blockId', label: 'Activity', hint: 'The block your teacher is on.' },
              { name: 'response', label: 'Your answer', type: 'textarea' },
            ],
            cta: 'Send answer',
            successNote: 'Your answer reached the live session. The stored record is below.',
          },
          span: 3,
        },
      ],
    },
    {
      slug: 'discover',
      label: 'Discover',
      icon: Compass,
      title: 'Discover & StarPath',
      description: 'Explore extra content matched to your level and interests.',
      panels: [
        {
          id: 'catalogue',
          title: 'Discovery catalogue',
          kind: 'cards',
          endpoint: { method: 'GET', path: '/api/discovery/catalogue' },
          transform: (raw) =>
            asArray(raw).slice(0, 4).map((l) => {
              const o = l as Record<string, unknown>
              return {
                title: String(o.title ?? 'Discovery'),
                subtitle: String(o.type ?? 'Article'),
                body: String(o.summary ?? ''),
                tag: 'Explore',
              }
            }),
          sample: [
            { title: 'Small talk at work', subtitle: 'Podcast · B1', body: 'Real conversations to shadow.', tag: 'Explore' },
            { title: 'News in slow English', subtitle: 'Reading · B2', body: 'Current affairs, graded.', tag: 'Explore' },
            { title: 'Idioms that stick', subtitle: 'Video · B1', body: 'Ten idioms with stories.', tag: 'Explore' },
            { title: 'Travel survival kit', subtitle: 'Pack · A2', body: 'Airport to hotel phrases.', tag: 'Explore' },
          ],
          span: 3,
        },
      ],
    },
    {
      slug: 'review',
      label: 'Review',
      icon: Repeat,
      title: 'Adaptive review & practice',
      description: 'Spaced repetition keeps what you learn from slipping away.',
      panels: [
        {
          id: 'due',
          title: 'Due today',
          kind: 'stat',
          endpoint: { method: 'GET', path: '/api/review/due' },
          sample: [
            { label: 'Cards due', value: '12' },
            { label: 'Mastery', value: '68%' },
            { label: 'Retention', value: '91%' },
          ],
          span: 3,
        },
        {
          id: 'queue',
          title: 'Review queue',
          kind: 'list',
          endpoint: { method: 'GET', path: '/api/engine/review-queue' },
          sample: [
            { title: 'Phrasal verbs (set 3)', meta: '5 cards', status: 'pending' },
            { title: 'Business email openers', meta: '4 cards', status: 'pending' },
            { title: 'Conditionals', meta: '3 cards', status: 'ok' },
          ],
          span: 2,
        },
        {
          id: 'filters',
          title: 'Practice filters',
          kind: 'list',
          endpoint: { method: 'GET', path: '/api/practice/filters' },
          sample: [
            { title: 'By skill', subtitle: 'Grammar, vocab, listening', status: 'info' },
            { title: 'By level', subtitle: 'A1 – C2', status: 'info' },
          ],
          span: 1,
        },
      ],
    },
    {
      slug: 'speaking',
      label: 'Speaking',
      icon: Mic2,
      title: 'Speaking coach',
      description: 'Practise with the AI coach and professional pronunciation services available to your plan.',
      panels: [
        { id: 'quota', title: 'AI allowance', kind: 'stat', endpoint: { method: 'GET', path: '/api/tutor/quota' }, sample: [], span: 1 },
        { id: 'conversations', title: 'Conversation history', kind: 'list', endpoint: { method: 'GET', path: '/api/tutor/conversations' }, sample: [], span: 2 },
        { id: 'provider', title: 'Speaking providers', kind: 'note', sample: null, note: 'OpenAI coaching, Azure Pronunciation Assessment and ElevenLabs speech remain server-gated. The interface reports provider and quota states; it never fabricates a score.', span: 3 },
      ],
    },
    {
      slug: 'tutors',
      label: 'Live tutors',
      icon: Users,
      title: 'Tutor marketplace',
      description: 'Find a verified tutor, request a time, complete payment and enter the secure live room.',
      panels: [
        { id: 'marketplace', title: 'Available tutors', kind: 'cards', endpoint: { method: 'GET', path: '/api/tutoring/tutors' }, sample: [], span: 2 },
        { id: 'bookings', title: 'My bookings', kind: 'list', endpoint: { method: 'GET', path: '/api/tutoring/bookings' }, sample: [], span: 1 },
      ],
    },
    {
      slug: 'account',
      label: 'Account',
      icon: CreditCard,
      title: 'Plan, entitlement and referrals',
      description: 'Manage your learning plan and view referral activity where enabled.',
      panels: [
        { id: 'subscription', title: 'Subscription', kind: 'stat', endpoint: { method: 'GET', path: '/api/billing/subscription' }, sample: [], span: 1 },
        { id: 'partners', title: 'Referral dashboard', kind: 'stat', endpoint: { method: 'GET', path: '/api/partners/dashboard' }, sample: [], span: 2 },
      ],
    },
    {
      slug: 'progress',
      label: 'Progress',
      icon: BarChart3,
      title: 'Your progress & certificates',
      description: 'Evidence of how far you have come.',
      panels: [
        {
          id: 'mastery',
          title: 'Skill mastery',
          kind: 'table',
          endpoint: { method: 'GET', path: '/api/engine/mastery' },
          sample: {
            columns: ['Skill', 'Level', 'Mastery'],
            rows: [
              ['Grammar', 'B1', '72%'],
              ['Vocabulary', 'B1', '68%'],
              ['Reading', 'B2', '80%'],
              ['Listening', 'A2', '54%'],
              ['Speaking', 'B1', '61%'],
            ],
          },
          span: 2,
        },
        {
          id: 'certs',
          title: 'Certificates',
          kind: 'list',
          endpoint: { method: 'GET', path: '/api/certificates/eligibility/:level' },
          sample: [
            { title: 'A2 completion', meta: 'Issued', status: 'ok' },
            { title: 'B1 completion', meta: '46% — in progress', status: 'pending' },
          ],
          span: 1,
        },
      ],
    },
  ],
  endpoints: [
    { method: 'POST', path: '/api/auth/register' },
    { method: 'GET', path: '/api/assessment/level-check?limit=144' },
    { method: 'POST', path: '/api/assessment/level-check/score' },
    { method: 'GET', path: '/api/curriculum/deep-summary' },
    { method: 'GET', path: '/api/engine/schedule' },
    { method: 'GET', path: '/api/engine/next' },
    { method: 'POST', path: '/api/authoring/live-sessions/:id/responses' },
    { method: 'GET', path: '/api/engine/mastery' },
    { method: 'GET', path: '/api/discovery/catalogue' },
    { method: 'GET', path: '/api/review/due' },
    { method: 'GET', path: '/api/tutor/quota' },
    { method: 'GET', path: '/api/tutor/conversations' },
    { method: 'GET', path: '/api/tutoring/tutors' },
    { method: 'GET', path: '/api/tutoring/bookings' },
    { method: 'GET', path: '/api/billing/subscription' },
    { method: 'GET', path: '/api/partners/dashboard' },
    { method: 'POST', path: '/api/progress/lesson' },
  ],
}

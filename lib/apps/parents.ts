import {
  Users,
  LayoutDashboard,
  Link2,
  FileBarChart,
  CreditCard,
} from 'lucide-react'
import type { AccountApp } from './types'

type ParentChild = {
  child?: { name?: string; cefr_level?: string; age_band?: string }
  state?: { xp?: number; streak?: number; last_active?: string | null }
  completed?: { n?: number; avg_accuracy?: number | null; verified_lessons?: number }
  reviewDue?: number
}

/** GET /api/school/parent/dashboard -> { children: [...] } */
function parentChildren(raw: unknown): ParentChild[] {
  const root = raw as { children?: unknown[] } | null
  return Array.isArray(root?.children) ? (root!.children as ParentChild[]) : []
}

function activeToday(child: ParentChild): boolean {
  const last = child.state?.last_active
  if (!last) return false
  return new Date(last).toDateString() === new Date().toDateString()
}

export const parents: AccountApp = {
  slug: 'parents',
  name: 'Parents & Guardians',
  role: 'Family account',
  tagline: 'Support your child, all in one place',
  intro:
    'Create and link child profiles, follow progress with clear reports, manage home access and handle billing — a supportive hub for the whole family.',
  accent: 'secondary',
  icon: Users,
  image: '/pathways/parents.png',
  liveEntry: '/signup/parent',
  onboarding: {
    headline: 'Set up your family account',
    sub: 'Create your account, add your child, then link their learning.',
    steps: [
      {
        key: 'register',
        title: 'Your account',
        description: 'Create a guardian account to oversee your children\u2019s learning.',
        endpoint: { method: 'POST', path: '/api/auth/register' },
        fields: [
          { name: 'name', label: 'Your name', type: 'text', placeholder: 'Sam Carter' },
          { name: 'email', label: 'Email', type: 'email', placeholder: 'you@email.com' },
          { name: 'password', label: 'Password', type: 'password' },
        ],
        cta: 'Create account',
      },
      {
        key: 'child',
        title: 'Add your child',
        description: 'Create a safe child profile with age-appropriate settings.',
        endpoint: { method: 'POST', path: '/api/auth/child-profiles' },
        fields: [
          { name: 'childName', label: 'Child\u2019s name', type: 'text', placeholder: 'Ellie' },
          { name: 'age', label: 'Age', type: 'text', placeholder: '9' },
        ],
        cta: 'Add child',
      },
      {
        key: 'link',
        title: 'Link learning',
        description: 'Connect your child to a school class or home learning using a link code.',
        endpoint: { method: 'POST', path: '/api/school/parent/links' },
        fields: [
          { name: 'linkCode', label: 'Link code', type: 'code', placeholder: 'From school or invite' },
        ],
        cta: 'Send link request',
      },
    ],
  },
  screens: [
    {
      slug: 'dashboard',
      label: 'Overview',
      icon: LayoutDashboard,
      title: 'Family overview',
      description: 'A quick read on every child\u2019s learning this week.',
      panels: [
        {
          id: 'summary',
          title: 'This week',
          kind: 'stat',
          endpoint: { method: 'GET', path: '/api/school/parent/dashboard' },
          transform: (raw) => {
            const children = parentChildren(raw)
            if (!children.length) return []
            const lessons = children.reduce((n, c) => n + (c.completed?.n ?? 0), 0)
            const verified = children.reduce((n, c) => n + (c.completed?.verified_lessons ?? 0), 0)
            const streaks = children.filter((c) => (c.state?.streak ?? 0) > 0).length
            return [
              { label: 'Children', value: String(children.length) },
              { label: 'Lessons completed', value: String(lessons) },
              { label: 'Verified lessons', value: String(verified), hint: 'Teacher-checked evidence' },
              { label: 'Streaks running', value: String(streaks) },
            ]
          },
          sample: [
            { label: 'Children', value: '2' },
            { label: 'Lessons completed', value: '11' },
            { label: 'Verified lessons', value: '8', hint: 'Teacher-checked evidence' },
            { label: 'Streaks running', value: '2' },
          ],
          span: 3,
        },
        {
          id: 'children',
          title: 'Your children',
          kind: 'cards',
          endpoint: { method: 'GET', path: '/api/school/parent/dashboard' },
          transform: (raw) =>
            parentChildren(raw).map((c) => {
              const done = c.completed?.n ?? 0
              const due = c.reviewDue ?? 0
              return {
                title: String(c.child?.name ?? 'Child'),
                subtitle: `${String(c.child?.cefr_level ?? 'A1')} · ${(c.state?.streak ?? 0)} day streak`,
                body: `${done} ${done === 1 ? 'lesson' : 'lessons'} completed${due ? `, ${due} review ${due === 1 ? 'card' : 'cards'} due` : ''}.`,
                tag: 'View',
              }
            }),
          sample: [
            { title: 'Ellie', subtitle: 'A2 · 6 day streak', body: '5 lessons completed, 3 review cards due.', tag: 'View' },
            { title: 'Max', subtitle: 'B1 · 3 day streak', body: '6 lessons completed.', tag: 'View' },
          ],
          span: 2,
        },
        {
          id: 'alerts',
          title: 'Needs attention',
          kind: 'list',
          endpoint: { method: 'GET', path: '/api/school/parent/dashboard' },
          // Derived from the same live payload — no separate alerts route exists,
          // and nothing here is invented: every line restates a server value.
          transform: (raw) => {
            const alerts: { title: string; subtitle: string; status: string }[] = []
            for (const c of parentChildren(raw)) {
              const name = String(c.child?.name ?? 'Child')
              if (!activeToday(c)) {
                alerts.push({
                  title: `${name}: no lesson today yet`,
                  subtitle: (c.state?.streak ?? 0) > 0 ? 'Streak at risk' : 'Not started today',
                  status: 'pending',
                })
              }
              const due = c.reviewDue ?? 0
              if (due > 0) {
                alerts.push({
                  title: `${name}: ${due} review ${due === 1 ? 'card' : 'cards'} due`,
                  subtitle: 'Spaced review is waiting',
                  status: 'alert',
                })
              }
              const accuracy = c.completed?.avg_accuracy
              if (typeof accuracy === 'number' && accuracy < 0.7) {
                alerts.push({
                  title: `${name}: average accuracy ${Math.round(accuracy * 100)}%`,
                  subtitle: 'Below the 70% pass mark',
                  status: 'alert',
                })
              }
            }
            return alerts
          },
          sample: [
            { title: 'Max: no lesson today yet', subtitle: 'Streak at risk', status: 'pending' },
            { title: 'Ellie: 3 review cards due', subtitle: 'Spaced review is waiting', status: 'alert' },
          ],
          span: 1,
        },
      ],
    },
    {
      slug: 'links',
      label: 'Access & links',
      icon: Link2,
      title: 'Home access & links',
      description: 'Manage how your children sign in and which classes they are linked to.',
      panels: [
        {
          id: 'linked',
          title: 'Linked accounts',
          kind: 'table',
          endpoint: { method: 'GET', path: '/api/school/parent/dashboard' },
          sample: {
            columns: ['Child', 'Linked to', 'Status'],
            rows: [
              ['Ellie', 'Maple Primary · 4B', 'Confirmed'],
              ['Max', 'Home learning', 'Confirmed'],
            ],
          },
          span: 2,
        },
        {
          id: 'pending',
          title: 'Pending requests',
          kind: 'list',
          endpoint: { method: 'GET', path: '/api/school/parent/dashboard' },
          sample: [
            { title: 'Riverside Tutoring', subtitle: 'Awaiting confirmation', status: 'pending' },
          ],
          span: 1,
        },
      ],
    },
    {
      slug: 'reports',
      label: 'Reports',
      icon: FileBarChart,
      title: 'Progress reports',
      description: 'Clear, plain-language reports you can actually use.',
      panels: [
        {
          id: 'ellie',
          title: 'Ellie — skill breakdown',
          kind: 'table',
          endpoint: { method: 'GET', path: '/api/progress' },
          sample: {
            columns: ['Skill', 'Level', 'Trend'],
            rows: [
              ['Vocabulary', 'A2', 'Up'],
              ['Reading', 'A2', 'Steady'],
              ['Listening', 'A1', 'Up'],
              ['Speaking', 'A2', 'Up'],
            ],
          },
          span: 3,
        },
      ],
    },
    {
      slug: 'billing',
      label: 'Billing',
      icon: CreditCard,
      title: 'Plan & billing',
      description: 'Manage your family subscription.',
      panels: [
        {
          id: 'plan',
          title: 'Current plan',
          kind: 'stat',
          endpoint: { method: 'GET', path: '/api/billing/subscription' },
          sample: [
            { label: 'Plan', value: 'Family' },
            { label: 'Seats', value: '2 of 4' },
            { label: 'Renews', value: 'Sep 12' },
          ],
          span: 3,
        },
        {
          id: 'plans',
          title: 'Available plans',
          kind: 'cards',
          endpoint: { method: 'GET', path: '/api/billing/plans' },
          sample: [
            { title: 'Family', subtitle: '$19/mo', body: 'Up to 4 children, full curriculum.', tag: 'Current' },
            { title: 'Family Plus', subtitle: '$29/mo', body: 'Adds live tutoring credits.', tag: 'Upgrade' },
          ],
          span: 2,
        },
      ],
    },
  ],
  endpoints: [
    { method: 'POST', path: '/api/auth/register' },
    { method: 'POST', path: '/api/auth/child-profiles' },
    { method: 'GET', path: '/api/school/parent/dashboard' },
    { method: 'POST', path: '/api/school/parent/links' },
    { method: 'POST', path: '/api/school/parent/links/confirm' },
    { method: 'GET', path: '/api/progress' },
    { method: 'GET', path: '/api/billing/subscription' },
    { method: 'GET', path: '/api/billing/plans' },
  ],
}

import {
  Users,
  LayoutDashboard,
  Link2,
  FileBarChart,
  CreditCard,
} from 'lucide-react'
import type { AccountApp, ListItem } from './types'

/**
 * "Needs attention", derived from real parent-dashboard values.
 *
 * `GET /api/school/parent/dashboard` returns, per linked child: the review
 * memory that is due now, the learner's streak and last active timestamp, and
 * how many lessons have been completed. Every line below is one of those
 * numbers stated back — a fact the server sent, attributed to the child it
 * belongs to.
 *
 * Deliberately absent: anything that would need a threshold of my own. The
 * platform declares no accuracy floor, so "listening dipped" is a judgement no
 * server value supports, and a client-side judgement dressed as a server alert
 * is exactly the thing that must not appear here. If nothing is outstanding the
 * panel says so rather than filling itself.
 */
function parentAttention(raw: unknown): ListItem[] {
  const root = (raw || {}) as { children?: unknown }
  const children = Array.isArray(root.children) ? root.children : []
  if (!children.length) throw new Error('no_children')

  const items: ListItem[] = []
  for (const entry of children as Array<Record<string, unknown>>) {
    const child = (entry.child || {}) as Record<string, unknown>
    const state = (entry.state || null) as Record<string, unknown> | null
    const completed = (entry.completed || {}) as Record<string, unknown>
    const who = String(child.name || child.email || 'This learner')

    const due = Number(entry.reviewDue || 0)
    if (due > 0) {
      items.push({
        title: `${who}: ${due} review ${due === 1 ? 'item is' : 'items are'} due`,
        subtitle: 'Smart Review, ready now',
        status: 'pending',
      })
    }

    const streak = Number(state?.streak || 0)
    const lastActive = state?.last_active ? new Date(String(state.last_active)) : null
    const activeToday =
      lastActive !== null &&
      !Number.isNaN(lastActive.getTime()) &&
      lastActive.toDateString() === new Date().toDateString()
    if (streak > 0 && !activeToday) {
      items.push({
        title: `${who}: streak of ${streak} at risk`,
        subtitle: 'No lesson today yet',
        status: 'alert',
      })
    }

    if (Number(completed.n || 0) === 0) {
      items.push({
        title: `${who} has not started yet`,
        subtitle: 'No lessons completed',
        status: 'info',
      })
    }
  }

  return items
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
          sample: [
            { label: 'Children', value: '2' },
            { label: 'Lessons this week', value: '11' },
            { label: 'Time learning', value: '3h 40m' },
            { label: 'Streaks kept', value: '2' },
          ],
          span: 3,
        },
        {
          id: 'children',
          title: 'Your children',
          kind: 'cards',
          endpoint: { method: 'GET', path: '/api/school/parent/dashboard' },
          sample: [
            { title: 'Ellie · Age 9', subtitle: 'A2 · +6% this week', body: '5 lessons, 3 badges earned.', tag: 'View' },
            { title: 'Max · Age 12', subtitle: 'B1 · +3% this week', body: '6 lessons, speaking task done.', tag: 'View' },
          ],
          span: 2,
        },
        {
          id: 'alerts',
          title: 'Needs attention',
          kind: 'list',
          // Derived from the parent dashboard the server already returns — the
          // same route the rest of this screen uses. There is no alerts route
          // and none was invented for this panel.
          endpoint: { method: 'GET', path: '/api/school/parent/dashboard' },
          transform: parentAttention,
          emptyNote: 'Nothing needs your attention right now.',
          sample: [
            { title: 'Max: listening dipped', subtitle: 'Suggest a listening booster', status: 'alert' },
            { title: 'Ellie: streak at risk', subtitle: 'No lesson today yet', status: 'pending' },
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

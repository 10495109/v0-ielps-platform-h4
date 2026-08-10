import {
  School,
  LayoutDashboard,
  Users2,
  ClipboardList,
  LineChart,
} from 'lucide-react'
import type { AccountApp } from './types'

function asArray(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw
  if (raw && typeof raw === 'object') {
    const o = raw as Record<string, unknown>
    for (const k of ['items', 'data', 'classes', 'results']) {
      if (Array.isArray(o[k])) return o[k] as unknown[]
    }
  }
  return []
}

export const teachers: AccountApp = {
  slug: 'teachers',
  name: 'Educators & Classroom Teachers',
  role: 'Classroom teacher',
  tagline: 'Set up, assign, teach, evidence',
  intro:
    'Create classes, roster learners, set assignments, deliver live sessions and gather progress evidence for every learner you teach.',
  accent: 'indigo',
  icon: School,
  image: '/pathways/teachers.png',
  liveEntry: '/signup/teacher',
  onboarding: {
    headline: 'Set up your teaching space',
    sub: 'Create your account and your first class in minutes.',
    steps: [
      {
        key: 'register',
        title: 'Teacher account',
        description: 'Create your educator account.',
        endpoint: { method: 'POST', path: '/api/auth/register' },
        fields: [
          { name: 'name', label: 'Full name', type: 'text', placeholder: 'Ms. Dana Osei' },
          { name: 'email', label: 'Work email', type: 'email', placeholder: 'you@school.edu' },
          { name: 'password', label: 'Password', type: 'password' },
        ],
        cta: 'Create account',
      },
      {
        key: 'class',
        title: 'Create a class',
        description: 'Set up your first class and get a join code for students.',
        endpoint: { method: 'POST', path: '/api/school/classes' },
        fields: [
          { name: 'className', label: 'Class name', type: 'text', placeholder: 'Grade 6 — English B' },
          { name: 'level', label: 'Target level', type: 'select', options: ['A1', 'A2', 'B1', 'B2'] },
        ],
        cta: 'Create class',
      },
      {
        key: 'roster',
        title: 'Add students',
        description: 'Invite by code or bulk-import a roster. You can do this later too.',
        endpoint: { method: 'POST', path: '/api/school/classes/:id/bulk-import' },
        cta: 'Finish setup',
      },
    ],
  },
  screens: [
    {
      slug: 'dashboard',
      label: 'Overview',
      icon: LayoutDashboard,
      title: 'Good morning, Ms. Osei',
      description: 'Your classes, assignments and things that need a look.',
      panels: [
        {
          id: 'stats',
          title: 'At a glance',
          kind: 'stat',
          endpoint: { method: 'GET', path: '/api/school/dashboard' },
          transform: (raw) => {
            const o = (raw ?? {}) as Record<string, unknown[]>
            const n = (k: string) => (Array.isArray(o[k]) ? o[k].length : 0)
            return [
              { label: 'Classes', value: String(n('classes')) },
              { label: 'Assignments', value: String(n('assignments')) },
              { label: 'Awaiting review', value: String(n('moderation')) },
              { label: 'Projects', value: String(n('projects')) },
            ]
          },
          sample: [
            { label: 'Classes', value: '3' },
            { label: 'Students', value: '78' },
            { label: 'To grade', value: '14' },
            { label: 'Avg. progress', value: '58%' },
          ],
          span: 3,
        },
        {
          id: 'classes',
          title: 'Your classes',
          kind: 'cards',
          endpoint: { method: 'GET', path: '/api/school/classes' },
          transform: (raw) =>
            asArray(raw).slice(0, 3).map((c) => {
              const o = c as Record<string, unknown>
              return {
                title: String(o.name ?? 'Class'),
                subtitle: String(o.level ?? ''),
                body: `${o.studentCount ?? 0} students`,
                tag: 'Open',
              }
            }),
          sample: [
            { title: 'Grade 6 — English B', subtitle: 'A2', body: '28 students · +5% this week', tag: 'Open' },
            { title: 'Grade 7 — English A', subtitle: 'B1', body: '26 students · +2% this week', tag: 'Open' },
            { title: 'Exam Prep Club', subtitle: 'B2', body: '24 students · steady', tag: 'Open' },
          ],
          span: 2,
        },
        {
          id: 'grade',
          title: 'Needs grading',
          kind: 'list',
          endpoint: { method: 'GET', path: '/api/school/dashboard' },
          transform: (raw) => {
            const o = (raw ?? {}) as { moderation?: Record<string, unknown>[] }
            const items = o.moderation ?? []
            if (!items.length) return [{ title: 'Nothing waiting', subtitle: 'No submissions need review', status: 'ok' }]
            return items.slice(0, 6).map((m) => ({
              title: String(m.learner_name ?? 'Learner submission'),
              subtitle: String(m.status ?? 'open'),
              status: 'pending',
            }))
          },
          sample: [
            { title: 'Writing: My weekend', subtitle: 'Grade 6 · 8 submissions', status: 'pending' },
            { title: 'Speaking task 3', subtitle: 'Grade 7 · 6 submissions', status: 'pending' },
          ],
          span: 1,
        },
      ],
    },
    {
      slug: 'classes',
      label: 'Classes',
      icon: Users2,
      title: 'Classes & rosters',
      description: 'Manage members, groups and join codes.',
      panels: [
        {
          id: 'roster',
          title: 'Grade 6 — English B roster',
          kind: 'table',
          endpoint: { method: 'GET', path: '/api/school/classes/:id' },
          sample: {
            columns: ['Student', 'Level', 'Progress', 'Last active'],
            rows: [
              ['Aisha K.', 'A2', '64%', 'Today'],
              ['Ben O.', 'A2', '52%', 'Yesterday'],
              ['Chloe M.', 'A2', '71%', 'Today'],
              ['Diego R.', 'A1', '38%', '3 days ago'],
            ],
          },
          span: 3,
        },
      ],
    },
    {
      slug: 'assignments',
      label: 'Assignments',
      icon: ClipboardList,
      title: 'Assignments',
      description: 'Create, distribute and grade assignments.',
      panels: [
        {
          id: 'active',
          title: 'Active assignments',
          kind: 'list',
          endpoint: { method: 'GET', path: '/api/school/assignments/:id' },
          sample: [
            { title: 'Reading: The city trip', subtitle: 'Due Fri · Grade 6', meta: '18/28 done', status: 'ok' },
            { title: 'Grammar: past tense set', subtitle: 'Due Mon · Grade 7', meta: '9/26 done', status: 'pending' },
            { title: 'Speaking: introduce a friend', subtitle: 'Due Wed · Exam Prep', meta: 'Grading', status: 'alert' },
          ],
          span: 2,
        },
        {
          id: 'create',
          title: 'Quick assign',
          kind: 'cards',
          endpoint: { method: 'POST', path: '/api/school/classes/:id/assignments' },
          sample: [
            { title: 'From curriculum', subtitle: 'Pick a lesson', body: 'Assign a deep-catalog lesson.', tag: 'Assign' },
            { title: 'From StarPath', subtitle: 'Pick a resource', body: 'Assign an authored resource.', tag: 'Assign' },
          ],
          span: 1,
        },
      ],
    },
    {
      slug: 'reports',
      label: 'Reports',
      icon: LineChart,
      title: 'Class reports',
      description: 'Progress evidence and exports.',
      panels: [
        {
          id: 'report',
          title: 'Grade 6 — skill trends',
          kind: 'table',
          endpoint: { method: 'GET', path: '/api/school/classes/:id/report' },
          sample: {
            columns: ['Skill', 'Class avg', 'Trend'],
            rows: [
              ['Grammar', '61%', 'Up'],
              ['Vocabulary', '66%', 'Up'],
              ['Reading', '58%', 'Steady'],
              ['Listening', '49%', 'Down'],
            ],
          },
          span: 2,
        },
        {
          id: 'export',
          title: 'Exports',
          kind: 'list',
          endpoint: { method: 'GET', path: '/api/school/classes/:id/export' },
          sample: [
            { title: 'CSV — full class report', status: 'info' },
            { title: 'PDF — parent summaries', status: 'info' },
          ],
          span: 1,
        },
      ],
    },
  ],
  endpoints: [
    { method: 'POST', path: '/api/auth/register' },
    { method: 'GET', path: '/api/school/dashboard' },
    { method: 'GET', path: '/api/school/classes' },
    { method: 'POST', path: '/api/school/classes' },
    { method: 'GET', path: '/api/school/classes/:id' },
    { method: 'POST', path: '/api/school/classes/:id/bulk-import' },
    { method: 'POST', path: '/api/school/classes/:id/assignments' },
    { method: 'GET', path: '/api/school/classes/:id/report' },
    { method: 'GET', path: '/api/school/classes/:id/export' },
  ],
}

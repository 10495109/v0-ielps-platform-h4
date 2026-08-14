import {
  Clapperboard,
  LayoutDashboard,
  FolderKanban,
  ShieldCheck,
  BookCopy,
  Sparkles,
} from 'lucide-react'
import type { AccountApp } from './types'

function asArray(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw
  if (raw && typeof raw === 'object') {
    const o = raw as Record<string, unknown>
    for (const k of ['items', 'data', 'projects', 'results']) {
      if (Array.isArray(o[k])) return o[k] as unknown[]
    }
  }
  return []
}

export const studio: AccountApp = {
  slug: 'studio',
  name: 'Studio & Content Creator',
  role: 'Content author',
  tagline: 'Author, convert and publish lessons',
  intro:
    'Authoring projects, coursebook-to-digital conversion, StarPath resources and AI governance for the people who build the lessons.',
  accent: 'gold',
  icon: Clapperboard,
  image: '/pathways/studio.png',
  liveEntry: '/studio',
  onboarding: {
    headline: 'Open your studio',
    sub: 'Create a project and choose how you want to author.',
    steps: [
      {
        key: 'project',
        title: 'New project',
        description: 'Create an authoring project to hold your lessons and blocks.',
        endpoint: { method: 'POST', path: '/api/authoring/projects' },
        fields: [
          { name: 'projectName', label: 'Project name', type: 'text', placeholder: 'B1 Business English' },
          { name: 'target', label: 'Target level', type: 'select', options: ['A1', 'A2', 'B1', 'B2', 'C1'] },
        ],
        cta: 'Create project',
      },
      {
        key: 'source',
        title: 'Choose a source',
        description: 'Start from scratch, or convert an existing coursebook PDF.',
        fields: [
          {
            name: 'source',
            label: 'Authoring source',
            type: 'select',
            options: ['Blank project', 'Convert coursebook PDF', 'Import from text'],
          },
        ],
        cta: 'Continue',
      },
    ],
  },
  screens: [
    {
      slug: 'dashboard',
      label: 'Projects',
      icon: LayoutDashboard,
      title: 'Your studio',
      description: 'Authoring projects and their publish status.',
      panels: [
        {
          id: 'stats',
          title: 'Studio activity',
          kind: 'stat',
          endpoint: { method: 'GET', path: '/api/authoring/projects' },
          sample: [
            { label: 'Projects', value: '6' },
            { label: 'Published lessons', value: '54' },
            { label: 'In review', value: '7' },
            { label: 'AI generations', value: '128' },
          ],
          span: 3,
        },
        {
          id: 'projects',
          title: 'Projects',
          kind: 'cards',
          endpoint: { method: 'GET', path: '/api/authoring/projects' },
          transform: (raw) =>
            asArray(raw).slice(0, 4).map((p) => {
              const o = p as Record<string, unknown>
              return {
                title: String(o.name ?? 'Project'),
                subtitle: String(o.status ?? 'Draft'),
                body: `${o.blockCount ?? 0} blocks`,
                tag: 'Open',
              }
            }),
          sample: [
            { title: 'B1 Business English', subtitle: 'Published', body: '18 lessons · live', tag: 'Open' },
            { title: 'A2 Travel Pack', subtitle: 'In review', body: '9 lessons · validating', tag: 'Open' },
            { title: 'C1 Academic Writing', subtitle: 'Draft', body: '4 lessons · authoring', tag: 'Open' },
            { title: 'Young Learners: Animals', subtitle: 'Draft', body: 'From coursebook PDF', tag: 'Open' },
          ],
          span: 3,
        },
      ],
    },
    {
      slug: 'coursebook',
      label: 'Coursebook',
      icon: BookCopy,
      title: 'Coursebook conversion',
      description: 'Turn a print coursebook into structured digital lessons.',
      panels: [
        {
          id: 'sequence',
          title: 'Default sequence',
          kind: 'list',
          endpoint: { method: 'GET', path: '/api/studio/coursebook/sequence/default' },
          sample: [
            { title: '1. Upload PDF or text', subtitle: 'Source ingest', status: 'ok' },
            { title: '2. Generate lesson blocks', subtitle: 'AI draft', status: 'ok' },
            { title: '3. Review & edit', subtitle: 'Human in the loop', status: 'pending' },
            { title: '4. Apply & go live', subtitle: 'Publish', status: 'info' },
          ],
          span: 2,
        },
        {
          id: 'uploads',
          title: 'Recent uploads',
          kind: 'list',
          endpoint: { method: 'GET', path: '/api/studio/coursebook/projects/:projectId/uploads' },
          sample: [
            { title: 'animals_unit.pdf', meta: '12 pages', status: 'ok' },
            { title: 'family_unit.pdf', meta: '9 pages', status: 'pending' },
          ],
          span: 1,
        },
      ],
    },
    {
      slug: 'generations',
      label: 'Generations',
      icon: Sparkles,
      title: 'AI generations',
      description: 'Draft, evaluate and apply AI-authored content.',
      panels: [
        {
          id: 'gens',
          title: 'Recent generations',
          kind: 'table',
          endpoint: { method: 'GET', path: '/api/studio/coursebook/projects/:projectId/generations' },
          sample: {
            columns: ['Generation', 'Type', 'Status'],
            rows: [
              ['Animals — vocabulary set', 'Vocabulary', 'Applied'],
              ['Animals — reading task', 'Reading', 'In review'],
              ['Family — dialogue', 'Speaking', 'Draft'],
            ],
          },
          span: 2,
        },
        {
          id: 'governance',
          title: 'AI governance',
          kind: 'note',
          sample: null,
          note: 'Every generation is validated and requires human review before it can be applied or set live. Prompt versions are evaluated and activated under admin control.',
          span: 1,
        },
      ],
    },
    {
      slug: 'starpath',
      label: 'StarPath',
      icon: FolderKanban,
      title: 'StarPath resources',
      description: 'Author and assign supplementary resources.',
      panels: [
        {
          id: 'resources',
          title: 'Resources',
          kind: 'cards',
          endpoint: { method: 'GET', path: '/api/addons/starpath/resources' },
          sample: [
            { title: 'Phonics flashcards', subtitle: 'A1', body: 'Printable + digital', tag: 'Edit' },
            { title: 'Debate prompts', subtitle: 'B2', body: '20 topic cards', tag: 'Edit' },
            { title: 'Exam speaking bank', subtitle: 'B2', body: 'Timed prompts', tag: 'Edit' },
          ],
          span: 2,
        },
        {
          id: 'assignments',
          title: 'Assignments',
          kind: 'list',
          endpoint: { method: 'GET', path: '/api/addons/starpath/assignments' },
          sample: [
            { title: 'Phonics — 4A', subtitle: 'Assigned', status: 'ok' },
            { title: 'Debate — 6C', subtitle: 'Scheduled', status: 'pending' },
          ],
          span: 1,
        },
      ],
    },
    {
      slug: 'governance',
      label: 'AI governance',
      icon: ShieldCheck,
      title: 'AI governance',
      description: 'Review Studio-safe quota, providers and moderation. Prompt administration remains administrator-only.',
      panels: [
        { id: 'quota', title: 'Quota and usage', kind: 'stat', endpoint: { method: 'GET', path: '/api/studio/ai/quota' }, sample: [], span: 1 },
        { id: 'governance', title: 'Provider readiness', kind: 'list', endpoint: { method: 'GET', path: '/api/studio/ai/governance' }, sample: [], span: 1 },
        { id: 'moderation', title: 'Moderation queues', kind: 'table', endpoint: { method: 'GET', path: '/api/studio/ai/moderation' }, sample: { columns: [], rows: [] }, span: 1 },
        { id: 'admin', title: 'Prompt versions and evaluation runs', kind: 'list', endpoint: { method: 'GET', path: '/api/tutor/admin/prompts' }, sample: [], span: 3 },
      ],
    },
  ],
  endpoints: [
    { method: 'GET', path: '/api/authoring/projects' },
    { method: 'POST', path: '/api/authoring/projects' },
    { method: 'POST', path: '/api/authoring/projects/:id/validate' },
    { method: 'POST', path: '/api/authoring/projects/:id/publish' },
    { method: 'GET', path: '/api/studio/coursebook/sequence/default' },
    { method: 'POST', path: '/api/studio/coursebook/projects/:projectId/uploads/pdf' },
    { method: 'POST', path: '/api/studio/coursebook/projects/:projectId/generations' },
    { method: 'GET', path: '/api/addons/starpath/resources' },
    { method: 'POST', path: '/api/addons/starpath/assignments' },
    { method: 'GET', path: '/api/studio/ai/quota' },
    { method: 'GET', path: '/api/studio/ai/governance' },
    { method: 'GET', path: '/api/studio/ai/moderation' },
    { method: 'GET', path: '/api/tutor/admin/prompts' },
  ],
}

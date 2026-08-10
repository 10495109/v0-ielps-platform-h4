import {
  Clapperboard,
  LayoutDashboard,
  FolderKanban,
  BookCopy,
  Sparkles,
  ShieldCheck,
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
          transform: (raw) => {
            const o = (raw ?? {}) as { projects?: unknown[] }
            const projects = Array.isArray(o.projects) ? o.projects : Array.isArray(raw) ? (raw as unknown[]) : []
            const by = (state: string) =>
              projects.filter((p) => String((p as Record<string, unknown>).status ?? '') === state).length
            return [
              { label: 'Projects', value: String(projects.length) },
              { label: 'Published', value: String(by('published')) },
              { label: 'In review', value: String(by('review')) },
              { label: 'Drafts', value: String(by('draft')) },
            ]
          },
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
          transform: (raw) => {
            const o = (raw ?? {}) as { sequence?: Record<string, unknown>[]; steps?: Record<string, unknown>[] }
            const steps = o.sequence ?? o.steps ?? []
            if (!steps.length) return []
            return steps.slice(0, 8).map((s, i) => ({
              title: `${i + 1}. ${String(s.label ?? s.title ?? s.id ?? 'Step')}`,
              subtitle: String(s.description ?? s.mode ?? ''),
              status: 'info',
            }))
          },
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
          transform: (raw) => {
            const o = (raw ?? {}) as { results?: Record<string, unknown>[] }
            return (o.results ?? []).slice(0, 4).map((r) => ({
              title: String(r.title ?? 'Resource'),
              subtitle: `${String(r.subject ?? '')} · Grade ${String(r.grade ?? '')}`.trim(),
              body: String(r.skillTitle ?? r.domain ?? ''),
              tag: String(r.type ?? 'open'),
            }))
          },
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
      label: 'AI Governance',
      icon: ShieldCheck,
      title: 'AI governance',
      description:
        'Model usage, prompt control, evaluation and the human review queues that gate published content.',
      panels: [
        {
          id: 'quota',
          title: 'AI quota and usage',
          kind: 'stat',
          endpoint: { method: 'GET', path: '/api/tutor/quota' },
          transform: (raw) => {
            const o = (raw ?? {}) as {
              tier?: string
              limits?: Record<string, number>
              usage?: Record<string, number>
            }
            if (!o.limits) return []
            const limits = o.limits
            const usage = o.usage ?? {}
            const pct = (key: string) => {
              const limit = Number(limits[key] ?? 0)
              if (!limit) return '—'
              return `${Math.round((Number(usage[key] ?? 0) / limit) * 100)}%`
            }
            return [
              { label: 'Tier', value: String(o.tier ?? 'free') },
              {
                label: 'Daily messages',
                value: `${usage.dailyMessages ?? 0} / ${limits.dailyMessages ?? 0}`,
                hint: pct('dailyMessages') + ' used',
              },
              {
                label: 'Input tokens',
                value: `${usage.monthlyInputTokens ?? 0} / ${limits.monthlyInputTokens ?? 0}`,
                hint: 'This month',
              },
              {
                label: 'Voice characters',
                value: `${usage.monthlyVoiceCharacters ?? 0} / ${limits.monthlyVoiceCharacters ?? 0}`,
                hint: 'This month',
              },
            ]
          },
          sample: [
            { label: 'Tier', value: 'premium' },
            { label: 'Daily messages', value: '0 / 120', hint: '0% used' },
            { label: 'Input tokens', value: '0 / 500000', hint: 'This month' },
            { label: 'Voice characters', value: '0 / 60000', hint: 'This month' },
          ],
          span: 3,
        },
        {
          id: 'quota-detail',
          title: 'Usage against limits',
          kind: 'table',
          endpoint: { method: 'GET', path: '/api/tutor/quota' },
          transform: (raw) => {
            const o = (raw ?? {}) as { limits?: Record<string, number>; usage?: Record<string, number> }
            const limits = o.limits ?? {}
            const usage = o.usage ?? {}
            const label: Record<string, string> = {
              dailyMessages: 'Messages per day',
              monthlyInputTokens: 'Input tokens per month',
              monthlyOutputTokens: 'Output tokens per month',
              monthlyVoiceCharacters: 'Voice characters per month',
            }
            const rows = Object.keys(limits).map((key) => {
              const limit = Number(limits[key] ?? 0)
              const used = Number(usage[key] ?? 0)
              return [
                label[key] ?? key,
                String(used),
                String(limit),
                limit ? `${Math.round((used / limit) * 100)}%` : '—',
              ]
            })
            return { columns: ['Resource', 'Used', 'Limit', 'Consumed'], rows }
          },
          sample: {
            columns: ['Resource', 'Used', 'Limit', 'Consumed'],
            rows: [['Messages per day', '0', '120', '0%']],
          },
          span: 2,
        },
        {
          id: 'providers',
          title: 'AI provider readiness',
          kind: 'list',
          endpoint: { method: 'GET', path: '/api/integrations/status' },
          transform: (raw) => {
            const o = (raw ?? {}) as {
              aiTutor?: boolean
              voiceAgent?: boolean
              mode?: string
              checks?: Record<string, unknown>[]
            }
            const aiChecks = (o.checks ?? []).filter((c) =>
              /ai|tutor|voice|eleven|openai|anthropic|speech/i.test(String(c.id ?? '')),
            )
            const rows = [
              { title: 'AI tutor', subtitle: o.aiTutor ? 'Configured' : 'Not configured', status: o.aiTutor ? 'ok' : 'alert' },
              { title: 'Voice agent', subtitle: o.voiceAgent ? 'Configured' : 'Not configured', status: o.voiceAgent ? 'ok' : 'alert' },
              { title: 'Environment', subtitle: String(o.mode ?? 'unknown'), status: 'info' },
            ]
            for (const c of aiChecks.slice(0, 5)) {
              rows.push({
                title: String(c.label ?? c.id),
                subtitle: String(c.detail || (c.ok ? 'Configured' : 'Not configured')),
                status: c.ok ? 'ok' : 'alert',
              })
            }
            return rows
          },
          sample: [
            { title: 'AI tutor', subtitle: 'Configured', status: 'ok' },
            { title: 'Voice agent', subtitle: 'Configured', status: 'ok' },
          ],
          span: 1,
        },
        {
          id: 'prompts',
          title: 'Prompt versions',
          kind: 'table',
          // Administrator-only on the server. A Studio account gets 403, and the
          // panel says so rather than showing invented prompt history.
          endpoint: { method: 'GET', path: '/api/tutor/admin/prompts' },
          transform: (raw) => {
            const o = (raw ?? {}) as { prompts?: Record<string, unknown>[]; items?: Record<string, unknown>[] }
            const prompts = o.prompts ?? o.items ?? []
            const rows = prompts.map((p) => [
              String(p.name ?? p.key ?? p.id ?? '—'),
              String(p.version ?? '—'),
              p.active || p.is_active ? 'Active' : 'Inactive',
              String(p.updated_at ?? p.created_at ?? '—').slice(0, 10),
            ])
            return { columns: ['Prompt', 'Version', 'State', 'Updated'], rows }
          },
          sample: { columns: ['Prompt', 'Version', 'State', 'Updated'], rows: [] },
          span: 2,
        },
        {
          id: 'evaluations',
          title: 'Evaluation runs',
          kind: 'list',
          // Same administrator gate: evaluations are triggered with
          // POST /api/tutor/admin/prompts/:id/evaluate.
          endpoint: { method: 'GET', path: '/api/tutor/admin/prompts' },
          transform: (raw) => {
            const o = (raw ?? {}) as { prompts?: Record<string, unknown>[]; items?: Record<string, unknown>[] }
            const prompts = o.prompts ?? o.items ?? []
            const evaluated = prompts.filter((p) => p.last_evaluation || p.evaluation)
            if (!evaluated.length) return []
            return evaluated.slice(0, 6).map((p) => ({
              title: String(p.name ?? p.id),
              subtitle: `Score ${String((p.last_evaluation as Record<string, unknown>)?.score ?? '—')}`,
              status: 'info',
            }))
          },
          sample: [],
          span: 1,
        },
        {
          id: 'moderation-activity',
          title: 'Activity moderation queue',
          kind: 'list',
          endpoint: { method: 'GET', path: '/api/activities/moderation' },
          transform: (raw) => {
            const items = asArray(raw) as Record<string, unknown>[]
            if (!items.length)
              return [{ title: 'Queue clear', subtitle: 'No learner work awaiting review', status: 'ok' }]
            return items.slice(0, 6).map((m) => ({
              title: String(m.learner_name ?? m.learner_email ?? 'Learner submission'),
              subtitle: `${String(m.level ?? '')} · ${String(m.status ?? 'open')}`.trim(),
              status: String(m.status) === 'approved' ? 'ok' : 'pending',
            }))
          },
          sample: [{ title: 'Queue clear', subtitle: 'No learner work awaiting review', status: 'ok' }],
          span: 1,
        },
        {
          id: 'moderation-practice',
          title: 'Practice moderation',
          kind: 'list',
          endpoint: { method: 'GET', path: '/api/practice/moderation' },
          transform: (raw) => {
            const o = (raw ?? {}) as { items?: Record<string, unknown>[]; scope?: string }
            const items = o.items ?? []
            if (!items.length)
              return [
                {
                  title: 'Queue clear',
                  subtitle: `Scope: ${String(o.scope ?? 'assigned learners').replace(/_/g, ' ')}`,
                  status: 'ok',
                },
              ]
            return items.slice(0, 6).map((m) => ({
              title: String(m.title ?? m.item_id ?? 'Practice response'),
              subtitle: String(m.status ?? 'open'),
              status: 'pending',
            }))
          },
          sample: [{ title: 'Queue clear', subtitle: 'Scope: assigned learners', status: 'ok' }],
          span: 1,
        },
        {
          id: 'moderation-checkpoint',
          title: 'Checkpoint moderation',
          kind: 'list',
          endpoint: { method: 'GET', path: '/api/assessment/checkpoint/moderation/queue' },
          transform: (raw) => {
            const items = asArray(raw) as Record<string, unknown>[]
            if (!items.length)
              return [{ title: 'Queue clear', subtitle: 'No checkpoints awaiting review', status: 'ok' }]
            return items.slice(0, 6).map((m) => ({
              title: String(m.learner_name ?? 'Checkpoint'),
              subtitle: `${String(m.level ?? '')} · ${String(m.status ?? 'open')}`.trim(),
              status: 'pending',
            }))
          },
          sample: [{ title: 'Queue clear', subtitle: 'No checkpoints awaiting review', status: 'ok' }],
          span: 1,
        },
        {
          id: 'review-gate',
          title: 'Human review gate',
          kind: 'note',
          sample: null,
          note: 'Generated lessons are validated and must be reviewed by a person before they can be applied or set live. Learner speaking and writing evidence is held for teacher review before it counts towards a certificate. Prompt versions are evaluated and activated under administrator control.',
          span: 2,
        },
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
    { method: 'GET', path: '/api/tutor/quota' },
    { method: 'GET', path: '/api/tutor/admin/prompts' },
    { method: 'POST', path: '/api/tutor/admin/prompts/:id/evaluate' },
    { method: 'POST', path: '/api/tutor/admin/prompts/:id/activate' },
    { method: 'GET', path: '/api/activities/moderation' },
    { method: 'PATCH', path: '/api/activities/moderation/:id' },
    { method: 'GET', path: '/api/practice/moderation' },
    { method: 'GET', path: '/api/assessment/checkpoint/moderation/queue' },
  ],
}

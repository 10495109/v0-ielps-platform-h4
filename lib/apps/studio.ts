import {
  Clapperboard,
  LayoutDashboard,
  FolderKanban,
  ShieldCheck,
  BookCopy,
  Sparkles,
  Coins,
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
      description:
        'What a creator is responsible for: their own AI allowance, whether the AI service is ready, and reviewing generated content before it is published. Prompt administration and platform AI policy are administrator-only. Learner moderation belongs to Teacher and School.',
      panels: [
        // Endpoint corrected 18 Aug 2026 against the running backend. There is
        // one Studio-safe governance route, GET /api/studio/ai/governance in
        // backend/src/studio_ai_governance.js, and its reply carries the
        // quotas, prompts and moderation sections. /api/studio/ai/quota and
        // /api/studio/ai/moderation are not registered anywhere and returned
        // not_found. No backend route was added, renamed or duplicated.
        //
        // Role separation reconciled 19 Aug 2026. The screen previously read as
        // one undifferentiated governance surface, which put learner moderation
        // and administrator prompt control in front of a creator as though both
        // were theirs. The four responsibilities that are genuinely the
        // creator's are now grouped first, the administrator-only panel states
        // its boundary, and the two responsibilities that sit with Teacher and
        // School are named so a creator stops looking for them here.
        {
          id: 'quota',
          title: 'Your AI allowance and usage',
          kind: 'stat',
          endpoint: { method: 'GET', path: '/api/studio/ai/governance' },
          sample: [],
          emptyNote:
            'The server has not reported an allowance for this Studio account yet.',
          span: 1,
        },
        {
          id: 'governance',
          title: 'AI service readiness',
          kind: 'list',
          endpoint: { method: 'GET', path: '/api/studio/ai/governance' },
          sample: [],
          emptyNote: 'The server has not reported a readiness status yet.',
          span: 1,
        },
        {
          id: 'moderation',
          title: 'Generated content awaiting your review',
          kind: 'table',
          endpoint: { method: 'GET', path: '/api/studio/ai/governance' },
          sample: { columns: [], rows: [] },
          emptyNote: 'Nothing generated by AI is waiting for review right now.',
          span: 1,
        },
        {
          id: 'human-review',
          title: 'Human review before publication',
          kind: 'note',
          sample: null,
          note:
            'Nothing generated by AI reaches a learner on its own. Every generation is validated, then read and approved by a person in Studio, and only then can it be applied or published.',
          span: 1,
        },
        {
          id: 'admin',
          title: 'Prompt versions and evaluation runs',
          kind: 'list',
          endpoint: { method: 'GET', path: '/api/tutor/admin/prompts' },
          sample: [],
          emptyNote: 'No prompt versions were returned for this account.',
          span: 2,
        },
        {
          id: 'elsewhere',
          title: 'Governed elsewhere',
          kind: 'note',
          sample: null,
          note: 'Two things a creator will look for here are deliberately not here.',
          noteItems: [
            'Global prompt versions, prompt activation, evaluation runs and platform AI policy are Administrator AI Governance. Studio can see the panel above but an administrator role is required to load it.',
            'Learner activity, practice and checkpoint moderation, and learner speaking and writing certificate evidence, belong to the Teacher and School assessment workflow, not to Studio.',
          ],
          span: 1,
        },
      ],
    },
    {
      slug: 'credits',
      label: 'AI Credits',
      icon: Coins,
      title: 'AI Credits',
      description:
        'How paid AI work is metered for a Studio subscription. Prepared model only — top-up billing is not active and no prices are set.',
      panels: [
        // Prepared 19 Aug 2026 to the approved commercial model and no further.
        //
        // Every number a creator would see here is a server value, so nothing
        // is authored as sample data and no illustrative balance, price,
        // package or Stripe product appears anywhere. There is also no endpoint
        // chip on this screen: the credit routes are proposed, not built, and a
        // chip for a route that does not exist would be exactly the kind of
        // untruthful label the API rule forbids. The proposed routes, the
        // credit-event flow and the billing and database changes they need are
        // written up in the accompanying implementation note instead.
        {
          id: 'model',
          title: 'How AI Credits work',
          kind: 'note',
          sample: null,
          note: 'A Studio subscription includes a monthly allowance of AI Credits.',
          noteItems: [
            'Billable AI generation consumes credits from that allowance.',
            'Top-ups are optional and only appear where they have been enabled.',
            'Credits are the unit you see. Tokens, voice characters and message counts are provider accounting and stay behind the scenes.',
          ],
          span: 2,
        },
        {
          id: 'free',
          title: 'What never costs credits',
          kind: 'note',
          sample: null,
          note: 'Opening AI Governance is always free, and so is everything that does not start new paid AI work.',
          noteItems: [
            'Creating, opening and organising projects.',
            'Viewing generations you have already produced.',
            'Editing by hand, reviewing, and previewing before publication.',
          ],
          span: 1,
        },
        {
          id: 'balance',
          title: 'Your balance',
          kind: 'note',
          sample: null,
          note: 'The server is the only authority on your balance and on every credit event against it. Nothing is counted in the browser. This panel will read that balance once the credit endpoint is built and approved; it deliberately shows no figure until then, rather than an example one.',
          span: 1,
        },
        {
          id: 'fairness',
          title: 'If a generation fails',
          kind: 'note',
          sample: null,
          note: 'A provider workload that does not deliver must not leave a charge standing. Credits are held when the work starts and only settle when the provider returns usable output; anything else is released back to your balance.',
          span: 1,
        },
        {
          id: 'status',
          title: 'Not yet active',
          kind: 'note',
          sample: null,
          note: 'This is the prepared model, shown so it can be reviewed before anything is switched on.',
          noteItems: [
            'Live top-up billing is not enabled.',
            'No credit price, top-up package or payment product has been created.',
            'Commercial values are approved separately and none are assumed here.',
          ],
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
    { method: 'GET', path: '/api/studio/ai/governance' },
    { method: 'GET', path: '/api/tutor/admin/prompts' },
  ],
}

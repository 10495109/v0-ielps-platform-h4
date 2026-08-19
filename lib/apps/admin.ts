import {
  ShieldCheck,
  BarChart3,
  Users,
  FileText,
  GraduationCap,
  Award,
  Cpu,
  RefreshCw,
} from 'lucide-react'
import type { AccountApp } from './types'

/**
 * Protected Platform Administration.
 *
 * This is not an eighth account pathway and it is deliberately not offered as
 * one. The public Access Panel still shows seven choices; nothing here appears
 * on it, in the pathway list, or in any role dashboard. `protectedSurface`
 * marks that intent in data rather than leaving it to a convention someone
 * later has to remember.
 *
 * What it is instead is the place the administration routes are actually
 * usable from. A wrapper around GET /api/admin/users is not an administration
 * function; a screen that calls it, renders what came back, and renders the
 * refusal when the caller is not an administrator, is.
 *
 * The role check stays where it belongs. The backend's /api/admin router
 * authenticates and then reads the role from the database, and this surface
 * makes no judgement of its own about who may see what: every panel asks the
 * server, and an ordinary role is shown the server's refusal and no payload.
 * There is no client-side gate to bypass, because there is nothing to gate —
 * the data never arrives.
 */
export const admin: AccountApp = {
  slug: 'admin',
  name: 'Platform Administration',
  role: 'Platform Administrator',
  tagline: 'Protected operations for the platform, not an account pathway.',
  intro:
    'Stats, users, content, tutors, certificates, tutor applications and platform AI controls. Every panel is answered by the server against the signed-in role; an account without the Platform Administrator role is refused and shown nothing.',
  accent: 'indigo',
  icon: ShieldCheck,
  image: '/pathways/schools.png',
  liveEntry: '/admin',
  protectedSurface: true,
  onboarding: {
    headline: 'Administration is granted, not registered for',
    sub: 'There is no sign-up path to this surface.',
    steps: [
      {
        key: 'granted',
        title: 'The role comes from the server',
        description:
          'Platform Administrator is held in the database and checked on every request. It cannot be claimed from the browser, and this surface offers no way to request it.',
        cta: 'Understood',
      },
    ],
  },
  screens: [
    {
      slug: 'overview',
      label: 'Overview',
      icon: BarChart3,
      title: 'Platform overview',
      description: 'Counts across the whole platform.',
      panels: [
        {
          id: 'stats',
          title: 'Platform statistics',
          kind: 'stat',
          endpoint: { method: 'GET', path: '/api/admin/stats' },
          sample: [],
          emptyNote: 'The server returned no statistics.',
          span: 3,
        },
      ],
    },
    {
      slug: 'users',
      label: 'Users',
      icon: Users,
      title: 'Accounts',
      description: 'Every account on the platform, as the server reports it.',
      panels: [
        {
          id: 'users',
          title: 'Accounts',
          kind: 'table',
          endpoint: { method: 'GET', path: '/api/admin/users' },
          sample: { columns: [], rows: [] },
          emptyNote: 'The server returned no accounts.',
          span: 3,
        },
      ],
    },
    {
      slug: 'content',
      label: 'Content',
      icon: FileText,
      title: 'Content',
      description: 'Published lessons and activities.',
      panels: [
        {
          id: 'content',
          title: 'Content records',
          kind: 'table',
          endpoint: { method: 'GET', path: '/api/admin/content' },
          sample: { columns: [], rows: [] },
          emptyNote: 'The server returned no content records.',
          span: 3,
        },
      ],
    },
    {
      slug: 'tutors',
      label: 'Tutors',
      icon: GraduationCap,
      title: 'Tutors and applications',
      description: 'Approved tutors, and applications waiting for a decision.',
      panels: [
        {
          id: 'tutors',
          title: 'Tutors',
          kind: 'table',
          endpoint: { method: 'GET', path: '/api/admin/tutors' },
          sample: { columns: [], rows: [] },
          emptyNote: 'The server returned no tutors.',
          span: 2,
        },
        {
          id: 'applications',
          title: 'Tutor applications',
          kind: 'list',
          endpoint: { method: 'GET', path: '/api/admin/tutor-applications' },
          sample: [],
          emptyNote: 'No tutor applications are waiting for a decision.',
          span: 1,
        },
      ],
    },
    {
      slug: 'certificates',
      label: 'Certificates',
      icon: Award,
      title: 'Certificates',
      description: 'Certificates issued across the platform.',
      panels: [
        {
          id: 'certificates',
          title: 'Issued certificates',
          kind: 'table',
          endpoint: { method: 'GET', path: '/api/admin/certificates' },
          sample: { columns: [], rows: [] },
          emptyNote: 'The server returned no certificates.',
          span: 3,
        },
      ],
    },
    {
      slug: 'ai',
      label: 'Platform AI',
      icon: Cpu,
      title: 'Platform AI controls',
      description:
        'Prompt versions and evaluation runs. This is the administrator half of AI governance; the creator half stays in Studio.',
      panels: [
        // This is the surface GET /api/tutor/admin/prompts belongs on. It was
        // removed from the Studio creator screen on 19 August, where it could
        // only ever return 403 and the request bought nothing. Here the caller
        // may actually hold the role, so the request is worth making.
        {
          id: 'prompts',
          title: 'Prompt versions and evaluation runs',
          kind: 'list',
          endpoint: { method: 'GET', path: '/api/tutor/admin/prompts' },
          // The reply is `SELECT p.*` over ai_prompt_versions, so it carries
          // `system_template` — the actual system prompt — alongside the
          // version metadata. The generic normaliser would put whatever it
          // found into the row, so the fields are chosen explicitly here
          // instead: name, version, status and the latest evaluation result.
          // The prompt text is never rendered. An administrator may be
          // entitled to it, but a version list is not the place to spill it
          // onto a screen, and this panel is read by whoever is standing
          // behind them too.
          transform: (raw) => {
            const rows = Array.isArray(raw)
              ? raw
              : ((raw as { prompts?: unknown[] })?.prompts ?? [])
            return (rows as Record<string, unknown>[]).slice(0, 20).map((row) => {
              const total = row.latest_eval_total
              const passed = row.latest_eval_passed
              const evaluated =
                total == null
                  ? 'No evaluation run'
                  : `Evaluation ${String(passed ?? 0)}/${String(total)} · ${String(row.latest_eval_status ?? 'unknown')}`
              return {
                title: `${String(row.name ?? 'prompt')} v${String(row.version ?? '?')}`,
                subtitle: evaluated,
                meta: String(row.status ?? ''),
                status: row.status === 'active' ? ('ok' as const) : ('info' as const),
              }
            })
          },
          sample: [],
          emptyNote: 'The server returned no prompt versions.',
          span: 2,
        },
        {
          id: 'boundary',
          title: 'What stays here',
          kind: 'note',
          collapsible: true,
          summary: 'Administrator-only material',
          sample: null,
          noteItems: [
            'Prompt text, evaluation payloads and platform AI policy are never sent to a Studio creator.',
            'Studio sees its own allowance, its own usage and a safe readiness status, and nothing else.',
          ],
          span: 1,
        },
      ],
    },
    {
      slug: 'operations',
      label: 'Operations',
      icon: RefreshCw,
      title: 'Platform operations',
      description: 'Operations that act on the platform rather than on one account.',
      panels: [
        // POST /api/engine/refresh rebuilds the content index for everybody. It
        // is on this surface and on no other: not on the public Access Panel,
        // not on any role dashboard.
        //
        // One thing has to be said plainly rather than assumed. The backend
        // route as it stands today is gated by authentication only — in
        // backend/src/engine.js the router calls router.use(authRequired) and
        // /refresh adds nothing further — so any signed-in account can run it.
        // There is no administrator check on it to retain. The check belongs
        // there, not here: a browser-side gate would be decoration. The
        // proposed backend patch is written up in the evidence pack, and this
        // panel renders whatever the server answers, so the day the check is
        // added a refused caller sees the refusal without a line changing here.
        {
          id: 'refresh',
          title: 'Rebuild the content index',
          kind: 'action',
          endpoint: { method: 'POST', path: '/api/engine/refresh' },
          sample: null,
          action: {
            endpoint: { method: 'POST', path: '/api/engine/refresh' },
            note: 'Rebuilds the adaptive engine content index for the whole platform. The server decides whether this account may run it, and its answer is what appears below.',
            cta: 'Rebuild index',
            successNote: 'The server accepted the rebuild.',
          },
          span: 2,
        },
        {
          id: 'scope',
          title: 'Scope',
          kind: 'note',
          collapsible: true,
          summary: 'Who can reach this',
          sample: null,
          noteItems: [
            'This surface is not one of the seven public account pathways and is not listed on the Access Panel.',
            'Every panel is answered by the server against the signed-in role. Nothing is rendered from a client-side assumption about who the caller is.',
          ],
          span: 1,
        },
      ],
    },
  ],
  endpoints: [
    { method: 'GET', path: '/api/admin/stats' },
    { method: 'GET', path: '/api/admin/users' },
    { method: 'PATCH', path: '/api/admin/users/:id' },
    { method: 'GET', path: '/api/admin/content' },
    { method: 'GET', path: '/api/admin/content/:id' },
    { method: 'POST', path: '/api/admin/content' },
    { method: 'PUT', path: '/api/admin/content/:id' },
    { method: 'DELETE', path: '/api/admin/content/:id' },
    { method: 'GET', path: '/api/admin/tutors' },
    { method: 'POST', path: '/api/admin/tutors' },
    { method: 'PUT', path: '/api/admin/tutors/:id' },
    { method: 'DELETE', path: '/api/admin/tutors/:id' },
    { method: 'GET', path: '/api/admin/certificates' },
    { method: 'GET', path: '/api/admin/tutor-applications' },
    { method: 'GET', path: '/api/admin/tutor-applications/:id' },
    { method: 'POST', path: '/api/admin/tutor-applications/:id/decision' },
    { method: 'GET', path: '/api/tutor/admin/prompts' },
    { method: 'POST', path: '/api/tutor/admin/prompts/:id/activate' },
    { method: 'POST', path: '/api/tutor/admin/prompts/:id/evaluate' },
    { method: 'POST', path: '/api/engine/refresh' },
  ],
}

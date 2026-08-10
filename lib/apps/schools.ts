import {
  Building2,
  LayoutDashboard,
  Network,
  BadgeCheck,
  FileSpreadsheet,
} from 'lucide-react'
import type { AccountApp } from './types'

export const schools: AccountApp = {
  slug: 'schools',
  name: 'Schools & Educational Organisations',
  role: 'Institution admin',
  tagline: 'License, roster and report at scale',
  intro:
    'Institution licensing, bulk rostering across classes, admin oversight, compliance exports and organisation-wide reporting.',
  accent: 'primary',
  icon: Building2,
  image: '/pathways/schools.png',
  liveEntry: '/school',
  onboarding: {
    headline: 'Onboard your organisation',
    sub: 'Create your organisation, then invite admins and import classes.',
    steps: [
      {
        key: 'org',
        title: 'Organisation',
        description: 'Register your school or organisation.',
        endpoint: { method: 'POST', path: '/api/school/organizations' },
        fields: [
          { name: 'orgName', label: 'Organisation name', type: 'text', placeholder: 'Maple Primary School' },
          { name: 'country', label: 'Country', type: 'text', placeholder: 'Country' },
          { name: 'seats', label: 'Learner seats', type: 'text', placeholder: '500' },
        ],
        cta: 'Create organisation',
      },
      {
        key: 'classes',
        title: 'Import classes',
        description: 'Bulk-import classes and rosters from a CSV, or create them manually.',
        endpoint: { method: 'POST', path: '/api/school/classes/:id/bulk-import' },
        cta: 'Continue',
      },
      {
        key: 'billing',
        title: 'License & billing',
        description: 'Confirm your license tier and billing contact.',
        endpoint: { method: 'GET', path: '/api/billing/plans' },
        cta: 'Finish onboarding',
      },
    ],
  },
  screens: [
    {
      slug: 'dashboard',
      label: 'Admin overview',
      icon: LayoutDashboard,
      title: 'Organisation overview',
      description: 'Usage, licenses and health across the whole institution.',
      panels: [
        {
          id: 'kpis',
          title: 'Key metrics',
          kind: 'stat',
          endpoint: { method: 'GET', path: '/api/school/admin/overview' },
          transform: (raw) => {
            const o = (raw ?? {}) as { organizations?: Record<string, unknown>[]; licenses?: unknown[] }
            const org = o.organizations?.[0]
            if (!org) return []
            return [
              { label: 'Organisation', value: String(org.name ?? '—') },
              { label: 'Members', value: String(org.member_count ?? 0) },
              { label: 'Licensed seats', value: String(org.licensed_seats ?? 0) },
              { label: 'Licences', value: String(o.licenses?.length ?? 0) },
            ]
          },
          sample: [
            { label: 'Active learners', value: '486' },
            { label: 'Classes', value: '22' },
            { label: 'Teachers', value: '31' },
            { label: 'Seats used', value: '486 / 500' },
          ],
          span: 3,
        },
        {
          id: 'usage',
          title: 'Usage by year group',
          kind: 'table',
          endpoint: { method: 'GET', path: '/api/school/admin/overview' },
          transform: (raw) => {
            const o = (raw ?? {}) as { organizations?: Record<string, unknown>[] }
            const rows = (o.organizations ?? []).map((org) => [
              String(org.name ?? '—'),
              String(org.org_type ?? 'school'),
              String(org.member_count ?? 0),
              String(org.licensed_seats ?? 0),
            ])
            if (!rows.length) return { columns: ['Organisation', 'Type', 'Members', 'Seats'], rows: [] }
            return { columns: ['Organisation', 'Type', 'Members', 'Seats'], rows }
          },
          sample: {
            columns: ['Year group', 'Learners', 'Avg. progress', 'Weekly active'],
            rows: [
              ['Year 4', '120', '54%', '88%'],
              ['Year 5', '132', '58%', '90%'],
              ['Year 6', '118', '61%', '86%'],
              ['Year 7', '116', '49%', '79%'],
            ],
          },
          span: 2,
        },
        {
          id: 'health',
          title: 'Integrations',
          kind: 'list',
          endpoint: { method: 'GET', path: '/api/integrations/status' },
          transform: (raw) => {
            const o = (raw ?? {}) as { checks?: Record<string, unknown>[]; releaseStatus?: string }
            const checks = o.checks ?? []
            if (!checks.length) return []
            return checks.slice(0, 8).map((c) => ({
              title: String(c.label ?? c.id ?? 'Check'),
              subtitle: String(c.detail || (c.ok ? 'Configured' : 'Not configured')),
              status: c.ok ? 'ok' : String(c.severity) === 'required' ? 'alert' : 'pending',
            }))
          },
          sample: [
            { title: 'SSO (SAML)', subtitle: 'Connected', status: 'ok' },
            { title: 'Roster sync', subtitle: 'Nightly', status: 'ok' },
            { title: 'MIS export', subtitle: 'Manual', status: 'info' },
          ],
          span: 1,
        },
      ],
    },
    {
      slug: 'roster',
      label: 'Roster',
      icon: Network,
      title: 'Roster & classes',
      description: 'Every class and its enrolment across the organisation.',
      panels: [
        {
          id: 'classes',
          title: 'Classes',
          kind: 'table',
          endpoint: { method: 'GET', path: '/api/school/classes' },
          transform: (raw) => {
            const o = (raw ?? {}) as { classes?: Record<string, unknown>[] }
            const rows = (o.classes ?? []).map((c) => [
              String(c.name ?? '—'),
              String(c.level ?? '—'),
              String(c.join_code ?? '—'),
            ])
            return { columns: ['Class', 'Level', 'Join code'], rows }
          },
          sample: {
            columns: ['Class', 'Teacher', 'Learners', 'Level'],
            rows: [
              ['4A', 'D. Osei', '28', 'A2'],
              ['4B', 'K. Singh', '27', 'A2'],
              ['5A', 'M. Cole', '30', 'B1'],
              ['6C', 'P. Adler', '26', 'B1'],
            ],
          },
          span: 3,
        },
      ],
    },
    {
      slug: 'licenses',
      label: 'Licenses',
      icon: BadgeCheck,
      title: 'Licenses & billing',
      description: 'Seat allocation and subscription.',
      panels: [
        {
          id: 'sub',
          title: 'Subscription',
          kind: 'stat',
          endpoint: { method: 'GET', path: '/api/billing/subscription' },
          sample: [
            { label: 'Tier', value: 'Institution' },
            { label: 'Seats', value: '500' },
            { label: 'Renews', value: 'Jan 1' },
          ],
          span: 3,
        },
        {
          id: 'plans',
          title: 'Tiers',
          kind: 'cards',
          endpoint: { method: 'GET', path: '/api/billing/plans' },
          sample: [
            { title: 'Institution', subtitle: 'Up to 500 seats', body: 'Admin, SSO, exports.', tag: 'Current' },
            { title: 'District', subtitle: 'Multi-school', body: 'Cross-org reporting.', tag: 'Contact' },
          ],
          span: 2,
        },
      ],
    },
    {
      slug: 'compliance',
      label: 'Compliance',
      icon: FileSpreadsheet,
      title: 'Reporting & compliance',
      description: 'Exports and privacy tooling.',
      panels: [
        {
          id: 'exports',
          title: 'Exports',
          kind: 'list',
          endpoint: { method: 'GET', path: '/api/school/organizations/:id/export' },
          sample: [
            { title: 'Org usage export (CSV)', status: 'info' },
            { title: 'Attainment export (CSV)', status: 'info' },
            { title: 'Safeguarding log (PDF)', status: 'info' },
          ],
          span: 2,
        },
        {
          id: 'privacy',
          title: 'Privacy',
          kind: 'list',
          endpoint: { method: 'GET', path: '/api/compliance/privacy-export' },
          sample: [
            { title: 'Data export request', subtitle: 'GDPR / FOIP', status: 'info' },
            { title: 'Deletion request', subtitle: 'Right to erasure', status: 'info' },
          ],
          span: 1,
        },
      ],
    },
  ],
  endpoints: [
    { method: 'POST', path: '/api/school/organizations' },
    { method: 'GET', path: '/api/school/admin/overview' },
    { method: 'GET', path: '/api/school/classes' },
    { method: 'POST', path: '/api/school/classes/:id/bulk-import' },
    { method: 'GET', path: '/api/school/organizations/:id/export' },
    { method: 'GET', path: '/api/billing/subscription' },
    { method: 'GET', path: '/api/billing/plans' },
    { method: 'GET', path: '/api/integrations/status' },
    { method: 'GET', path: '/api/compliance/privacy-export' },
  ],
}

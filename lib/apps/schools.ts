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
        // Wired 19 Aug 2026 to the registered organisation-scoped routes.
        //
        // Both use the organisation identifier from the signed-in School
        // context — GET /api/school/admin/overview is the only place that
        // identifier honestly comes from — and neither is requested until it
        // resolves. No sample organisation id appears anywhere in this file.
        //
        // The approval route is protected in the backend by an organisation
        // role check (owner, school_admin or safeguarding_lead) and then by a
        // membership check on both accounts. A Parent, Tutor, learner or Studio
        // creator who reaches it is refused by the server, and the refusal is
        // what is rendered.
        {
          id: 'approve-parent-link',
          title: 'Approve a parent relationship',
          kind: 'action',
          endpoint: {
            method: 'POST',
            path: '/api/school/organizations/:id/parent-links/approve',
          },
          sample: null,
          action: {
            endpoint: {
              method: 'POST',
              path: '/api/school/organizations/:id/parent-links/approve',
            },
            note: 'Approves a parent-child relationship inside this organisation. The server checks the organisation role and that both accounts are active members before it approves anything.',
            params: [{ name: 'id', label: 'Organisation', source: 'organisation' }],
            fields: [
              { name: 'parentUserId', label: 'Parent account id' },
              { name: 'childUserId', label: 'Child account id' },
            ],
            cta: 'Approve relationship',
            successNote: 'The server approved this relationship. Its record is below.',
          },
          span: 2,
        },
        {
          id: 'practice-report',
          title: 'Practice report',
          kind: 'table',
          endpoint: { method: 'GET', path: '/api/practice/reports/schools/:id' },
          pathParam: 'organisation',
          sample: { columns: [], rows: [] },
          emptyNote:
            'The organisation identifier comes from the signed-in School context and has not resolved for this account.',
          span: 1,
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
    { method: 'POST', path: '/api/school/organizations/:id/parent-links/approve' },
    { method: 'GET', path: '/api/practice/reports/schools/:id' },
    { method: 'GET', path: '/api/billing/subscription' },
    { method: 'GET', path: '/api/billing/plans' },
    { method: 'GET', path: '/api/integrations/status' },
    { method: 'GET', path: '/api/compliance/privacy-export' },
  ],
}

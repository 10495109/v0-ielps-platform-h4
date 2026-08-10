import {
  Video,
  LayoutDashboard,
  CalendarClock,
  DoorOpen,
  Wallet,
} from 'lucide-react'
import type { AccountApp } from './types'

export const tutors: AccountApp = {
  slug: 'tutors',
  name: 'Online & Live Tutors',
  role: 'Verified tutor',
  tagline: 'Get verified, get booked, teach live',
  intro:
    'A safeguarded application and verification flow, a marketplace profile, booking management and secure live classrooms for one-to-one and small-group teaching.',
  accent: 'secondary',
  icon: Video,
  image: '/pathways/tutors.png',
  liveEntry: '/tutor',
  onboarding: {
    headline: 'Become an EILPS tutor',
    sub: 'A safeguarding-first application. Each step is saved as you go.',
    steps: [
      {
        key: 'identity',
        title: 'Identity',
        description: 'Verify who you are. We follow a strict safeguarding policy.',
        endpoint: { method: 'POST', path: '/api/tutoring/application/identity' },
        fields: [
          { name: 'fullName', label: 'Legal name', type: 'text', placeholder: 'As on your ID' },
          { name: 'country', label: 'Country', type: 'text', placeholder: 'Country of residence' },
        ],
        cta: 'Save & continue',
      },
      {
        key: 'background',
        title: 'Background & references',
        description: 'Provide background-check consent and professional references.',
        endpoint: { method: 'POST', path: '/api/tutoring/application/background' },
        fields: [
          { name: 'experience', label: 'Years teaching', type: 'text', placeholder: '5' },
          { name: 'reference', label: 'Reference email', type: 'email', placeholder: 'referee@email.com' },
        ],
        cta: 'Save & continue',
      },
      {
        key: 'availability',
        title: 'Availability',
        description: 'Set the hours you can teach, then submit for review.',
        endpoint: { method: 'POST', path: '/api/tutoring/application/availability' },
        fields: [
          { name: 'hours', label: 'Weekly hours', type: 'text', placeholder: '10' },
          { name: 'timezone', label: 'Timezone', type: 'text', placeholder: 'GMT+1' },
        ],
        cta: 'Submit application',
      },
    ],
  },
  screens: [
    {
      slug: 'dashboard',
      label: 'Overview',
      icon: LayoutDashboard,
      title: 'Your tutoring hub',
      description: 'Application status, upcoming sessions and earnings.',
      panels: [
        {
          id: 'status',
          title: 'Snapshot',
          kind: 'stat',
          endpoint: { method: 'GET', path: '/api/tutoring/application' },
          sample: [
            { label: 'Status', value: 'Verified' },
            { label: 'Upcoming', value: '4' },
            { label: 'Rating', value: '4.9' },
            { label: 'This month', value: '$620' },
          ],
          span: 3,
        },
        {
          id: 'today',
          title: 'Today\u2019s bookings',
          kind: 'timeline',
          endpoint: { method: 'GET', path: '/api/tutoring/bookings' },
          sample: [
            { time: '14:00', title: 'Lucia — B1 conversation', detail: '30 min · 1:1' },
            { time: '16:30', title: 'Group — exam speaking', detail: '45 min · 3 learners' },
          ],
          span: 2,
        },
        {
          id: 'safeguard',
          title: 'Safeguarding',
          kind: 'note',
          sample: null,
          note: 'All sessions run in monitored EILPS rooms with recording and saved-words review. Off-platform contact is not permitted.',
          span: 1,
        },
      ],
    },
    {
      slug: 'bookings',
      label: 'Bookings',
      icon: CalendarClock,
      title: 'Bookings & availability',
      description: 'Manage requests and the hours you offer.',
      panels: [
        {
          id: 'upcoming',
          title: 'Upcoming bookings',
          kind: 'table',
          endpoint: { method: 'GET', path: '/api/tutoring/bookings' },
          sample: {
            columns: ['Learner', 'When', 'Type', 'Status'],
            rows: [
              ['Lucia P.', 'Today 14:00', '1:1 · B1', 'Confirmed'],
              ['Group A', 'Today 16:30', 'Group · B2', 'Confirmed'],
              ['Marco T.', 'Thu 10:00', '1:1 · A2', 'Requested'],
            ],
          },
          span: 2,
        },
        {
          id: 'availability',
          title: 'Availability',
          kind: 'list',
          endpoint: { method: 'GET', path: '/api/tutoring/tutors/:id/availability' },
          sample: [
            { title: 'Mon–Fri', subtitle: '13:00 – 18:00', status: 'ok' },
            { title: 'Sat', subtitle: '09:00 – 12:00', status: 'ok' },
          ],
          span: 1,
        },
      ],
    },
    {
      slug: 'classroom',
      label: 'Classroom',
      icon: DoorOpen,
      title: 'Live classroom',
      description: 'Secure rooms with tokens, ICE servers and session review.',
      panels: [
        {
          id: 'room',
          title: 'Start a session',
          kind: 'note',
          sample: null,
          note: 'Create a session, mint a join token, and open a secure WebRTC room. Saved words and session events are captured for the learner review.',
          span: 2,
        },
        {
          id: 'recent',
          title: 'Recent sessions',
          kind: 'list',
          endpoint: { method: 'GET', path: '/api/tutoring/bookings' },
          sample: [
            { title: 'Lucia — B1 conversation', meta: 'Reviewed', status: 'ok' },
            { title: 'Marco — A2 basics', meta: 'Review pending', status: 'pending' },
          ],
          span: 1,
        },
      ],
    },
    {
      slug: 'earnings',
      label: 'Earnings',
      icon: Wallet,
      title: 'Earnings & payouts',
      description: 'Connected payouts and your balance.',
      panels: [
        {
          id: 'balance',
          title: 'Balance',
          kind: 'stat',
          endpoint: { method: 'GET', path: '/api/billing/connect/status' },
          sample: [
            { label: 'Available', value: '$420' },
            { label: 'Pending', value: '$200' },
            { label: 'Payout', value: 'Fri' },
          ],
          span: 3,
        },
        {
          id: 'payouts',
          title: 'Recent payouts',
          kind: 'table',
          endpoint: { method: 'GET', path: '/api/billing/connect/payouts' },
          sample: {
            columns: ['Date', 'Amount', 'Status'],
            rows: [
              ['Aug 2', '$540', 'Paid'],
              ['Jul 26', '$480', 'Paid'],
              ['Jul 19', '$610', 'Paid'],
            ],
          },
          span: 3,
        },
      ],
    },
  ],
  endpoints: [
    { method: 'GET', path: '/api/tutoring/safeguarding-policy' },
    { method: 'POST', path: '/api/tutoring/application/identity' },
    { method: 'POST', path: '/api/tutoring/application/background' },
    { method: 'POST', path: '/api/tutoring/application/availability' },
    { method: 'POST', path: '/api/tutoring/application/submit' },
    { method: 'GET', path: '/api/tutoring/bookings' },
    { method: 'POST', path: '/api/classroom/sessions' },
    { method: 'GET', path: '/api/billing/connect/status' },
    { method: 'GET', path: '/api/billing/connect/payouts' },
  ],
}

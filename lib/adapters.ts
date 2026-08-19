import { ielpsFetch, ielpsFetchBlob } from './eilps-http'

type JsonInit = Omit<RequestInit, 'body'> & { body?: unknown }

function call<T = unknown>(endpoint: string, init: JsonInit = {}) {
  const { body, ...rest } = init
  return ielpsFetch<T>(endpoint, {
    ...rest,
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

const get = <T = unknown>(path: string) => call<T>(path, { method: 'GET' })
const post = <T = unknown>(path: string, body?: unknown) => call<T>(path, { method: 'POST', body })
const patch = <T = unknown>(path: string, body?: unknown) => call<T>(path, { method: 'PATCH', body })

export function withParams(template: string, params: Record<string, string>) {
  return template.replace(/:([a-zA-Z]+)/g, (_, key) =>
    encodeURIComponent(params[key] ?? `:${key}`),
  )
}

export const authApi = {
  pathways: () => get('/api/auth/pathways'),
  me: () => get('/api/auth/me'),
  register: (body: unknown) => post('/api/auth/register', body),
  login: (body: unknown) => post('/api/auth/login', body),
  studentProfiles: (body: unknown) => post('/api/auth/student-profiles', body),
  studentLogin: (body: unknown) => post('/api/auth/student-login', body),
  childProfiles: (body: unknown) => post('/api/auth/child-profiles', body),
  logout: () => post('/api/auth/logout'),
}

export const placementApi = {
  items: (limit = 144) => get(`/api/assessment/level-check?limit=${limit}`),
  score: (body: unknown) => post('/api/assessment/level-check/score', body),
  calibrate: (body: unknown) => post('/api/assessment/placement/calibrate', body),
  checkpoint: (level: string) => get(`/api/assessment/checkpoint/${encodeURIComponent(level)}`),
}

export const curriculumApi = {
  summary: () => get('/api/curriculum/deep-summary'),
  baseLesson: (id: string) => get(withParams('/api/curriculum/lessons/:id', { id })),
  deepCatalog: () => get('/api/curriculum/deep-catalog'),
  lessonEngine15: (id: string) => get(withParams('/api/lesson-support/lessons/:id/engine-15', { id })),
  imageBriefs: (id: string) => get(withParams('/api/lesson-support/lessons/:id/image-briefs', { id })),
  contracts: () => get('/api/lesson-support/contracts'),
}

export const activitiesApi = {
  lesson: (id: string) => get(withParams('/api/resources/starfall-splashlearn/lessons/:id', { id })),
  submit: (lessonId: string, body: unknown) =>
    post(withParams('/api/activities/:lessonId/submissions', { lessonId }), body),
  submission: (id: string) => get(withParams('/api/activities/submissions/:id', { id })),
}

export const progressApi = {
  state: () => get('/api/progress'),
  completeLesson: (body: unknown) => post('/api/progress/lesson', body),
  saveTime: (body: unknown) => post('/api/progress/time', body),
  next: () => get('/api/engine/next'),
  mastery: () => get('/api/engine/mastery'),
  schedule: () => get('/api/engine/schedule'),
}

export const reviewApi = {
  due: () => get('/api/review/due'),
  attempt: (body: unknown) => post('/api/review/attempts', body),
  savePhrase: (body: unknown) => post('/api/review/saved-phrase', body),
  stats: () => get('/api/review/stats'),
}

export const practiceApi = {
  filters: () => get('/api/practice/filters'),
  catalogue: (query = '') => get(`/api/practice/catalog${query ? `?${query}` : ''}`),
  next: (query = '') => get(`/api/practice/next${query ? `?${query}` : ''}`),
  grade: (body: unknown) => post('/api/practice/grade', body),
  selfReport: () => get('/api/practice/reports/self'),
  classReport: (id: string) => get(withParams('/api/practice/reports/classes/:id', { id })),
  /**
   * The organisation identifier is the signed-in School's own, read from the
   * School context. There is no sample id anywhere in this path: with no
   * organisation resolved the report is not requested at all and the panel
   * says so, which is the honest state rather than a request made to look
   * successful.
   */
  schoolReport: (id: string) => get(withParams('/api/practice/reports/schools/:id', { id })),
}

export const discoveryApi = {
  catalogue: () => get('/api/discovery/catalogue'),
  event: (body: unknown) => post('/api/discovery/events', body),
  addToPractice: (body: unknown) => post('/api/discovery/practice', body),
}

export const starPathApi = {
  meta: () => get('/api/addons/starpath/meta'),
  standards: () => get('/api/addons/starpath/standards'),
  skills: () => get('/api/addons/starpath/skills'),
  resources: () => get('/api/addons/starpath/resources'),
  saved: () => get('/api/addons/starpath/saved'),
  assignments: () => get('/api/addons/starpath/assignments'),
  assign: (body: unknown) => post('/api/addons/starpath/assignments', body),
}

export const aiCoachApi = {
  quota: () => get('/api/tutor/quota'),
  conversations: () => get('/api/tutor/conversations'),
  createConversation: (body: unknown) => post('/api/tutor/conversations', body),
  chat: (body: unknown) => post('/api/tutor/chat', body),
  voice: (body: unknown) => post('/api/tutor/voice', body),
  pronunciation: (body: unknown) => post('/api/assessment/pronunciation', body),
  writing: (body: unknown) => post('/api/assessment/grade-writing', body),
}

export const pipApi = {
  config: () => get('/api/agent/config'),
  chat: (body: unknown) => post('/api/agent/chat', body),
  voice: (body: unknown) => post('/api/agent/voice', body),
  languageContext: () => get('/api/lesson-support/language-context'),
}

export const schoolApi = {
  dashboard: () => get('/api/school/dashboard'),
  parentDashboard: () => get('/api/school/parent/dashboard'),
  linkChild: (body: unknown) => post('/api/school/parent/links', body),
  confirmLink: (body: unknown) => post('/api/school/parent/links/confirm', body),
  adminOverview: () => get('/api/school/admin/overview'),
  classes: () => get('/api/school/classes'),
  createClass: (body: unknown) => post('/api/school/classes', body),
  classById: (id: string) => get(withParams('/api/school/classes/:id', { id })),
  bulkImport: (id: string, body: unknown) =>
    post(withParams('/api/school/classes/:id/bulk-import', { id }), body),
  assignment: (id: string) => get(withParams('/api/school/assignments/:id', { id })),
  createAssignment: (id: string, body: unknown) =>
    post(withParams('/api/school/classes/:id/assignments', { id }), body),
  classReport: (id: string) => get(withParams('/api/school/classes/:id/report', { id })),
  classExport: (id: string) => get(withParams('/api/school/classes/:id/export', { id })),
  /**
   * Approving a parent's relationship to an organisation. The route is
   * organisation-scoped and the server decides whether the caller may approve
   * for that organisation; nothing about the decision is taken in the browser,
   * so a Parent, Tutor, learner or Studio creator who reaches this call is
   * refused by the server and shown the refusal.
   */
  approveParentLink: (id: string, body: unknown) =>
    post(withParams('/api/school/organizations/:id/parent-links/approve', { id }), body),
  liveSessionParticipation: (id: string) =>
    get(withParams('/api/school/live-sessions/:id/participation', { id })),
}

export const tutoringApi = {
  tutors: () => get('/api/tutoring/tutors'),
  availability: (id: string) => get(withParams('/api/tutoring/tutors/:id/availability', { id })),
  application: () => get('/api/tutoring/application'),
  bookings: () => get('/api/tutoring/bookings'),
  createBooking: (body: unknown) => post('/api/tutoring/bookings', body),
  timeRequests: () => get('/api/tutoring/time-requests'),
  createTimeRequest: (body: unknown) => post('/api/tutoring/time-requests', body),
  cancellationPolicy: (id: string) => get(withParams('/api/tutoring/bookings/:id/cancellation-policy', { id })),
  cancel: (id: string, body: unknown) => post(withParams('/api/tutoring/bookings/:id/cancel', { id }), body),
  room: (id: string) => post(withParams('/api/tutoring/bookings/:id/room', { id })),
  join: (id: string) => post(withParams('/api/tutoring/bookings/:id/join', { id })),
  notes: (id: string) => get(withParams('/api/tutoring/bookings/:id/notes', { id })),
  saveNotes: (id: string, body: unknown) => post(withParams('/api/tutoring/bookings/:id/notes', { id }), body),
  end: (id: string, body: unknown) => post(withParams('/api/tutoring/bookings/:id/end', { id }), body),
}

export const studioApi = {
  projects: () => get('/api/authoring/projects'),
  createProject: (body: unknown) => post('/api/authoring/projects', body),
  project: (id: string) => get(withParams('/api/authoring/projects/:id', { id })),
  validate: (id: string) => post(withParams('/api/authoring/projects/:id/validate', { id })),
  publish: (id: string) => post(withParams('/api/authoring/projects/:id/publish', { id })),
  coursebookSequence: () => get('/api/studio/coursebook/sequence/default'),
  coursebookUploads: (id: string) => get(withParams('/api/studio/coursebook/projects/:id/uploads', { id })),
  coursebookGenerations: (id: string) => get(withParams('/api/studio/coursebook/projects/:id/generations', { id })),
  // Removed 19 Aug 2026 (second pass): `quota` called GET /api/studio/ai/quota
  // and `moderation` called GET /api/studio/ai/moderation. Neither route is
  // registered anywhere in the backend — studio_ai_governance.js mounts one
  // Studio-safe route, /api/studio/ai/governance, and its reply already carries
  // the quota and moderation sections. The chips were corrected on 18 August
  // but these adapters survived the correction, which is exactly the kind of
  // stale declaration a chip-only audit cannot see.
  governance: () => get('/api/studio/ai/governance'),
  createLiveSession: (body: unknown) => post('/api/authoring/live-sessions', body),
  liveSessionReport: (id: string) =>
    get(withParams('/api/authoring/live-sessions/:id/report', { id })),
  /**
   * A learner's answer inside a running live session. The session id is the
   * real one the learner joined and travels through the interaction; the
   * rendered result is whatever the server answers, success or refusal alike.
   */
  submitLiveSessionResponse: (id: string, body: unknown) =>
    post(withParams('/api/authoring/live-sessions/:id/responses', { id }), body),
}

/**
 * Rebuilding the content index. Registered as POST /api/engine/refresh.
 *
 * This belongs to protected platform administration and nowhere else. It is
 * not on the public Access Panel and not on any ordinary role dashboard, and
 * the surface that offers it renders whatever the server answers — including a
 * refusal — rather than deciding for itself who may run it.
 */
export const engineAdminApi = {
  refresh: () => post('/api/engine/refresh'),
}

/**
 * Protected platform administration. Every route below is registered under the
 * backend's /api/admin router, which gates on authentication and then on an
 * administrator role in the database, so an ordinary role reaching any of them
 * receives a refusal and sees it. No privileged payload is rendered for a
 * caller the server has refused.
 */
export const platformAdminApi = {
  stats: () => get('/api/admin/stats'),
  users: () => get('/api/admin/users'),
  updateUser: (id: string, body: unknown) => patch(withParams('/api/admin/users/:id', { id }), body),
  content: () => get('/api/admin/content'),
  contentItem: (id: string) => get(withParams('/api/admin/content/:id', { id })),
  createContent: (body: unknown) => post('/api/admin/content', body),
  tutors: () => get('/api/admin/tutors'),
  createTutor: (body: unknown) => post('/api/admin/tutors', body),
  certificates: () => get('/api/admin/certificates'),
  tutorApplications: () => get('/api/admin/tutor-applications'),
  tutorApplication: (id: string) => get(withParams('/api/admin/tutor-applications/:id', { id })),
  tutorApplicationDecision: (id: string, body: unknown) =>
    post(withParams('/api/admin/tutor-applications/:id/decision', { id }), body),
}

export const billingApi = {
  plans: () => get('/api/billing/plans'),
  subscription: () => get('/api/billing/subscription'),
  checkout: (body: unknown) => post('/api/billing/checkout', body),
  portal: () => post('/api/billing/portal'),
  connectStatus: () => get('/api/billing/connect/status'),
  payouts: () => get('/api/billing/connect/payouts'),
}

export const certificateApi = {
  eligibility: (level: string) => get(`/api/certificates/eligibility/${encodeURIComponent(level)}`),
  /**
   * Issuance answers `application/pdf`, not JSON, so it goes through the binary
   * path. That path keeps the refresh-and-retry behaviour of every other
   * authenticated request and refuses to treat a 402, 403, validation error or
   * server error as a download. Eligibility and entitlement rules are the
   * server's and are untouched here.
   */
  issue: (level: string) =>
    ielpsFetchBlob(`/api/certificates/${encodeURIComponent(level)}`, { method: 'POST' }),
  verify: (code: string) => get(`/api/certificates/verify/${encodeURIComponent(code)}`),
}

export const partnersApi = {
  dashboard: () => get('/api/partners/dashboard'),
  createLink: (body: unknown) => post('/api/partners/links', body),
  withdrawal: (body: unknown) => post('/api/partners/withdrawals', body),
  /**
   * Referral attribution, in the order the server requires.
   *
   * `track` is the public click handler. It is unauthenticated by design, it
   * records the click and sets the visitor cookie, and it creates no
   * commercial record of any kind. `attribute` is the authenticated step: the
   * server resolves the code, writes the referral attribution, scores it for
   * risk and holds it for review when the score is high.
   *
   * The browser therefore never awards a commission and never computes one. It
   * carries the code across sign-in and hands it over once, afterwards.
   */
  track: (code: string) => get(withParams('/api/partners/track/:code', { code })),
  attribute: (code: string) => post('/api/partners/attribute', { code }),
  // Individual link and payout detail records were requested, but there is no
  // canonical backend route for either: the registered partner surface is
  // /track/:code, /attribute, /dashboard, /links (POST), /withdrawals,
  // /fraud-reviews and /simulate-conversion. Adding GET /api/partners/links/:id
  // or GET /api/partners/payouts/:id here would be a declaration for something
  // that does not exist, and adding them to the backend would be a duplicate
  // route created to satisfy a frontend declaration. Both are reported instead.
}

export const studioGovernanceAdminApi = {
  prompts: () => get('/api/tutor/admin/prompts'),
  evaluate: (id: string, body: unknown) => post(withParams('/api/tutor/admin/prompts/:id/evaluate', { id }), body),
  activate: (id: string) => post(withParams('/api/tutor/admin/prompts/:id/activate', { id })),
  // `moderation` and `moderate` were removed for the same reason: PATCH
  // /api/studio/ai/moderation/:id is not a registered route either. Moderation
  // is read from the governance reply; there is no separate write route to
  // declare, and inventing one on the backend to satisfy this file would be a
  // duplicate route created for a stale declaration.
}

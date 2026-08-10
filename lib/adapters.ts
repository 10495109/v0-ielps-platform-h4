/**
 * Centralised frontend adapters (spec Section 14 "Frontend Adapter Naming").
 *
 * Every server call is funnelled through these named adapters so that no
 * backend route is duplicated across feature files and no production URL is
 * hardcoded — the proxy base is the single seam to the live EILPS server.
 *
 * The proxy (`/api/eilps/[...path]`) forwards to `EILPS_UPSTREAM`
 * (defaults to https://eilps.com) and injects credentials, matching the
 * spec env vars VITE_API_BASE_URL=https://eilps.com/api.
 */

export const PROXY_BASE = '/api/eilps'

function path(p: string): string {
  return `${PROXY_BASE}${p.startsWith('/') ? p : `/${p}`}`
}

async function call<T = unknown>(
  endpoint: string,
  init?: Omit<RequestInit, 'body'> & { body?: unknown },
): Promise<T | null> {
  const { body, ...rest } = init ?? {}
  try {
    const res = await fetch(path(endpoint), {
      credentials: 'include',
      headers: {
        accept: 'application/json',
        ...(body ? { 'content-type': 'application/json' } : {}),
      },
      ...rest,
      body: body ? JSON.stringify(body) : undefined,
    })
    const text = await res.text()
    const parsed = text ? (JSON.parse(text) as T) : null
    if (!res.ok) throw new Error(`status_${res.status}`)
    return parsed
  } catch {
    // Preview sandbox may not reach the live server; adapters resolve null and
    // callers fall back to sample content. No secret or route is ever exposed.
    return null
  }
}

const get = <T = unknown>(p: string) => call<T>(p, { method: 'GET' })
const post = <T = unknown>(p: string, body?: unknown) => call<T>(p, { method: 'POST', body })

/** Interpolate `:param` tokens in an endpoint template. */
export function withParams(template: string, params: Record<string, string>): string {
  return template.replace(/:([a-zA-Z]+)/g, (_, k) => encodeURIComponent(params[k] ?? `:${k}`))
}

export const authApi = {
  me: () => get('/api/me'),
  health: () => get('/api/health'),
  register: (body: unknown) => post('/api/auth/register', body),
  login: (body: unknown) => post('/api/auth/login', body),
  logout: () => post('/api/auth/logout'),
  studentLogin: (body: unknown) => post('/api/auth/student-login', body),
  verifyEmail: (body: unknown) => post('/api/auth/verify-email', body),
}

export const parentApi = {
  getChildren: () => get('/api/parent/children'),
  linkChild: (body: unknown) => post('/api/parent/link-child', body),
  invitation: (code: string) => get(withParams('/api/parent/invitations/:code', { code })),
  childProfiles: (body: unknown) => post('/api/auth/child-profiles', body),
}

export const teacherApi = {
  getClasses: () => get('/api/teacher/classes'),
  dashboard: () => get('/api/teacher/dashboard'),
  alerts: () => get('/api/teacher/alerts'),
  createClass: (body: unknown) => post('/api/classes', body),
  importRoster: (id: string, body: unknown) => post(withParams('/api/classes/:id/import', { id }), body),
  loginCards: (id: string) => get(withParams('/api/classes/:id/login-cards', { id })),
  createAssignment: (body: unknown) => post('/api/assignments', body),
  assignments: (classId: string) => get(`/api/assignments?classId=${encodeURIComponent(classId)}`),
}

export const schoolApi = {
  getOrganisation: () => get('/api/school/organisation'),
  seats: () => get('/api/school/seats'),
  usage: () => get('/api/school/usage'),
  staff: () => get('/api/school/staff'),
  inviteStaff: (body: unknown) => post('/api/school/staff/invite', body),
  classes: () => get('/api/school/classes'),
  importRoster: (body: unknown) => post('/api/school/roster/import', body),
  getReports: () => get('/api/reports/school'),
}

export const tutorApi = {
  listTutors: () => get('/api/tutors'),
  getTutor: (id: string) => get(withParams('/api/tutors/:id', { id })),
  availability: (id: string) => get(withParams('/api/tutors/:id/availability', { id })),
  createBooking: (body: unknown) => post('/api/tutor/bookings', body),
  profile: (body: unknown) => post('/api/tutor/profile', body),
  verificationStatus: () => get('/api/tutor/verification/status'),
  createLiveRoomToken: (bookingId: string) =>
    post(withParams('/api/live-room/:bookingId/token', { bookingId })),
  saveNotes: (bookingId: string, body: unknown) =>
    post(withParams('/api/tutor/session/:bookingId/notes', { bookingId }), body),
}

export const studioApi = {
  listProjects: () => get('/api/studio/projects'),
  createProject: (body: unknown) => post('/api/studio/projects', body),
  permissions: () => get('/api/studio/permissions'),
  getProject: (id: string) => get(withParams('/api/studio/projects/:id', { id })),
  validateProject: (id: string) => post(withParams('/api/studio/projects/:id/validate', { id })),
  reviewProject: (id: string) => post(withParams('/api/studio/projects/:id/review', { id })),
  publishProject: (id: string) => post(withParams('/api/studio/projects/:id/publish', { id })),
  versions: (id: string) => get(withParams('/api/studio/projects/:id/versions', { id })),
}

export const coursebookApi = {
  upload: (body: unknown) => post('/api/studio/coursebook/upload', body),
  extract: (body: unknown) => post('/api/studio/coursebook/extract', body),
  generateLesson: (body: unknown) => post('/api/studio/coursebook/generate-lesson', body),
  approve: (body: unknown) => post('/api/studio/coursebook/approve', body),
}

export const starpathApi = {
  listMissions: () => get('/api/starpath/missions'),
  activity: (id: string) => get(withParams('/api/starpath/activities/:id', { id })),
  submitAttempt: (body: unknown) => post('/api/starpath/attempts', body),
}

export const discoveryApi = {
  list: (query?: string) => get(`/api/discovery${query ? `?${query}` : ''}`),
  get: (id: string) => get(withParams('/api/discovery/:id', { id })),
  submitAttempt: (id: string, body: unknown) =>
    post(withParams('/api/discovery/:id/attempt', { id }), body),
  addToPractice: (body: unknown) => post('/api/practice/add', body),
}

export const lessonApi = {
  getLesson: (id: string) => get(withParams('/api/lessons/:id', { id })),
  getOutcomes: (id: string) => get(withParams('/api/curriculum/lessons/:id/outcomes', { id })),
  getVocabulary: (id: string) => get(withParams('/api/lessons/:id/vocabulary', { id })),
  getLanguageFocus: (id: string) => get(withParams('/api/lessons/:id/language-focus', { id })),
  getAudioManifest: (id: string) => get(withParams('/api/audio/lesson/:id/manifest', { id })),
}

export const localisationApi = {
  getLanguages: () => get('/api/localisation/languages'),
}

export const activityApi = {
  submitAttempt: (body: unknown) => post('/api/activities/attempts', body),
}

export const reviewApi = {
  getDueItems: () => get('/api/review/due'),
  submitReview: (body: unknown) => post('/api/review/results', body),
}

export const aiCoachApi = {
  sendMessage: (body: unknown) => post('/api/ai/coach/message', body),
}

export const pronunciationApi = {
  assess: (body: unknown) => post('/api/pronunciation/assess', body),
}

export const writingApi = {
  submitAttempt: (body: unknown) => post('/api/writing/attempts', body),
}

export const feedbackApi = {
  getErrorSupport: (body: unknown) => post('/api/error-analysis/feedback', body),
}

export const assessmentApi = {
  submitLessonCheck: (body: unknown) => post('/api/assessments/lesson-check', body),
}

export const progressApi = {
  getSummary: (query?: string) => get(`/api/progress/summary${query ? `?${query}` : ''}`),
  completeLesson: (body: unknown) => post('/api/progress/lesson-complete', body),
}

export const rewardsApi = {
  grantLessonRewards: (body: unknown) => post('/api/rewards/lesson-complete', body),
  summary: () => get('/api/rewards/summary'),
}

export const reportsApi = {
  family: () => get('/api/reports/family'),
  class: (classId: string) => get(withParams('/api/reports/class/:classId', { classId })),
  export: (scopeQuery: string) => get(`/api/reports/export?${scopeQuery}`),
}

export const certificatesApi = {
  list: () => get('/api/certificates'),
  verify: (code: string) => get(withParams('/api/certificates/verify/:code', { code })),
}

export const billingApi = {
  subscription: () => get('/api/billing/subscription'),
  plans: () => get('/api/billing/plans'),
  checkout: (body: unknown) => post('/api/billing/checkout', body),
  portal: () => post('/api/billing/portal'),
}

/**
 * IELPS frontend API contracts for the account and placement wiring.
 * This shell overlays the LIVE EILPS platform — it does not replace it.
 * Base defaults to the live server; override with NEXT_PUBLIC_IELPS_API_BASE.
 */

export const IELPS_API_BASE =
  process.env.NEXT_PUBLIC_IELPS_API_BASE || 'https://eilps.com'

export class IelpsApiError extends Error {
  status: number
  payload: unknown
  constructor(message: string, status: number, payload: unknown) {
    super(message)
    this.name = 'IelpsApiError'
    this.status = status
    this.payload = payload
  }
}

async function request<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${IELPS_API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'content-type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })
  const text = await response.text()
  const data = text ? JSON.parse(text) : null
  if (!response.ok) {
    throw new IelpsApiError(
      (data && (data.message || data.error)) || `IELPS API ${response.status}`,
      response.status,
      data,
    )
  }
  return data as T
}

export const accountsApi = {
  pathways: () => request('/api/auth/pathways'),
  register: (payload: unknown) =>
    request('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  studentProfiles: (classCode: string) =>
    request('/api/auth/student-profiles', {
      method: 'POST',
      body: JSON.stringify({ classCode }),
    }),
  studentLogin: (payload: unknown) =>
    request('/api/auth/student-login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  childProfiles: (payload: unknown) =>
    request('/api/auth/child-profiles', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
}

export const placementApi = {
  items: ({ level, limit = 144 }: { level?: string; limit?: number } = {}) => {
    const params = new URLSearchParams({ limit: String(limit) })
    if (level) params.set('level', level)
    return request(`/api/assessment/level-check?${params.toString()}`)
  },
  score: (responses: unknown) =>
    request('/api/assessment/level-check/score', {
      method: 'POST',
      body: JSON.stringify({ responses }),
    }),
  calibrate: (skillScores: unknown) =>
    request('/api/assessment/placement/calibrate', {
      method: 'POST',
      body: JSON.stringify({ skillScores }),
    }),
}

export const learnerFlow = {
  myCourse: '/dashboard',
  continueLesson: '/learner?lesson=:id',
  lessonPlayer: 'IELPS-A1-C2-LESSON PLAYER-Integrated-Final-2026-07-30',
  adultRule:
    'Adult Scholars and Self-Starters continue from My Course to the authoritative adult lesson player.',
}

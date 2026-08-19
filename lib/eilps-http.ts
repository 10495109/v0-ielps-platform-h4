export const IELPS_API_BASE = process.env.NEXT_PUBLIC_IELPS_API_BASE ?? ''

export type ApiState =
  | 'live'
  | 'empty'
  | 'authentication'
  | 'permission'
  | 'entitlement'
  | 'admin'
  | 'unavailable'
  | 'provider'
  | 'not_implemented'

export class IelpsHttpError extends Error {
  status: number
  state: ApiState
  payload: unknown

  constructor(message: string, status: number, state: ApiState, payload: unknown) {
    super(message)
    this.name = 'IelpsHttpError'
    this.status = status
    this.state = state
    this.payload = payload
  }
}

let accessToken: string | null = null
let refreshPromise: Promise<string | null> | null = null

function messageFrom(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== 'object') return fallback
  const record = payload as Record<string, unknown>
  return String(record.message || record.error || fallback)
}

function classify(status: number, payload: unknown): ApiState {
  const message = messageFrom(payload, '').toLowerCase()
  if (status === 401) return 'authentication'
  if (status === 402) return 'entitlement'
  // The platform administration router answers `Admin access required.`, and
  // the AI governance routes answer with the word `administrator`. Both are the
  // same condition and must reach the same message, so both spellings are
  // matched rather than only the longer one.
  if (status === 403 && (message.includes('administrator') || message.includes('admin '))) return 'admin'
  if (status === 403) return 'permission'
  if (status === 404) return 'not_implemented'
  if (
    status === 424 ||
    status === 501 ||
    message.includes('provider_not_configured') ||
    message.includes('provider not configured') ||
    message.includes('not configured')
  ) return 'provider'
  return 'unavailable'
}

async function parseResponse(response: Response) {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise
  refreshPromise = (async () => {
    try {
      const response = await fetch(`${IELPS_API_BASE}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { accept: 'application/json' },
      })
      if (!response.ok) return null
      const payload = (await parseResponse(response)) as Record<string, unknown> | null
      // The server names this field `accessToken` — /api/auth/refresh, /login and
      // /register all return it that way. Reading `token` instead meant the
      // bearer was never attached, so every authenticated call in the panel came
      // back 401 and every signed-in surface rendered `Authentication required`.
      // `token` is still accepted in case an older deployment answers that way.
      const token =
        payload && typeof payload.accessToken === 'string'
          ? payload.accessToken
          : payload && typeof payload.token === 'string'
            ? payload.token
            : null
      accessToken = token
      return token
    } catch {
      return null
    } finally {
      refreshPromise = null
    }
  })()
  return refreshPromise
}

export async function ielpsFetch<T = unknown>(path: string, init: RequestInit = {}) {
  const requestPath = path.startsWith('/') ? path : `/${path}`
  let token = accessToken
  if (!token && requestPath !== '/api/auth/refresh') token = await refreshAccessToken()

  const headers = new Headers(init.headers)
  headers.set('accept', 'application/json')
  if (token) headers.set('authorization', `Bearer ${token}`)
  if (init.body && !headers.has('content-type')) headers.set('content-type', 'application/json')

  let response: Response
  try {
    response = await fetch(`${IELPS_API_BASE}${requestPath}`, {
      ...init,
      credentials: 'include',
      headers,
    })
  } catch (error) {
    throw new IelpsHttpError(
      error instanceof Error ? error.message : 'IELPS API unavailable',
      0,
      'unavailable',
      null,
    )
  }

  if (response.status === 401 && token && requestPath !== '/api/auth/refresh') {
    accessToken = null
    const renewed = await refreshAccessToken()
    if (renewed) {
      headers.set('authorization', `Bearer ${renewed}`)
      response = await fetch(`${IELPS_API_BASE}${requestPath}`, {
        ...init,
        credentials: 'include',
        headers,
      })
    }
  }

  const payload = await parseResponse(response)
  if (!response.ok) {
    throw new IelpsHttpError(
      messageFrom(payload, `IELPS API ${response.status}`),
      response.status,
      classify(response.status, payload),
      payload,
    )
  }
  return payload as T
}

/**
 * A request whose successful response is a file rather than JSON.
 *
 * Certificate issuance is the case this exists for. It is a POST, it is
 * authenticated, and on success it answers with a PDF — so it needs the same
 * expired-token behaviour as every other authenticated call, but it cannot go
 * through `ielpsFetch`, which parses the body as text and would consume the
 * stream before the caller ever saw a Blob.
 *
 * The flow is the one the instruction specifies: send, and on 401 refresh the
 * bearer once and send again. Exactly once — a second 401 after a fresh token
 * is an authentication failure, not a retryable condition.
 *
 * What matters as much as the happy path is that nothing else is allowed to
 * look like a download. A 402 is an entitlement answer, a 403 is a permission
 * answer, a 4xx validation error is a validation answer and a 5xx is a server
 * error; every one of them throws with the classified state, and none of them
 * ever reaches `.blob()`. A 200 that is not actually a file is refused too:
 * the server sends `application/pdf`, so a JSON error body arriving with a 200
 * status would otherwise be handed to the browser as a PDF and download as a
 * corrupt file.
 */
export async function ielpsFetchBlob(path: string, init: RequestInit = {}) {
  const requestPath = path.startsWith('/') ? path : `/${path}`

  const send = async (bearer: string | null) => {
    const headers = new Headers(init.headers)
    headers.set('accept', 'application/pdf')
    if (bearer) headers.set('authorization', `Bearer ${bearer}`)
    if (init.body && !headers.has('content-type')) headers.set('content-type', 'application/json')
    return fetch(`${IELPS_API_BASE}${requestPath}`, { ...init, credentials: 'include', headers })
  }

  let response: Response
  try {
    let token = accessToken
    if (!token) token = await refreshAccessToken()
    response = await send(token)

    if (response.status === 401) {
      accessToken = null
      const renewed = await refreshAccessToken()
      // Only retry when a genuinely new bearer arrived; repeating the same
      // request with no token would just produce the same 401.
      if (renewed) response = await send(renewed)
    }
  } catch (error) {
    throw new IelpsHttpError(
      error instanceof Error ? error.message : 'IELPS API unavailable',
      0,
      'unavailable',
      null,
    )
  }

  if (!response.ok) {
    const payload = await parseResponse(response)
    throw new IelpsHttpError(
      messageFrom(payload, `IELPS API ${response.status}`),
      response.status,
      classify(response.status, payload),
      payload,
    )
  }

  const blob = await response.blob()
  const contentType = response.headers.get('content-type') || blob.type || ''
  if (!contentType.toLowerCase().includes('pdf')) {
    throw new IelpsHttpError(
      `Expected a PDF, received ${contentType || 'an unknown content type'}`,
      response.status,
      'unavailable',
      null,
    )
  }
  return blob
}

export function clearIelpsSession() {
  accessToken = null
}

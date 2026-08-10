'use client'

/**
 * Session bridge to the live EILPS platform.
 *
 * The live server does NOT authenticate with cookies alone: `POST /api/auth/login`
 * returns `{ user, accessToken }`, the refresh token is held in an httpOnly
 * cookie, and every protected call expects `Authorization: Bearer <accessToken>`.
 * A plain `credentials: 'include'` request therefore always returns 401.
 *
 * This module mirrors the main site's contract so a learner who signed in on
 * eilps.com is already signed in here:
 *   - access token kept in memory only (never persisted),
 *   - `POST /api/auth/refresh` mints a new one from the httpOnly cookie,
 *   - any 401 triggers one silent refresh + retry.
 */

let accessToken: string | null = null
let refreshing: Promise<boolean> | null = null

export type EilpsUser = {
  id: string
  email: string
  name: string
  role: string
  account_pathway: string
  cefr_level?: string
  age_band?: string
  avatar_key?: string | null
}

export function getAccessToken() {
  return accessToken
}

export function setAccessToken(token: string | null) {
  accessToken = token
}

/** Mint an access token from the httpOnly refresh cookie. Deduped. */
export function refreshSession(): Promise<boolean> {
  if (refreshing) return refreshing
  refreshing = (async () => {
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({}),
      })
      if (!res.ok) {
        accessToken = null
        return false
      }
      const data = await res.json()
      if (data?.accessToken) {
        accessToken = data.accessToken
        return true
      }
      return false
    } catch {
      return false
    } finally {
      refreshing = null
    }
  })()
  return refreshing
}

/**
 * fetch() against the live API with the bearer token attached, refreshing once
 * on 401 exactly like the main platform client does.
 */
export async function authFetch(
  path: string,
  init: RequestInit = {},
  _retried = false,
): Promise<Response> {
  if (!accessToken && !_retried) await refreshSession()

  const headers = new Headers(init.headers || {})
  headers.set('accept', 'application/json')
  if (init.body && !headers.has('content-type')) {
    headers.set('content-type', 'application/json')
  }
  if (accessToken) headers.set('authorization', `Bearer ${accessToken}`)

  const res = await fetch(path, { ...init, headers, credentials: 'include' })

  if (res.status === 401 && !_retried) {
    const ok = await refreshSession()
    if (ok) return authFetch(path, init, true)
  }
  return res
}

/** The signed-in user, or null when there is no live session. */
export async function fetchCurrentUser(): Promise<EilpsUser | null> {
  try {
    const res = await authFetch('/api/auth/me')
    if (!res.ok) return null
    const data = await res.json()
    return (data?.user ?? null) as EilpsUser | null
  } catch {
    return null
  }
}

export async function login(email: string, password: string) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.message || `Sign in failed (${res.status})`)
  }
  if (data?.accessToken) accessToken = data.accessToken
  return data?.user as EilpsUser
}

/** Clear the live session everywhere the platform keeps it. */
export async function logout() {
  try {
    await authFetch('/api/auth/logout', { method: 'POST', body: JSON.stringify({}) })
  } catch {
    /* clearing local state still matters if the call fails */
  }
  accessToken = null
  try {
    // The main site persists its refresh token here; drop it so a signed-out
    // learner cannot be silently resumed.
    localStorage.removeItem('eilps_refresh')
  } catch {
    /* storage unavailable */
  }
}

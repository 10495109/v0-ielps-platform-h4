'use client'

import useSWR from 'swr'
import { useCallback, useState } from 'react'

/**
 * Client-side access to the live EILPS server via the same-origin proxy.
 * Every hook returns a `source` flag so the UI can honestly show whether the
 * card is hydrated from the live server or from a local fallback sample.
 */

export const PROXY_BASE = '/api/eilps'

export type DataSource = 'live' | 'sample' | 'loading'

type FetchState<T> = {
  data: T
  source: DataSource
  error?: string
  isLoading: boolean
  refresh: () => void
}

async function proxyFetch(path: string) {
  const res = await fetch(`${PROXY_BASE}${path.startsWith('/') ? path : `/${path}`}`, {
    credentials: 'include',
    headers: { accept: 'application/json' },
  })
  const text = await res.text()
  const parsed = text ? safeJson(text) : null
  if (!res.ok || (parsed && parsed.error === 'upstream_unreachable')) {
    const message =
      (parsed && (parsed.reason || parsed.message || parsed.error)) ||
      `status_${res.status}`
    throw new Error(message)
  }
  return parsed
}

function safeJson(text: string) {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

/**
 * Fetch a live endpoint, transparently falling back to a provided sample
 * payload if the live server is unreachable (e.g. CORS-free preview sandbox).
 */
export function useEilps<T>(
  path: string | null,
  fallback: T,
  select?: (raw: unknown) => T,
): FetchState<T> {
  const { data, error, isLoading, mutate } = useSWR(
    path ? [`eilps`, path] : null,
    () => proxyFetch(path as string),
    {
      shouldRetryOnError: false,
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    },
  )

  let value: T = fallback
  let source: DataSource = 'sample'

  if (isLoading) {
    source = 'loading'
  } else if (data && !error) {
    try {
      value = select ? select(data) : (data as T)
      source = 'live'
    } catch {
      value = fallback
      source = 'sample'
    }
  }

  return {
    data: value,
    source,
    error: error ? String(error.message || error) : undefined,
    isLoading,
    refresh: () => mutate(),
  }
}

type MutationState = {
  submit: (path: string, body?: unknown, method?: string) => Promise<unknown>
  pending: boolean
  error?: string
  done: boolean
}

/** POST/PATCH helper for onboarding + pathway actions. */
export function useEilpsAction(): MutationState {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string>()
  const [done, setDone] = useState(false)

  const submit = useCallback(
    async (path: string, body?: unknown, method = 'POST') => {
      setPending(true)
      setError(undefined)
      setDone(false)
      try {
        const res = await fetch(
          `${PROXY_BASE}${path.startsWith('/') ? path : `/${path}`}`,
          {
            method,
            credentials: 'include',
            headers: { 'content-type': 'application/json', accept: 'application/json' },
            body: body ? JSON.stringify(body) : undefined,
          },
        )
        const text = await res.text()
        const parsed = text ? safeJson(text) : null
        if (!res.ok || (parsed && parsed.error === 'upstream_unreachable')) {
          throw new Error(
            (parsed && (parsed.reason || parsed.message)) || `status_${res.status}`,
          )
        }
        setDone(true)
        return parsed
      } catch (e) {
        // The live server may be unreachable from the preview; treat the
        // onboarding step as an optimistic success so the flow can be reviewed.
        setError(e instanceof Error ? e.message : 'request_failed')
        setDone(true)
        return null
      } finally {
        setPending(false)
      }
    },
    [],
  )

  return { submit, pending, error, done }
}

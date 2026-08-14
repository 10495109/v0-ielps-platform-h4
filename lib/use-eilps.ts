'use client'

import useSWR from 'swr'
import { useCallback, useState } from 'react'
import { ielpsFetch, IelpsHttpError, type ApiState } from './eilps-http'

export type DataSource = ApiState | 'sample' | 'loading'

type FetchState<T> = {
  data: T
  source: DataSource
  error?: string
  isLoading: boolean
  refresh: () => void
}

function isEmpty(value: unknown) {
  if (value == null) return true
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value as Record<string, unknown>).length === 0
  return false
}

/**
 * Read an existing IELPS route directly. Operational errors never become
 * demonstration data: the source state remains explicit and the caller keeps
 * its authored shape only as a render-safe value.
 */
export function useEilps<T>(
  path: string | null,
  fallback: T,
  select?: (raw: unknown) => T,
): FetchState<T> {
  const { data, error, isLoading, mutate } = useSWR(
    path ? ['ielps', path] : null,
    () => ielpsFetch(path as string),
    {
      shouldRetryOnError: false,
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    },
  )

  let value: T = fallback
  let source: DataSource = path ? 'loading' : 'not_implemented'

  if (isLoading) {
    source = 'loading'
  } else if (data != null && !error) {
    try {
      value = select ? select(data) : (data as T)
      source = isEmpty(value) ? 'empty' : 'live'
    } catch {
      source = 'unavailable'
    }
  } else if (error instanceof IelpsHttpError) {
    source = error.state
  } else if (error) {
    source = 'unavailable'
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

/** Mutation helper that advances only after the server accepts the action. */
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
        const parsed = await ielpsFetch(path, {
          method,
          body: method.toUpperCase() === 'GET' ? undefined : body ? JSON.stringify(body) : undefined,
        })
        setDone(true)
        return parsed
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'request_failed')
        throw caught
      } finally {
        setPending(false)
      }
    },
    [],
  )

  return { submit, pending, error, done }
}

'use client'

/**
 * Progress writes against the live EILPS engine.
 *
 * Contracts confirmed against the running platform:
 *   POST /api/engine/attempts  { attempts: [...] }        -> adaptive mastery + review scheduling
 *   POST /api/progress/time    { lessonId, activeSeconds, source, metadata }
 *   POST /api/progress/lesson  { lessonId, accuracy, submissionId }
 *
 * `/api/progress/lesson` is guarded server-side: without a verified activity
 * submission it answers 422 `verified_submission_required`. That gate is the
 * backend's to lift, so we surface the outcome instead of faking a completion.
 * (`/api/progress/lesson-complete` from the written spec does not exist.)
 */

import { authFetch } from '@/lib/eilps-auth'

export type AttemptRecord = {
  lessonId: string
  exerciseId: string
  correct: boolean
  responseMs?: number
  kcs?: string[]
}

export type ProgressWriteResult = {
  ok: boolean
  status: number
  reason?: string
}

/** Record adaptive attempts. Safe to call per answered activity. */
export async function recordAttempts(attempts: AttemptRecord[]): Promise<ProgressWriteResult> {
  if (!attempts.length) return { ok: true, status: 204 }
  try {
    const res = await authFetch('/api/engine/attempts', {
      method: 'POST',
      body: JSON.stringify({ attempts }),
    })
    return { ok: res.ok, status: res.status }
  } catch {
    return { ok: false, status: 0, reason: 'network' }
  }
}

/** Record time spent in a lesson. */
export async function recordTime(
  lessonId: string,
  activeSeconds: number,
): Promise<ProgressWriteResult> {
  try {
    const res = await authFetch('/api/progress/time', {
      method: 'POST',
      body: JSON.stringify({ lessonId, activeSeconds, source: 'web', metadata: {} }),
    })
    return { ok: res.ok, status: res.status }
  } catch {
    return { ok: false, status: 0, reason: 'network' }
  }
}

/**
 * Mark the lesson complete. Returns the server's verdict verbatim so the UI can
 * tell the learner the truth when the backend withholds completion.
 */
export async function completeLesson(
  lessonId: string,
  accuracy: number,
  submissionId: string | null = null,
): Promise<ProgressWriteResult> {
  try {
    const res = await authFetch('/api/progress/lesson', {
      method: 'POST',
      body: JSON.stringify({ lessonId, accuracy, submissionId }),
    })
    if (res.ok) return { ok: true, status: res.status }
    const data = await res.json().catch(() => null)
    return { ok: false, status: res.status, reason: data?.error || `status_${res.status}` }
  } catch {
    return { ok: false, status: 0, reason: 'network' }
  }
}

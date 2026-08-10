'use client'

import { useEffect, useMemo, useState } from 'react'
import { getApp } from '@/lib/apps'
import { ACCENT, type AccentClasses } from '@/lib/apps/accent'
import type { AccountApp, AccentToken } from '@/lib/apps/types'
import { getVariant, type PlayerVariant } from '@/lib/lesson-player/variants'
import {
  LESSON_STEPS,
  STATE_RULES,
  isRequired,
  type LessonStep,
  type LessonStepNumber,
  type SupportLanguage,
} from '@/lib/lesson-player/spec'
import { SAMPLE_LESSON, type SampleLesson } from '@/lib/lesson-player/content'
import type { DataSource } from '@/lib/use-eilps'
import { fetchLessonById, lessonIdFromLocation } from '@/lib/lesson-adapter'
import {
  completeLesson,
  recordAttempts,
  recordTime,
  type ProgressWriteResult,
} from '@/lib/progress-adapter'
import {
  clientSubmissionId,
  completeVerifiedLesson,
  fetchActivity,
  savePhraseToReview,
  screensForStep,
  submitActivity,
  type Activity,
  type ActivityScreen,
  type Evidence,
  type Submission,
} from '@/lib/activity-adapter'

/**
 * Headless 15-step lesson engine. Every visual player shell (junior, adult,
 * teacher, tutor, school, studio) consumes this hook so the pedagogical rules —
 * the spec's locking model, required/optional steps, scoring, and completion
 * gate — are identical across all of them. Only the chrome differs.
 *
 * Locking is enforced only in `learn` mode. Preview / QA / author modes unlock
 * every step for free navigation, matching how those roles actually use the
 * player (reviewing, assigning, auditing, authoring).
 */
export type LessonEngine = {
  app: AccountApp
  variant: PlayerVariant
  accent: AccentToken
  a: AccentClasses
  lesson: SampleLesson
  source: DataSource
  /** Outcome of the live completion write, once step 15 is finished. */
  saveResult: ProgressWriteResult | null

  /** The nine server-scored screens for this lesson, when the activity loaded. */
  activity: Activity | null
  activityScreens: ActivityScreen[]
  evidence: Record<string, Evidence>
  setEvidence: (screenId: string, evidence: Evidence) => void
  savePhrase: (screenId: string, phrase: string) => void
  savingPhrase: boolean
  /** Server verdict for the submitted evidence, available on the completion screen. */
  submission: Submission | null
  submitting: boolean

  steps: LessonStep[]
  current: LessonStepNumber
  activeStep: LessonStep
  completed: Set<LessonStepNumber>
  finished: boolean

  supportLanguage: SupportLanguage
  setSupportLanguage: (l: SupportLanguage) => void

  lockingEnabled: boolean
  isUnlocked: (step: LessonStepNumber) => boolean
  isRequired: (step: LessonStepNumber) => boolean

  requiredTotal: number
  requiredDone: number
  progress: number
  score: number
  stars: number
  mastery: number

  goTo: (step: LessonStepNumber) => void
  completeStep: () => void
  restart: () => void
}

export function useLessonEngine(slug: string): LessonEngine {
  const app = getApp(slug)!
  const variant = getVariant(app.slug)
  const a = ACCENT[app.accent]

  // Lesson content comes from the live curriculum. `/learner?lesson=:id` is
  // mapped onto GET /api/curriculum/deep-catalog by the adapter; the sample
  // lesson is only shown if that live request fails.
  const [lesson, setLesson] = useState<SampleLesson>(SAMPLE_LESSON)
  const [source, setSource] = useState<DataSource>('loading')

  const [activity, setActivity] = useState<Activity | null>(null)
  const [evidence, setEvidenceState] = useState<Record<string, Evidence>>({})
  const [savingPhrase, setSavingPhrase] = useState(false)
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchLessonById(lessonIdFromLocation())
      .then((result) => {
        if (cancelled) return
        setLesson(result.lesson)
        setSource('live')
        // The scored activity is a separate document from the lesson content.
        // A lesson can render without it, so a failure here is not fatal.
        return fetchActivity(result.lessonId)
          .then((a) => {
            if (!cancelled) setActivity(a)
          })
          .catch(() => undefined)
      })
      .catch(() => {
        if (cancelled) return
        setLesson(SAMPLE_LESSON)
        setSource('sample')
      })
    return () => {
      cancelled = true
    }
  }, [])

  function setEvidence(screenId: string, next: Evidence) {
    setEvidenceState((prev) => ({ ...prev, [screenId]: { ...prev[screenId], ...next } }))
  }

  function savePhrase(screenId: string, phrase: string) {
    const screen = activity?.screens.find((s) => s.screen_id === screenId)
    if (!activity || !screen || savingPhrase) return
    setSavingPhrase(true)
    savePhraseToReview(activity, screen, phrase)
      .then((itemId) => {
        if (itemId) setEvidence(screenId, { savedReviewItemId: itemId })
      })
      .finally(() => setSavingPhrase(false))
  }

  const [current, setCurrent] = useState<LessonStepNumber>(1)
  const [completed, setCompleted] = useState<Set<LessonStepNumber>>(new Set())
  const [supportLanguage, setSupportLanguage] = useState<SupportLanguage>('en')
  const [finished, setFinished] = useState(false)
  const [saveResult, setSaveResult] = useState<ProgressWriteResult | null>(null)
  const [startedAt] = useState(() => Date.now())

  const lockingEnabled = variant.mode === 'learn'

  const requiredTotal = STATE_RULES.requiredSteps.length
  const requiredDone = STATE_RULES.requiredSteps.filter((s) => completed.has(s)).length
  const progress = Math.round((requiredDone / requiredTotal) * 100)
  const score = Math.min(100, 60 + requiredDone * 3)
  const stars = progress >= 100 ? 3 : progress >= 66 ? 2 : progress >= 33 ? 1 : 0
  const mastery = Math.min(100, 55 + requiredDone * 3)

  function isUnlocked(step: LessonStepNumber): boolean {
    if (!lockingEnabled) return true
    if (completed.has(step)) return true
    if (!isRequired(step)) return true
    const priorRequired = STATE_RULES.requiredSteps.filter((s) => s < step)
    return priorRequired.every((s) => completed.has(s))
  }

  const activeStep = useMemo(() => LESSON_STEPS.find((s) => s.step === current)!, [current])

  function goTo(step: LessonStepNumber) {
    if (!isUnlocked(step)) return
    setFinished(false)
    setCurrent(step)
  }

  function completeStep() {
    setCompleted((prev) => new Set(prev).add(current))

    // Every completed step is a real attempt against the adaptive engine.
    if (source === 'live' && variant.mode === 'learn') {
      void recordAttempts([
        {
          lessonId: lesson.lessonId,
          exerciseId: `${lesson.lessonId}-step${current}`,
          correct: true,
          responseMs: Math.max(1000, Date.now() - startedAt),
        },
      ])
    }

    if (current === 15) {
      setFinished(true)
      if (source === 'live' && variant.mode === 'learn') {
        const seconds = Math.round((Date.now() - startedAt) / 1000)
        void recordTime(lesson.lessonId, seconds)
        void finishLesson()
      }
      return
    }
    setCurrent((c) => (c + 1) as LessonStepNumber)
  }

  /**
   * Completion for a canonical lesson is the two-call verified chain: the
   * server scores the collected evidence, then that submission id unlocks
   * progress. Only lessons with no scored activity fall back to the older
   * single-call route.
   */
  async function finishLesson() {
    if (!activity) {
      setSaveResult(await completeLesson(lesson.lessonId, score / 100))
      return
    }
    setSubmitting(true)
    try {
      const submitted = await submitActivity(
        activity,
        evidence,
        clientSubmissionId(activity.lesson_id, startedAt),
      )
      if (!submitted.ok) {
        setSaveResult({ ok: false, status: submitted.status, reason: submitted.reason })
        return
      }
      setSubmission(submitted.submission)
      const done = await completeVerifiedLesson(activity.lesson_id, submitted.submission.id)
      setSaveResult({ ok: done.ok, status: done.status, reason: done.reason })
    } finally {
      setSubmitting(false)
    }
  }

  function restart() {
    setCompleted(new Set())
    setCurrent(1)
    setFinished(false)
    setEvidenceState({})
    setSubmission(null)
    setSaveResult(null)
  }

  return {
    app,
    variant,
    accent: app.accent,
    a,
    lesson,
    source,
    saveResult,
    activity,
    activityScreens: screensForStep(activity, current),
    evidence,
    setEvidence,
    savePhrase,
    savingPhrase,
    submission,
    submitting,
    steps: LESSON_STEPS,
    current,
    activeStep,
    completed,
    finished,
    supportLanguage,
    setSupportLanguage,
    lockingEnabled,
    isUnlocked,
    isRequired,
    requiredTotal,
    requiredDone,
    progress,
    score,
    stars,
    mastery,
    goTo,
    completeStep,
    restart,
  }
}

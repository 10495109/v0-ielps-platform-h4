'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Lock,
  Check,
  ChevronLeft,
  Clock,
  Star,
  Trophy,
  Volume2,
  Info,
} from 'lucide-react'
import { getApp } from '@/lib/apps'
import { ACCENT } from '@/lib/apps/accent'
import { SHOW_ENDPOINT_LABELS } from '@/lib/developer-surface'
import { getVariant } from '@/lib/lesson-player/variants'
import {
  LESSON_STEPS,
  STATE_RULES,
  isRequired,
  type LessonStepNumber,
  type SupportLanguage,
} from '@/lib/lesson-player/spec'
// SAMPLE_LESSON is deliberately NOT imported here. A live lesson is built from
// the catalogue and the 15-stage engine only; demonstration content has no path
// into this screen.
import { parseEngine15, type LessonEngine15 } from '@/lib/lesson-player/engine'
import { useEilps } from '@/lib/use-eilps'
import { SourceBadge } from '@/components/app/source-badge'
import { StepScreen } from './step-screens'
import { CompletionScreen } from './completion'
import type { PlayableActivity, ServerSubmission } from './verified-activity-runner'
import { progressApi } from '@/lib/adapters'

/**
 * What the catalogue tells us about this lesson. Identity only — the teaching
 * content comes from the 15-stage engine, and neither has a sample fallback.
 */
export type LessonIdentity = {
  lessonId: string
  title: string
  level: string
  topic: string
  intro: string
  timeEstimate: string
  outcomes: { canDo: string; speaking: string; review: string; aims: string[] }
}

const EMPTY_IDENTITY: LessonIdentity = {
  lessonId: '',
  title: '',
  level: '',
  topic: '',
  intro: '',
  timeEstimate: '',
  outcomes: { canDo: '', speaking: '', review: '', aims: [] },
}

/**
 * Shared 15-step lesson player. One engine, adapted per account type via the
 * player variant. Enforces the spec's locking model: future required steps are
 * locked until the current required step completes; completed steps can be
 * revisited; step 15 saves completion and unlocks the next lesson.
 */
export function LessonPlayer({ slug }: { slug: string }) {
  const app = getApp(slug)!
  const variant = getVariant(app.slug)
  const a = ACCENT[app.accent]

  const [lessonId] = useState(() =>
    typeof window === 'undefined'
      ? 'a1d01l1'
      : new URLSearchParams(window.location.search).get('lesson') || 'a1d01l1',
  )

  // The backend remains authoritative. The adapter fills the approved visual
  // model without replacing the canonical lesson, adaptive or scoring data.
  const { data: lesson, source } = useEilps<LessonIdentity>(
    '/api/curriculum/deep-catalog',
    EMPTY_IDENTITY,
    (raw) => {
      const root = (raw ?? {}) as Record<string, unknown>
      const levels = Array.isArray(root.levels) ? root.levels : []
      const catalogueLessons = levels.flatMap((level) => {
        const levelRecord = (level ?? {}) as Record<string, unknown>
        const units = Array.isArray(levelRecord.units) ? levelRecord.units : []
        return units.flatMap((unit) => {
          const unitRecord = (unit ?? {}) as Record<string, unknown>
          return Array.isArray(unitRecord.lessons) ? unitRecord.lessons : []
        })
      })
      const selected = catalogueLessons.find((item) => {
        const candidate = (item ?? {}) as Record<string, unknown>
        return String(candidate.id || '') === lessonId
      })
      const record = ((selected || root.lesson || root.preview) ?? {}) as Record<string, unknown>
      if (!record.id) throw new Error('lesson_not_found')
      const body = (record.body ?? record) as Record<string, unknown>
      const canDo = Array.isArray(body.canDo) ? body.canDo.map(String) : []
      const objectives = Array.isArray(body.objectives) ? body.objectives.map(String) : []
      // Server fields only. Nothing is spread in from SAMPLE_LESSON: a live
      // lesson must never inherit vocabulary, grammar, models, mistakes,
      // practice, checks, review or a next lesson from demonstration content.
      // Anything the server did not send stays empty and is labelled on screen.
      return {
        lessonId: String(record.id || body.id || lessonId),
        title: String(record.title || body.title || ''),
        level: String(record.level || body.level || '') as LessonIdentity['level'],
        topic: String(record.unit_title || body.unitTitle || body.unitFocus || ''),
        intro: String(body.lessonAim || canDo[0] || ''),
        timeEstimate: String(body.timeEstimate || record.time_estimate || ''),
        outcomes: {
          canDo: String(body.cefrCanDo || canDo[0] || ''),
          speaking: String(canDo[1] || ''),
          review: String(Array.isArray(body.progressCriteria) ? body.progressCriteria[0] ?? '' : ''),
          aims: objectives,
        },
      }
    },
  )

  // The real 15-stage engine. The approved player is populated from this
  // contract rather than merely declaring it in adapter metadata. A 200 whose
  // shape does not match is an error, so the screen says Unavailable instead of
  // inventing content.
  const { data: engine, source: engineSource } = useEilps<LessonEngine15 | null>(
    `/api/lesson-support/lessons/${lessonId}/engine-15`,
    null,
    parseEngine15,
  )

  // The next lesson is the server's decision, never a value carried in content.
  const [nextLessonId, setNextLessonId] = useState<string | null>(null)

  const [current, setCurrent] = useState<LessonStepNumber>(1)
  const [completed, setCompleted] = useState<Set<LessonStepNumber>>(new Set())
  const [supportLanguage, setSupportLanguage] = useState<SupportLanguage>('en')
  const [finished, setFinished] = useState(false)
  const [submission, setSubmission] = useState<ServerSubmission | null>(null)
  const [completionError, setCompletionError] = useState<string>()

  const { data: activity, source: activitySource } = useEilps<PlayableActivity | null>(
    `/api/resources/starfall-splashlearn/lessons/${lessonId}`,
    null,
    (raw) => {
      const root = (raw || {}) as Record<string, unknown>
      const value = (root.activity || root) as PlayableActivity
      if (!value.lesson_id || !Array.isArray(value.screens)) throw new Error('invalid_activity_contract')
      return value
    },
  )

  const requiredTotal = STATE_RULES.requiredSteps.length
  const requiredDone = STATE_RULES.requiredSteps.filter((s) => completed.has(s)).length
  const progress = Math.round((requiredDone / requiredTotal) * 100)
  const score = submission ? Math.round(submission.score) : 0
  const stars = submission?.stars || 0
  const accuracy = submission ? Math.round(submission.accuracy * 100) : 0

  /** A step is unlocked if it's completed, current, non-required, or the next required after all prior required are done. */
  function isUnlocked(step: LessonStepNumber): boolean {
    if (completed.has(step)) return true
    if (!isRequired(step)) return true
    const priorRequired = STATE_RULES.requiredSteps.filter((s) => s < step)
    return priorRequired.every((s) => completed.has(s))
  }

  const activeStep = useMemo(() => LESSON_STEPS.find((s) => s.step === current)!, [current])

  async function completeStep() {
    setCompletionError(undefined)
    if (current === 14 && !submission) {
      setCompletionError('Complete the server-marked activity before continuing.')
      return
    }
    if (current === 15) {
      if (!submission?.id) {
        setCompletionError('A verified submission is required before this lesson can be completed.')
        return
      }
      try {
        await progressApi.completeLesson({ lessonId, accuracy: submission.accuracy, submissionId: submission.id })
        setCompleted((previous) => new Set(previous).add(15))
        setFinished(true)
        // The continuation is server-assigned. Nothing here guesses it.
        try {
          const raw = (await progressApi.next()) as Record<string, unknown>
          const candidate =
            (raw?.nextLesson as Record<string, unknown> | undefined)?.id ??
            (raw?.lesson as Record<string, unknown> | undefined)?.id ??
            raw?.lessonId ??
            raw?.nextLessonId
          setNextLessonId(candidate ? String(candidate) : null)
        } catch {
          setNextLessonId(null)
        }
      } catch (caught) {
        setCompletionError(caught instanceof Error ? caught.message : 'Progress could not be saved.')
      }
      return
    }
    setCompleted((prev) => {
      const nextSet = new Set(prev).add(current)
      return nextSet
    })
    const next = (current + 1) as LessonStepNumber
    setCurrent(next)
  }

  function restart() {
    setCompleted(new Set())
    setCurrent(1)
    setFinished(false)
    setSubmission(null)
    setCompletionError(undefined)
  }

  // The approved player is a 15-stage experience. Without the 15-stage engine
  // there is no lesson to show, so the engine's state gates the screen exactly
  // as the catalogue's does. Whichever is not live is the one reported.
  const blocking = source !== 'live' ? source : engineSource !== 'live' ? engineSource : null
  if (blocking) {
    const source = blocking
    const message: Partial<Record<typeof source, string>> = {
      loading: 'Loading this lesson from IELPS…',
      authentication: 'Sign in to open this lesson.',
      entitlement: 'This lesson requires an active curriculum entitlement.',
      permission: 'This account cannot open this lesson.',
      admin: 'This lesson is not available with an administrator-only session.',
      provider: 'A required lesson provider is not configured.',
      empty: 'This lesson has no published content.',
      unavailable: 'The lesson service is unavailable.',
      not_implemented: 'The canonical lesson source was not found.',
      sample: 'Demonstration content is not used for operational lessons.',
    }
    if (source === 'entitlement') {
      message.entitlement =
        'This lesson is behind the trial or membership gate, so the 15-stage engine is not released to this account yet.'
    }
    return (
      <div className="min-h-screen bg-background p-4 sm:p-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h1 className="font-display text-xl font-semibold text-foreground">IELPS lesson player</h1>
            <SourceBadge source={source} />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{message[source] || 'This lesson cannot be displayed.'}</p>
          <Link href={`/app/${app.slug}/dashboard`} className={`mt-6 inline-flex rounded-full px-5 py-2.5 text-sm font-semibold ${a.solid}`}>Return to dashboard</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <Link
            href={`/app/${app.slug}/dashboard`}
            className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-soft"
          >
            <ChevronLeft className="size-3.5" /> Dashboard
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${a.solid}`}>{lesson.level}</span>
              <h1 className="truncate text-sm font-semibold text-foreground">{lesson.title}</h1>
              <SourceBadge source={source} />
            </div>
            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Clock className="size-3" /> {lesson.timeEstimate}</span>
              <span className="inline-flex items-center gap-1"><Star className="size-3" /> {stars}/3</span>
              <span className="inline-flex items-center gap-1"><Trophy className="size-3" /> {score} pts</span>
              <span className="inline-flex items-center gap-1"><Volume2 className="size-3" /> play/pause</span>
            </div>
          </div>
          <div className="hidden sm:flex sm:flex-col sm:items-end">
            <span className="text-xs font-medium text-muted-foreground">{progress}% complete</span>
            <div className="mt-1 h-1.5 w-32 overflow-hidden rounded-full bg-border">
              <div className={`h-full transition-all ${a.dot}`} style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </header>

      {/* Context banner */}
      <div className={`border-b border-border ${a.soft}`}>
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2 text-xs font-medium">
          <Info className="size-3.5 shrink-0" />
          <span className="text-pretty">{variant.contextBanner}</span>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[220px_1fr]">
        {/* Step rail */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <ol className="flex gap-1.5 overflow-x-auto pb-2 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0">
            {LESSON_STEPS.map((s) => {
              const unlocked = isUnlocked(s.step)
              const done = completed.has(s.step)
              const isCurrent = s.step === current && !finished
              return (
                <li key={s.step} className="shrink-0">
                  <button
                    type="button"
                    disabled={!unlocked}
                    onClick={() => unlocked && (setFinished(false), setCurrent(s.step))}
                    className={[
                      'flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs transition-colors',
                      isCurrent
                        ? `${a.soft} font-semibold`
                        : unlocked
                          ? 'hover:bg-soft'
                          : 'cursor-not-allowed opacity-50',
                    ].join(' ')}
                  >
                    <span
                      className={[
                        'grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-bold',
                        done ? 'bg-success text-primary-foreground' : isCurrent ? a.solid : 'bg-soft text-muted-foreground',
                      ].join(' ')}
                    >
                      {done ? <Check className="size-3.5" /> : !unlocked ? <Lock className="size-3" /> : s.step}
                    </span>
                    <span className="hidden min-w-0 lg:block">
                      <span className="block truncate text-foreground">{s.title}</span>
                      {isRequired(s.step) ? null : (
                        <span className="block text-[10px] text-muted-foreground">optional</span>
                      )}
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
        </aside>

        {/* Main panel */}
        <main className="min-w-0">
          {finished ? (
            <>
              <CompletionScreen
                slug={app.slug}
                nextLessonId={nextLessonId}
                accent={app.accent}
                score={score}
                stars={stars}
                mastery={accuracy}
                certificateEligible={progress >= 100}
                onNextLesson={restart}
              />
            </>
          ) : (
            <div className="rounded-3xl border border-border bg-card p-5 sm:p-7">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Step {activeStep.step} of 15 · {isRequired(activeStep.step) ? 'Required' : 'Optional'}
                </span>
                <span className="hidden text-[11px] text-muted-foreground sm:block">{activeStep.stateRule}</span>
              </div>
              <StepScreen
                step={activeStep}
                lesson={lesson}
                engine={engine}
                accent={app.accent}
                juniorReadability={variant.juniorReadability}
                aiHelpEnabled={variant.aiHelpEnabled}
                supportLanguage={supportLanguage}
                setSupportLanguage={setSupportLanguage}
                onDone={completeStep}
                activity={activity}
                activitySource={activitySource}
                submission={submission}
                onVerified={(value) => {
                  setSubmission(value)
                  setCompleted((previous) => new Set(previous).add(14))
                  setCurrent(15)
                }}
              />
              {completionError ? <p role="alert" className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-foreground">{completionError}</p> : null}
              {/* Endpoint wiring for this step. Hidden from the learner from
                  18 August 2026 by the conformance correction — a learner in a
                  lesson should not be reading the routes the step calls. The
                  step still calls exactly the same ones. */}
              {SHOW_ENDPOINT_LABELS && (
                <div className="mt-6 flex flex-wrap gap-1.5 border-t border-border pt-4">
                  {activeStep.endpoints.map((e) => (
                    <span
                      key={`${e.method}${e.path}`}
                      className="inline-flex items-center gap-1.5 rounded-md bg-soft px-2 py-1 font-mono text-[11px] text-muted-foreground"
                    >
                      <span className={`font-semibold ${a.text}`}>{e.method}</span>
                      {e.path}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

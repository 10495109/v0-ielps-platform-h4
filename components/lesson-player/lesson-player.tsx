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
import { getVariant } from '@/lib/lesson-player/variants'
import {
  LESSON_STEPS,
  STATE_RULES,
  isRequired,
  type LessonStepNumber,
  type SupportLanguage,
} from '@/lib/lesson-player/spec'
import { SAMPLE_LESSON } from '@/lib/lesson-player/content'
import { useEilps } from '@/lib/use-eilps'
import { SourceBadge } from '@/components/app/source-badge'
import { StepScreen } from './step-screens'
import { CompletionScreen } from './completion'

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

  // Live lesson hydration (falls back to the sample lesson).
  const lessonId = SAMPLE_LESSON.lessonId
  const { source } = useEilps(`/api/lessons/${lessonId}`, SAMPLE_LESSON, (raw) => {
    const o = (raw ?? {}) as Record<string, unknown>
    if (!o || typeof o !== 'object' || Array.isArray(o)) throw new Error('bad')
    return {
      ...SAMPLE_LESSON,
      title: typeof o.title === 'string' ? o.title : SAMPLE_LESSON.title,
      level: (o.level as typeof SAMPLE_LESSON.level) ?? SAMPLE_LESSON.level,
    }
  })
  const lesson = SAMPLE_LESSON

  const [current, setCurrent] = useState<LessonStepNumber>(1)
  const [completed, setCompleted] = useState<Set<LessonStepNumber>>(new Set())
  const [supportLanguage, setSupportLanguage] = useState<SupportLanguage>('en')
  const [finished, setFinished] = useState(false)

  const requiredTotal = STATE_RULES.requiredSteps.length
  const requiredDone = STATE_RULES.requiredSteps.filter((s) => completed.has(s)).length
  const progress = Math.round((requiredDone / requiredTotal) * 100)
  const score = Math.min(100, 60 + requiredDone * 3)
  const stars = progress >= 100 ? 3 : progress >= 66 ? 2 : progress >= 33 ? 1 : 0
  const mastery = Math.min(100, 55 + requiredDone * 3)

  /** A step is unlocked if it's completed, current, non-required, or the next required after all prior required are done. */
  function isUnlocked(step: LessonStepNumber): boolean {
    if (completed.has(step)) return true
    if (!isRequired(step)) return true
    const priorRequired = STATE_RULES.requiredSteps.filter((s) => s < step)
    return priorRequired.every((s) => completed.has(s))
  }

  const activeStep = useMemo(() => LESSON_STEPS.find((s) => s.step === current)!, [current])

  function completeStep() {
    setCompleted((prev) => {
      const nextSet = new Set(prev).add(current)
      return nextSet
    })
    if (current === 15) {
      setFinished(true)
      return
    }
    const next = (current + 1) as LessonStepNumber
    setCurrent(next)
  }

  function restart() {
    setCompleted(new Set())
    setCurrent(1)
    setFinished(false)
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
                lesson={lesson}
                accent={app.accent}
                score={score}
                stars={stars}
                mastery={mastery}
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
                accent={app.accent}
                juniorReadability={variant.juniorReadability}
                aiHelpEnabled={variant.aiHelpEnabled}
                supportLanguage={supportLanguage}
                setSupportLanguage={setSupportLanguage}
                onDone={completeStep}
              />
              {/* Endpoint wiring for this step */}
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
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

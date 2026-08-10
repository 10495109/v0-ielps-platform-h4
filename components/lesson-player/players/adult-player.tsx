'use client'

import Link from 'next/link'
import { ChevronLeft, Check, Lock, Clock } from 'lucide-react'
import { useLessonEngine } from '../use-lesson-engine'
import { StepScreen } from '../step-screens'
import { ActivityStep } from '../activity-step'
import { CompletionScreen } from '../completion'
import { SourceBadge } from '@/components/app/source-badge'

/**
 * Adult player — "Focus". Calm, minimal, distraction-free. A quiet vertical
 * stepper, a circular progress ring, a single narrow reading column, and
 * understated API wiring. Purple (primary) brand accent.
 */
export function AdultPlayer({ slug }: { slug: string }) {
  const e = useLessonEngine(slug)
  const r = 18
  const circ = 2 * Math.PI * r
  const dash = circ - (e.progress / 100) * circ

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-5 py-3">
          <Link
            href={`/app/${slug}/dashboard`}
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="size-4" /> Dashboard
          </Link>
          <div className="min-w-0 flex-1 text-center">
            <h1 className="truncate text-sm font-medium text-foreground">{e.lesson.title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <SourceBadge source={e.source} />
            <svg viewBox="0 0 44 44" className="size-9 -rotate-90" aria-label={`${e.progress}% complete`}>
              <circle cx="22" cy="22" r={r} fill="none" stroke="var(--color-border)" strokeWidth="4" />
              <circle
                cx="22" cy="22" r={r} fill="none" stroke="var(--color-primary)" strokeWidth="4"
                strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={dash}
                className="transition-all duration-500"
              />
            </svg>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-10 px-5 py-10 lg:grid-cols-[240px_1fr]">
        {/* Quiet vertical stepper */}
        <aside className="hidden lg:block lg:sticky lg:top-24 lg:self-start">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {e.requiredDone}/{e.requiredTotal} required
          </p>
          <ol className="relative flex flex-col gap-0.5 border-l border-border pl-0">
            {e.steps.map((s, i) => {
              const done = e.completed.has(s.step)
              const unlocked = e.isUnlocked(s.step)
              const isCurrent = s.step === e.current && !e.finished
              return (
                <li
                  key={s.step}
                  className="stagger-item relative"
                  style={{ '--stagger': `${i * 30}ms` } as React.CSSProperties}
                >
                  <button
                    type="button"
                    disabled={!unlocked}
                    onClick={() => e.goTo(s.step)}
                    className={[
                      '-ml-px flex w-full items-center gap-3 border-l-2 py-1.5 pl-4 text-left text-sm transition-colors',
                      isCurrent
                        ? 'border-primary font-medium text-foreground'
                        : done
                          ? 'border-transparent text-muted-foreground hover:text-foreground'
                          : unlocked
                            ? 'border-transparent text-muted-foreground hover:text-foreground'
                            : 'border-transparent text-muted-foreground/50',
                    ].join(' ')}
                  >
                    <span
                      className={[
                        'grid size-5 shrink-0 place-items-center rounded-full text-[10px] font-bold',
                        done ? 'bg-primary text-primary-foreground' : isCurrent ? 'bg-primary/15 text-primary' : 'text-muted-foreground',
                      ].join(' ')}
                    >
                      {done ? <Check className="size-3" /> : !unlocked ? <Lock className="size-2.5" /> : s.step}
                    </span>
                    <span className="truncate">{s.title}</span>
                    {!e.isRequired(s.step) ? <span className="ml-auto text-[10px] text-muted-foreground/70">optional</span> : null}
                  </button>
                </li>
              )
            })}
          </ol>
        </aside>

        <main className="min-w-0">
          {e.finished ? (
            <CompletionScreen
              slug={slug}
              lesson={e.lesson}
              accent={e.accent}
              score={e.score}
              stars={e.stars}
              mastery={e.mastery}
              certificateEligible={e.progress >= 100}
              onNextLesson={e.restart}
              saveResult={e.saveResult}
              submission={e.submission}
            />
          ) : (
            <div key={e.current} className="animate-slide-up-fade mx-auto max-w-2xl">
              <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
                <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                  Step {e.activeStep.step} · {e.isRequired(e.activeStep.step) ? 'Required' : 'Optional'}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="size-3" /> {e.lesson.timeEstimate}
                </span>
              </div>
              {e.activityScreens.length ? (
                <ActivityStep e={e} />
              ) : (
                <StepScreen
                  step={e.activeStep}
                  lesson={e.lesson}
                  accent={e.accent}
                  juniorReadability={false}
                  aiHelpEnabled={e.variant.aiHelpEnabled}
                  supportLanguage={e.supportLanguage}
                  setSupportLanguage={e.setSupportLanguage}
                  onDone={e.completeStep}
                />
              )}
              <p className="mt-10 border-t border-border pt-4 font-mono text-[11px] leading-relaxed text-muted-foreground/70">
                {e.activeStep.endpoints.map((ep) => `${ep.method} ${ep.path}`).join('   ·   ')}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { Home, Lock, Star, Sparkles, Trophy, Volume2 } from 'lucide-react'
import { useLessonEngine } from '../use-lesson-engine'
import { StepScreen } from '../step-screens'
import { ActivityStep } from '../activity-step'
import { CompletionScreen } from '../completion'

/**
 * Junior player — "Adventure Trail". Big tap targets, a winding trail of
 * stepping-stone nodes, playful bounce/scale interactions, and grown-up API
 * detail tucked away. Turquoise + gold brand accents.
 */
export function JuniorPlayer({ slug }: { slug: string }) {
  const e = useLessonEngine(slug)

  return (
    <div className="min-h-screen bg-accent/5">
      {/* Playful top bar */}
      <header className="border-b-2 border-accent/20 bg-card">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-4">
          <Link
            href={`/app/${slug}/dashboard`}
            aria-label="Back to dashboard"
            className="grid size-11 shrink-0 place-items-center rounded-2xl bg-accent text-accent-foreground transition-transform hover:scale-105 active:scale-95"
          >
            <Home className="size-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-lg font-bold text-foreground">{e.lesson.title}</h1>
            <p className="text-sm text-muted-foreground">Level {e.lesson.level} · Let&apos;s go on an adventure!</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-gold/20 px-3 py-1.5 text-sm font-bold text-indigo">
              <Star className="size-4 fill-gold text-gold" /> {e.stars}
            </span>
            <span className="hidden items-center gap-1 rounded-full bg-accent/15 px-3 py-1.5 text-sm font-bold text-accent-foreground sm:inline-flex">
              <Trophy className="size-4" /> {e.score}
            </span>
          </div>
        </div>
      </header>

      {/* Adventure trail */}
      <div className="mx-auto max-w-5xl px-4 pt-6">
        <ol className="flex items-center gap-1 overflow-x-auto pb-3">
          {e.steps.map((s, i) => {
            const done = e.completed.has(s.step)
            const unlocked = e.isUnlocked(s.step)
            const isCurrent = s.step === e.current && !e.finished
            const bonus = !e.isRequired(s.step)
            return (
              <li
                key={s.step}
                className="stagger-pop flex shrink-0 items-center"
                style={{ '--stagger': `${i * 45}ms` } as React.CSSProperties}
              >
                <button
                  type="button"
                  disabled={!unlocked}
                  onClick={() => e.goTo(s.step)}
                  aria-label={`Step ${s.step}: ${s.title}`}
                  className="group relative grid place-items-center"
                >
                  <span
                    className={[
                      'grid size-11 place-items-center rounded-2xl text-sm font-black transition-transform',
                      done
                        ? 'bg-gold text-indigo'
                        : isCurrent
                          ? 'animate-bounce bg-accent text-accent-foreground ring-4 ring-accent/25'
                          : unlocked
                            ? 'bg-card text-foreground ring-2 ring-accent/25 group-hover:scale-105'
                            : 'bg-muted text-muted-foreground opacity-60',
                    ].join(' ')}
                  >
                    {done ? <Star className="size-5 fill-indigo" /> : !unlocked ? <Lock className="size-4" /> : s.step}
                  </span>
                  {bonus ? (
                    <span className="absolute -bottom-4 text-[10px] font-bold text-gold">bonus</span>
                  ) : null}
                </button>
                {i < e.steps.length - 1 ? (
                  <span className={`mx-0.5 h-1 w-4 rounded-full ${done ? 'bg-gold' : 'bg-accent/20'}`} />
                ) : null}
              </li>
            )
          })}
        </ol>
      </div>

      <main className="mx-auto max-w-3xl px-4 py-6">
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
            saveResult={e.saveResult} submission={e.submission}
          />
        ) : (
          <>
            <div key={e.current} className="animate-pop-in rounded-[2rem] border-2 border-accent/20 bg-card p-5 shadow-sm sm:p-8">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-bold text-accent-foreground">
                <Sparkles className="size-3.5" /> Step {e.activeStep.step} of 15
                {e.activeStep.allowsAudio ? (
                  <span className="ml-1 inline-flex items-center gap-1 text-muted-foreground">
                    <Volume2 className="size-3.5" /> audio
                  </span>
                ) : null}
              </div>
              {e.activityScreens.length ? (
                <ActivityStep e={e} junior />
              ) : (
                <StepScreen
                  step={e.activeStep}
                  lesson={e.lesson}
                  accent={e.accent}
                  juniorReadability
                  aiHelpEnabled={e.variant.aiHelpEnabled}
                  supportLanguage={e.supportLanguage}
                  setSupportLanguage={e.setSupportLanguage}
                  onDone={e.completeStep}
                />
              )}
            </div>

            {/* Grown-up info, tucked away */}
            <details className="mx-auto mt-4 max-w-2xl rounded-2xl border border-border bg-card/60 px-4 py-3 text-xs">
              <summary className="cursor-pointer font-semibold text-muted-foreground">For grown-ups: how this step connects</summary>
              <p className="mt-2 text-muted-foreground">{e.activeStep.stateRule}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {e.activeStep.endpoints.map((ep) => (
                  <span key={`${ep.method}${ep.path}`} className="rounded-md bg-soft px-2 py-1 font-mono text-[11px] text-muted-foreground">
                    <span className="font-semibold text-accent-foreground">{ep.method}</span> {ep.path}
                  </span>
                ))}
              </div>
            </details>
          </>
        )}
      </main>
    </div>
  )
}

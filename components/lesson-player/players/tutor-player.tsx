'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Check, PhoneOff, Mic, Video, Radio, Bell } from 'lucide-react'
import { useLessonEngine } from '../use-lesson-engine'
import { StepScreen } from '../step-screens'
import { CompletionScreen } from '../completion'

function useSessionClock() {
  const [s, setS] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setS((v) => v + 1), 1000)
    return () => clearInterval(id)
  }, [])
  const mm = String(Math.floor(s / 60)).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  return `${mm}:${ss}`
}

/**
 * Tutor player — "Live Session". A 1:1 co-presence cockpit: a learner presence
 * rail with a running session clock and shared notes, a "nudge to this step"
 * action, and a persistent session dock. Blue (secondary) brand accent.
 */
export function TutorPlayer({ slug }: { slug: string }) {
  const e = useLessonEngine(slug)
  const clock = useSessionClock()
  const [notes, setNotes] = useState('')
  const [nudged, setNudged] = useState<number | null>(null)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link href={`/app/${slug}/dashboard`} className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ChevronLeft className="size-4" /> Dashboard
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/10 px-2.5 py-1 text-xs font-bold text-secondary">
            <Radio className="size-3.5 animate-pulse" /> LIVE SESSION
          </span>
          <h1 className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">{e.lesson.title}</h1>
          <span className="font-mono text-sm font-semibold text-foreground tabular-nums">{clock}</span>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-6xl flex-1 gap-5 px-4 py-6 lg:grid-cols-[280px_1fr]">
        {/* Learner presence rail */}
        <aside className="animate-rise flex flex-col gap-4">
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-full bg-secondary text-lg font-bold text-secondary-foreground">M</span>
              <div>
                <p className="text-sm font-semibold text-foreground">Maria S.</p>
                <p className="inline-flex items-center gap-1 text-xs text-secondary">
                  <span className="size-1.5 rounded-full bg-secondary" /> In session · Level {e.lesson.level}
                </p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-center">
              <div className="rounded-lg bg-soft p-2">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Progress</p>
                <p className="text-sm font-bold text-foreground">{e.progress}%</p>
              </div>
              <div className="rounded-lg bg-soft p-2">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Step</p>
                <p className="text-sm font-bold text-foreground">{e.current}/15</p>
              </div>
            </div>
          </div>

          {/* Agenda */}
          <div className="rounded-2xl border border-border bg-card p-3">
            <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Session agenda</p>
            <ol className="flex max-h-64 flex-col gap-0.5 overflow-y-auto">
              {e.steps.map((s, i) => {
                const done = e.completed.has(s.step)
                const isCurrent = s.step === e.current && !e.finished
                return (
                  <li key={s.step} className="stagger-item" style={{ '--stagger': `${i * 25}ms` } as React.CSSProperties}>
                    <button
                      type="button"
                      onClick={() => e.goTo(s.step)}
                      className={['flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors', isCurrent ? 'bg-secondary/10 font-semibold text-secondary' : 'text-muted-foreground hover:bg-soft'].join(' ')}
                    >
                      <span className={`grid size-5 shrink-0 place-items-center rounded-full text-[10px] font-bold ${done ? 'bg-secondary text-secondary-foreground' : isCurrent ? 'bg-secondary/20 text-secondary' : 'bg-soft'}`}>
                        {done ? <Check className="size-3" /> : s.step}
                      </span>
                      <span className="truncate">{s.title}</span>
                    </button>
                  </li>
                )
              })}
            </ol>
          </div>

          {/* Shared notes */}
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Shared notes</p>
            <textarea value={notes} onChange={(ev) => setNotes(ev.target.value)} rows={3} placeholder="Notes both of you can see…" className="w-full resize-none rounded-lg border border-border bg-background px-2.5 py-2 text-sm text-foreground" />
          </div>
        </aside>

        <main className="min-w-0">
          {e.finished ? (
            <CompletionScreen slug={slug} lesson={e.lesson} accent={e.accent} score={e.score} stars={e.stars} mastery={e.mastery} certificateEligible={e.progress >= 100} onNextLesson={e.restart} saveResult={e.saveResult} />
          ) : (
            <div key={e.current} className="animate-slide-in-right rounded-2xl border border-border bg-card p-5 sm:p-7">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2 text-xs">
                  <span className="rounded-full bg-secondary/10 px-2.5 py-1 font-semibold text-secondary">Step {e.activeStep.step}/15</span>
                  <span className="text-muted-foreground">{e.isRequired(e.activeStep.step) ? 'Required' : 'Optional'}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setNudged(e.current)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-secondary/40 px-3 py-1.5 text-xs font-semibold text-secondary transition-colors hover:bg-secondary/10"
                >
                  <Bell className="size-3.5" /> {nudged === e.current ? 'Nudged to learner' : 'Nudge learner here'}
                </button>
              </div>
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
            </div>
          )}
        </main>
      </div>

      {/* Persistent session dock */}
      <footer className="sticky bottom-0 border-t border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5">
          <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <span className="size-2 animate-pulse rounded-full bg-secondary" /> Connected · {clock}
          </span>
          <div className="flex items-center gap-2">
            <button type="button" aria-label="Toggle mic" className="grid size-9 place-items-center rounded-full border border-border text-foreground hover:bg-soft"><Mic className="size-4" /></button>
            <button type="button" aria-label="Toggle camera" className="grid size-9 place-items-center rounded-full border border-border text-foreground hover:bg-soft"><Video className="size-4" /></button>
            <Link href={`/app/${slug}/dashboard`} className="inline-flex items-center gap-1.5 rounded-full bg-destructive px-4 py-2 text-xs font-semibold text-primary-foreground">
              <PhoneOff className="size-4" /> End session
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

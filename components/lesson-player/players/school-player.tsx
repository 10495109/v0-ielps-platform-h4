'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ShieldCheck, CircleCheck, Flag, CircleDashed, FileDown } from 'lucide-react'
import { useLessonEngine } from '../use-lesson-engine'
import { StepScreen } from '../step-screens'
import { CompletionScreen } from '../completion'
import type { LessonStepNumber } from '@/lib/lesson-player/spec'

type QaStatus = 'pending' | 'pass' | 'flag'

/**
 * School player — "QA Console". An institutional audit surface: a dense step
 * list with per-step QA status, the lesson rendered for inspection, and a
 * right-hand inspector verifying CEFR alignment, state rules, and backend
 * contracts. Purple (primary) brand accent, tabular + monospace detailing.
 */
export function SchoolPlayer({ slug }: { slug: string }) {
  const e = useLessonEngine(slug)
  const [qa, setQa] = useState<Record<number, QaStatus>>({})

  function setStatus(step: LessonStepNumber, status: QaStatus) {
    setQa((prev) => ({ ...prev, [step]: prev[step] === status ? 'pending' : status }))
  }

  const passed = Object.values(qa).filter((s) => s === 'pass').length
  const flagged = Object.values(qa).filter((s) => s === 'flag').length
  const qaScore = Math.round((passed / 15) * 100)

  return (
    <div className="min-h-screen bg-soft">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-3 px-4 py-3">
          <Link href={`/app/${slug}/dashboard`} className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ChevronLeft className="size-4" /> Console
          </Link>
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>Riverside Academy</span><span>/</span><span>Curriculum QA</span><span>/</span>
            <span className="font-medium text-foreground">{e.lesson.title}</span>
          </nav>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-1 text-xs font-bold uppercase tracking-wide text-primary">
            <ShieldCheck className="size-3.5" /> QA mode
          </span>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Pass <b className="text-foreground">{passed}</b> · Flag <b className="text-foreground">{flagged}</b> · Score <b className="text-primary">{qaScore}%</b></span>
            <button type="button" className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-soft">
              <FileDown className="size-3.5" /> Export report
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1400px] gap-4 px-4 py-5 lg:grid-cols-[300px_1fr_320px]">
        {/* Dense step audit list */}
        <aside className="lg:sticky lg:top-5 lg:self-start">
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="border-b border-border bg-soft px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              15-step audit
            </div>
            <ol className="divide-y divide-border">
              {e.steps.map((s, i) => {
                const status = qa[s.step] ?? 'pending'
                const isCurrent = s.step === e.current && !e.finished
                return (
                  <li key={s.step} className="stagger-item" style={{ '--stagger': `${i * 20}ms` } as React.CSSProperties}>
                    <button
                      type="button"
                      onClick={() => e.goTo(s.step)}
                      className={['flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors', isCurrent ? 'bg-primary/5' : 'hover:bg-soft'].join(' ')}
                    >
                      <span className="w-5 font-mono text-muted-foreground">{String(s.step).padStart(2, '0')}</span>
                      <span className="min-w-0 flex-1 truncate font-medium text-foreground">{s.title}</span>
                      {status === 'pass' ? <CircleCheck className="size-4 text-success" /> : status === 'flag' ? <Flag className="size-4 text-destructive" /> : <CircleDashed className="size-4 text-muted-foreground/50" />}
                    </button>
                  </li>
                )
              })}
            </ol>
          </div>
        </aside>

        {/* Lesson under inspection */}
        <main className="min-w-0">
          {e.finished ? (
            <CompletionScreen slug={slug} lesson={e.lesson} accent={e.accent} score={e.score} stars={e.stars} mastery={e.mastery} certificateEligible={e.progress >= 100} onNextLesson={e.restart} saveResult={e.saveResult} />
          ) : (
            <div key={e.current} className="animate-fade-in rounded-xl border border-border bg-card p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
                <span className="font-mono text-xs text-muted-foreground">STEP {String(e.activeStep.step).padStart(2, '0')} / 15 · {e.isRequired(e.activeStep.step) ? 'REQUIRED' : 'OPTIONAL'}</span>
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

        {/* QA inspector */}
        <aside className="lg:sticky lg:top-5 lg:self-start">
          <div key={e.current} className="animate-fade-in rounded-xl border border-border bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground">QA inspector · step {e.activeStep.step}</h2>

            <dl className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between gap-2 border-b border-border pb-2">
                <dt className="text-muted-foreground">CEFR alignment</dt>
                <dd className="font-medium text-success">{e.lesson.level} · graded</dd>
              </div>
              <div className="flex justify-between gap-2 border-b border-border pb-2">
                <dt className="text-muted-foreground">Requirement</dt>
                <dd className="font-medium text-foreground">{e.isRequired(e.activeStep.step) ? 'Required' : 'Optional'}</dd>
              </div>
              {e.activeStep.minItems ? (
                <div className="flex justify-between gap-2 border-b border-border pb-2">
                  <dt className="text-muted-foreground">Min activities</dt>
                  <dd className="font-mono font-medium text-foreground">{e.activeStep.minItems}</dd>
                </div>
              ) : null}
            </dl>

            <p className="mt-3 rounded-lg bg-soft p-2.5 text-[11px] leading-relaxed text-muted-foreground">
              <b className="text-foreground">State rule:</b> {e.activeStep.stateRule}
            </p>

            <p className="mt-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Backend contracts</p>
            <div className="flex flex-col gap-1 rounded-lg bg-indigo/[0.04] p-2">
              {e.activeStep.endpoints.map((ep) => (
                <code key={`${ep.method}${ep.path}`} className="font-mono text-[11px] text-muted-foreground">
                  <span className="font-semibold text-primary">{ep.method}</span> {ep.path}
                </code>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <button type="button" onClick={() => setStatus(e.activeStep.step, 'pass')} className={['flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors', (qa[e.activeStep.step] ?? 'pending') === 'pass' ? 'bg-success text-primary-foreground' : 'border border-border text-foreground hover:bg-soft'].join(' ')}>
                <CircleCheck className="size-4" /> Pass
              </button>
              <button type="button" onClick={() => setStatus(e.activeStep.step, 'flag')} className={['flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors', (qa[e.activeStep.step] ?? 'pending') === 'flag' ? 'bg-destructive text-primary-foreground' : 'border border-border text-foreground hover:bg-soft'].join(' ')}>
                <Flag className="size-4" /> Flag
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

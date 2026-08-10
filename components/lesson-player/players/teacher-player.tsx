'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Check, Eye, Send, Tag, CalendarDays, Users } from 'lucide-react'
import { useLessonEngine } from '../use-lesson-engine'
import { StepScreen } from '../step-screens'
import { ActivityStep } from '../activity-step'
import { CompletionScreen } from '../completion'

const CLASSES = ['7B · English', '8A · English', '9C · ESL Support']
const STANDARDS = ['CEFR A2', 'Speaking', 'Vocabulary', 'Writing']

/**
 * Teacher player — "Assignment Cockpit". A preview surface framed for assigning:
 * a filmstrip of all 15 steps (free navigation), a "viewing as student" toggle,
 * and a right-hand assignment panel (class, due date, note, standards). Indigo.
 */
export function TeacherPlayer({ slug }: { slug: string }) {
  const e = useLessonEngine(slug)
  const [asStudent, setAsStudent] = useState(false)
  const [klass, setKlass] = useState(CLASSES[0])
  const [note, setNote] = useState('')
  const [tags, setTags] = useState<string[]>(['CEFR A2'])
  const [assigned, setAssigned] = useState(false)

  function toggleTag(t: string) {
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))
  }

  return (
    <div className="min-h-screen bg-soft">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
          <Link href={`/app/${slug}/dashboard`} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ChevronLeft className="size-4" /> Dashboard
          </Link>
          <span className="rounded-md bg-indigo/10 px-2 py-1 text-xs font-bold uppercase tracking-wide text-indigo">Assignment preview</span>
          <h1 className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">{e.lesson.title}</h1>
          <button
            type="button"
            onClick={() => setAsStudent((v) => !v)}
            className={[
              'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors',
              asStudent ? 'border-indigo bg-indigo text-primary-foreground' : 'border-border text-foreground hover:bg-soft',
            ].join(' ')}
          >
            <Eye className="size-3.5" /> {asStudent ? 'Viewing as student' : 'View as student'}
          </button>
        </div>

        {/* Filmstrip of all 15 steps */}
        <div className="mx-auto max-w-6xl overflow-x-auto px-4 pb-3">
          <ol className="flex gap-2">
            {e.steps.map((s, i) => {
              const done = e.completed.has(s.step)
              const isCurrent = s.step === e.current && !e.finished
              return (
                <li key={s.step} className="stagger-item" style={{ '--stagger': `${i * 35}ms` } as React.CSSProperties}>
                  <button
                    type="button"
                    onClick={() => e.goTo(s.step)}
                    className={[
                      'flex w-28 shrink-0 flex-col gap-1 rounded-lg border p-2 text-left transition-colors',
                      isCurrent ? 'border-indigo bg-indigo/5' : 'border-border bg-card hover:border-indigo/40',
                    ].join(' ')}
                  >
                    <span className="flex items-center justify-between">
                      <span className={`grid size-5 place-items-center rounded text-[10px] font-bold ${done ? 'bg-indigo text-primary-foreground' : 'bg-soft text-muted-foreground'}`}>
                        {done ? <Check className="size-3" /> : s.step}
                      </span>
                      {!e.isRequired(s.step) ? <span className="text-[9px] font-semibold uppercase text-muted-foreground">opt</span> : null}
                    </span>
                    <span className="truncate text-[11px] font-medium text-foreground">{s.title}</span>
                  </button>
                </li>
              )
            })}
          </ol>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-5 px-4 py-6 lg:grid-cols-[1fr_300px]">
        <main className="min-w-0">
          {e.finished ? (
            <CompletionScreen slug={slug} lesson={e.lesson} accent={e.accent} score={e.score} stars={e.stars} mastery={e.mastery} certificateEligible={e.progress >= 100} onNextLesson={e.restart} saveResult={e.saveResult} submission={e.submission} />
          ) : (
            <div key={e.current} className="animate-fade-in rounded-2xl border border-border bg-card p-5 sm:p-7">
              <div className="mb-4 flex items-center gap-2 text-xs">
                <span className="rounded-full bg-indigo/10 px-2.5 py-1 font-semibold text-indigo">Step {e.activeStep.step}/15</span>
                <span className="text-muted-foreground">{e.activeStep.stateRule}</span>
              </div>
              {e.activityScreens.length ? (
                <ActivityStep e={e} junior={asStudent && e.app.slug === 'junior'} />
              ) : (
                <StepScreen
                  step={e.activeStep}
                  lesson={e.lesson}
                  accent={e.accent}
                  juniorReadability={asStudent && e.app.slug === 'junior'}
                  aiHelpEnabled={e.variant.aiHelpEnabled}
                  supportLanguage={e.supportLanguage}
                  setSupportLanguage={e.setSupportLanguage}
                  onDone={e.completeStep}
                />
              )}
            </div>
          )}
        </main>

        {/* Assignment panel */}
        <aside className="animate-rise lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Send className="size-4 text-indigo" /> Assign this lesson
            </h2>

            <label className="mt-4 block text-xs font-medium text-muted-foreground">
              <span className="mb-1 flex items-center gap-1.5"><Users className="size-3.5" /> Class</span>
              <select value={klass} onChange={(ev) => setKlass(ev.target.value)} className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-sm text-foreground">
                {CLASSES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>

            <label className="mt-3 block text-xs font-medium text-muted-foreground">
              <span className="mb-1 flex items-center gap-1.5"><CalendarDays className="size-3.5" /> Due date</span>
              <input type="date" className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-sm text-foreground" />
            </label>

            <label className="mt-3 block text-xs font-medium text-muted-foreground">
              <span className="mb-1 block">Note to students</span>
              <textarea value={note} onChange={(ev) => setNote(ev.target.value)} rows={3} placeholder="Optional guidance…" className="w-full resize-none rounded-lg border border-border bg-background px-2.5 py-2 text-sm text-foreground" />
            </label>

            <div className="mt-3">
              <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><Tag className="size-3.5" /> Standards</span>
              <div className="flex flex-wrap gap-1.5">
                {STANDARDS.map((t) => (
                  <button key={t} type="button" onClick={() => toggleTag(t)} className={['rounded-full px-2.5 py-1 text-xs font-medium transition-colors', tags.includes(t) ? 'bg-indigo text-primary-foreground' : 'bg-soft text-muted-foreground hover:text-foreground'].join(' ')}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setAssigned(true)}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              {assigned ? <><Check className="size-4" /> Assigned to {klass}</> : <><Send className="size-4" /> Assign to class</>}
            </button>
          </div>

          <div className="mt-3 rounded-2xl border border-border bg-card p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Step endpoints</p>
            <div className="flex flex-col gap-1">
              {e.activeStep.endpoints.map((ep) => (
                <span key={`${ep.method}${ep.path}`} className="font-mono text-[11px] text-muted-foreground">
                  <span className="font-semibold text-indigo">{ep.method}</span> {ep.path}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

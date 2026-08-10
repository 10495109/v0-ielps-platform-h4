'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Monitor, Smartphone, Rocket, Check, Blocks, Code2 } from 'lucide-react'
import { useLessonEngine } from '../use-lesson-engine'
import { StepScreen } from '../step-screens'
import { CompletionScreen } from '../completion'

/**
 * Studio player — "Authoring IDE". A dark authoring canvas with a block outline
 * tree, a device-framed live preview (viewport toggle), and a schema inspector
 * showing each step's kind, contracts and rules. Gold brand accent on deep
 * indigo canvas.
 */
export function StudioPlayer({ slug }: { slug: string }) {
  const e = useLessonEngine(slug)
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop')
  const [published, setPublished] = useState(false)

  const panel = 'rounded-xl border border-primary-foreground/10 bg-primary-foreground/[0.04]'

  return (
    <div className="min-h-screen bg-indigo text-primary-foreground">
      {/* IDE toolbar */}
      <header className="border-b border-primary-foreground/10">
        <div className="flex flex-wrap items-center gap-3 px-4 py-2.5">
          <Link href={`/app/${slug}/dashboard`} className="inline-flex items-center gap-1 text-sm font-medium text-primary-foreground/70 hover:text-primary-foreground">
            <ChevronLeft className="size-4" /> Studio
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-gold px-2 py-1 text-xs font-bold uppercase tracking-wide text-indigo">
            <Code2 className="size-3.5" /> Authoring
          </span>
          <h1 className="min-w-0 flex-1 truncate text-sm font-semibold">{e.lesson.title}</h1>

          {/* Viewport toggle */}
          <div className="flex items-center rounded-lg border border-primary-foreground/15 p-0.5">
            <button type="button" onClick={() => setViewport('desktop')} aria-label="Desktop preview" className={`grid size-7 place-items-center rounded-md ${viewport === 'desktop' ? 'bg-gold text-indigo' : 'text-primary-foreground/70'}`}><Monitor className="size-4" /></button>
            <button type="button" onClick={() => setViewport('mobile')} aria-label="Mobile preview" className={`grid size-7 place-items-center rounded-md ${viewport === 'mobile' ? 'bg-gold text-indigo' : 'text-primary-foreground/70'}`}><Smartphone className="size-4" /></button>
          </div>

          <button
            type="button"
            onClick={() => setPublished(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gold px-3 py-1.5 text-xs font-bold text-indigo transition-transform hover:-translate-y-0.5"
          >
            {published ? <><Check className="size-4" /> Published</> : <><Rocket className="size-4" /> Publish</>}
          </button>
        </div>
      </header>

      <div className="grid gap-3 p-3 lg:grid-cols-[260px_1fr_300px]">
        {/* Outline / blocks tree */}
        <aside className={`${panel} p-2 lg:sticky lg:top-3 lg:self-start`}>
          <p className="flex items-center gap-1.5 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-primary-foreground/60">
            <Blocks className="size-3.5" /> Lesson blocks
          </p>
          <ol className="flex flex-col gap-0.5">
            {e.steps.map((s, i) => {
              const done = e.completed.has(s.step)
              const isCurrent = s.step === e.current && !e.finished
              return (
                <li key={s.step} className="stagger-item" style={{ '--stagger': `${i * 25}ms` } as React.CSSProperties}>
                  <button
                    type="button"
                    onClick={() => e.goTo(s.step)}
                    className={['flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors', isCurrent ? 'bg-gold/20 text-primary-foreground' : 'text-primary-foreground/70 hover:bg-primary-foreground/5'].join(' ')}
                  >
                    <span className="w-5 font-mono text-primary-foreground/40">{String(s.step).padStart(2, '0')}</span>
                    <span className="min-w-0 flex-1 truncate">{s.title}</span>
                    <span className="rounded bg-primary-foreground/10 px-1.5 py-0.5 font-mono text-[9px] uppercase text-primary-foreground/60">{s.kind}</span>
                    {done ? <Check className="size-3 text-gold" /> : null}
                  </button>
                </li>
              )
            })}
          </ol>
        </aside>

        {/* Device-framed preview */}
        <main className="min-w-0">
          <div className="mb-2 flex items-center gap-2 px-1 font-mono text-[11px] uppercase tracking-wide text-primary-foreground/50">
            <span className="size-2 rounded-full bg-gold" /> Live preview · {viewport}
          </div>
          <div className={`mx-auto transition-all ${viewport === 'mobile' ? 'max-w-sm' : 'max-w-3xl'}`}>
            <div className="overflow-hidden rounded-2xl border border-primary-foreground/15 bg-background text-foreground shadow-2xl">
              <div className="flex items-center gap-1.5 border-b border-border bg-soft px-3 py-2">
                <span className="size-2.5 rounded-full bg-destructive/60" />
                <span className="size-2.5 rounded-full bg-gold" />
                <span className="size-2.5 rounded-full bg-success/60" />
                <span className="ml-2 truncate font-mono text-[11px] text-muted-foreground">ielps.com/learn/{e.lesson.lessonId}</span>
              </div>
              <div key={e.current} className="animate-fade-in p-5 sm:p-6">
                {e.finished ? (
                  <CompletionScreen slug={slug} lesson={e.lesson} accent={e.accent} score={e.score} stars={e.stars} mastery={e.mastery} certificateEligible={e.progress >= 100} onNextLesson={e.restart} saveResult={e.saveResult} />
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
              </div>
            </div>
          </div>
        </main>

        {/* Schema inspector */}
        <aside key={e.current} className={`${panel} animate-fade-in p-4 lg:sticky lg:top-3 lg:self-start`}>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-primary-foreground/60">Inspector</p>
          <h2 className="mt-1 text-sm font-semibold">Step {e.activeStep.step}: {e.activeStep.title}</h2>

          <dl className="mt-3 space-y-2 font-mono text-[11px]">
            {[
              ['kind', e.activeStep.kind],
              ['required', String(e.isRequired(e.activeStep.step))],
              ['minItems', e.activeStep.minItems ? String(e.activeStep.minItems) : '—'],
              ['audio', String(!!e.activeStep.allowsAudio)],
              ['aiHelp', String(!!e.activeStep.allowsAiHelp)],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-2 border-b border-primary-foreground/10 pb-2">
                <dt className="text-primary-foreground/50">{k}</dt>
                <dd className="rounded bg-primary-foreground/10 px-1.5 py-0.5 text-gold">{v}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-primary-foreground/60">endpoints[]</p>
          <div className="rounded-lg bg-primary-foreground/[0.06] p-2">
            {e.activeStep.endpoints.map((ep) => (
              <code key={`${ep.method}${ep.path}`} className="block font-mono text-[11px] text-primary-foreground/80">
                <span className="text-gold">{ep.method}</span> {ep.path}
              </code>
            ))}
          </div>

          <p className="mt-3 rounded-lg bg-primary-foreground/[0.06] p-2.5 text-[11px] leading-relaxed text-primary-foreground/70">
            {e.activeStep.stateRule}
          </p>
        </aside>
      </div>
    </div>
  )
}

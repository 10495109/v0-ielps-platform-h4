'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Check, X, ClipboardList } from 'lucide-react'
import { PLACEMENT, SAMPLE_QUESTION } from '@/lib/ielps-data'

const LEVEL_STYLE = [
  'bg-turquoise text-accent-foreground',
  'bg-secondary text-secondary-foreground',
  'bg-primary text-primary-foreground',
  'bg-indigo text-primary-foreground',
  'bg-gold text-indigo',
  'bg-success text-primary-foreground',
]

export function PlacementSection() {
  const [selected, setSelected] = useState<number | null>(null)

  return (
    <section id="placement" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-16 lg:px-8">
      <div className="grid items-center gap-8 lg:grid-cols-[1fr_0.85fr]">
        <div className="max-w-2xl">
          <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-bold text-muted-foreground">
            Expanded placement contract
          </span>
          <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-balance text-foreground sm:text-4xl">
            The placement test page
          </h2>
          <p className="mt-3 text-lg leading-relaxed text-muted-foreground text-pretty">
            {PLACEMENT.items} original diagnostic items — {PLACEMENT.perLevel} per CEFR level —
            spanning nine skill areas from grammar to integrated evidence.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-border bg-muted shadow-[0_20px_44px_-28px_rgba(13,0,77,0.4)]">
          <Image
            src="/placement-test.png"
            alt="A learner taking the IELPS English placement assessment on a tablet"
            width={640}
            height={420}
            className="h-full max-h-[300px] w-full object-cover"
          />
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        {/* Scope + endpoints */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            <h3 className="font-display text-lg font-bold text-foreground">Scope &amp; standards</h3>
          </div>

          <div className="mt-5 grid grid-cols-6 gap-2">
            {PLACEMENT.levels.map((lvl, i) => (
              <span
                key={lvl}
                className={`rounded-full py-2 text-center font-display text-sm font-black ${LEVEL_STYLE[i]}`}
              >
                {lvl}
              </span>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-1.5">
            {PLACEMENT.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-semibold text-foreground"
              >
                {skill}
              </span>
            ))}
          </div>

          <div className="mt-5 flex flex-col gap-2">
            {PLACEMENT.endpoints.map((ep) => (
              <div
                key={ep.path}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2"
              >
                <span className="shrink-0 text-xs font-medium text-muted-foreground">
                  {ep.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive sample question */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-display text-lg font-bold text-foreground">Sample screen state</h3>
          <div className="mt-4 rounded-xl border border-border bg-background p-5">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-primary-foreground">
                {SAMPLE_QUESTION.level}
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                {SAMPLE_QUESTION.skill}
              </span>
            </div>
            <p className="mt-3 font-display font-bold text-foreground">
              {SAMPLE_QUESTION.title}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {SAMPLE_QUESTION.prompt}
            </p>

            <div className="mt-4 flex flex-col gap-2">
              {SAMPLE_QUESTION.options.map((opt, i) => {
                const isSelected = selected === i
                const show = selected !== null
                const state = show && isSelected
                let cls =
                  'border-border bg-card text-foreground hover:border-primary/50 hover:bg-muted'
                if (state && opt.correct) cls = 'border-success bg-success/10 text-foreground'
                if (state && !opt.correct) cls = 'border-destructive bg-destructive/10 text-foreground'
                if (show && !isSelected && opt.correct)
                  cls = 'border-success/60 bg-success/5 text-foreground'
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelected(i)}
                    className={`flex items-center justify-between gap-3 rounded-lg border px-3.5 py-3 text-left text-sm font-semibold transition-colors ${cls}`}
                  >
                    <span>{opt.text}</span>
                    {show && opt.correct && <Check className="h-4 w-4 shrink-0 text-success" />}
                    {state && !opt.correct && <X className="h-4 w-4 shrink-0 text-destructive" />}
                  </button>
                )
              })}
            </div>

            {selected !== null && (
              <p className="mt-3 text-sm font-medium text-muted-foreground">
                {SAMPLE_QUESTION.options[selected].correct
                  ? 'Correct — this answer uses the source evidence and the right next action.'
                  : 'Not quite — the best answer links the source evidence to a practical action.'}
              </p>
            )}
          </div>
        </div>
      </div>

      <p className="mt-6 rounded-r-lg border-l-4 border-gold bg-card px-4 py-3 text-sm leading-relaxed text-muted-foreground">
        {PLACEMENT.standardsNote}
      </p>
    </section>
  )
}

'use client'

import { useMemo, useState } from 'react'
import { PenLine, Check, Info } from 'lucide-react'
import type { AccentToken } from '@/lib/apps/types'
import { ACCENT } from '@/lib/apps/accent'
import { ExpandWindow, ExpandTrigger } from './expand-window'
import type { ActivityScreen } from './verified-activity-runner'

/**
 * The writing activity, with the agreed expansion window.
 *
 * A substantial piece of writing does not belong in a three-line box inside an
 * already busy lesson card, so the same activity opens into a window with the
 * prompt, the lesson language it has to use, the server's model line where the
 * lesson supplies one, and a writing area with room to think.
 *
 * The text is held by the runner above, so the compact box and the window are
 * two views of one answer, and submission still goes through the existing
 * canonical activity contract — nothing here marks, scores or judges anything.
 */

/** Requirements the server itself stated for this screen. Never invented. */
function requirements(screen: ActivityScreen) {
  const required = screen.required_words || []
  const minimumUnique = screen.anti_gaming?.min_unique_words || 0
  const mustUse = screen.anti_gaming?.must_use_required_words || 0
  return { required, minimumUnique, mustUse }
}

function progress(text: string, screen: ActivityScreen) {
  const { required, minimumUnique, mustUse } = requirements(screen)
  const words = text.trim().toLowerCase().match(/[\p{L}\p{N}']+/gu) || []
  const unique = new Set(words)
  const used = required.filter((word) => unique.has(word.toLowerCase()))
  return {
    words: words.length,
    unique: unique.size,
    minimumUnique,
    used,
    mustUse: mustUse || required.length,
    required,
  }
}

function Checklist({ text, screen }: { text: string; screen: ActivityScreen }) {
  const state = progress(text, screen)
  const rows: Array<{ label: string; done: boolean }> = []
  if (state.minimumUnique) {
    rows.push({
      label: `${Math.min(state.unique, state.minimumUnique)} of ${state.minimumUnique} different words`,
      done: state.unique >= state.minimumUnique,
    })
  }
  if (state.required.length) {
    rows.push({
      label: `${Math.min(state.used.length, state.mustUse)} of ${state.mustUse} lesson words used`,
      done: state.used.length >= state.mustUse,
    })
  }
  if (!rows.length) return null
  return (
    <ul className="flex flex-wrap gap-2">
      {rows.map((row) => (
        <li
          key={row.label}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
            row.done
              ? 'border-success/40 bg-success/10 text-success'
              : 'border-border bg-card text-muted-foreground'
          }`}
        >
          {row.done ? <Check className="size-3.5" /> : <Info className="size-3.5" />}
          {row.label}
        </li>
      ))}
    </ul>
  )
}

function RequiredWords({ screen, text, accent }: { screen: ActivityScreen; text: string; accent: AccentToken }) {
  const a = ACCENT[accent]
  const state = progress(text, screen)
  if (!state.required.length) return null
  const used = new Set(state.used.map((word) => word.toLowerCase()))
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Use this lesson language</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {state.required.map((word) => (
          <span
            key={word}
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              used.has(word.toLowerCase()) ? a.solid : 'border border-border bg-card text-foreground'
            }`}
          >
            {word}
          </span>
        ))}
      </div>
    </div>
  )
}

export function WritingActivity({
  screen,
  value,
  onChange,
  accent,
}: {
  screen: ActivityScreen
  value: string
  onChange: (text: string) => void
  accent: AccentToken
}) {
  const a = ACCENT[accent]
  const [open, setOpen] = useState(false)
  const prompt = screen.prompt || screen.instruction || ''
  const state = useMemo(() => progress(value, screen), [value, screen])

  return (
    <div className="flex flex-col gap-3">
      {prompt ? <p className="text-sm font-medium text-foreground">{prompt}</p> : null}

      <div className="rounded-2xl border border-border bg-card p-4">
        <textarea
          rows={4}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Write your response in English…"
          className="w-full resize-none rounded-xl border border-border bg-background p-3 text-sm text-foreground outline-none focus:border-foreground/30"
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <Checklist text={value} screen={screen} />
          <ExpandTrigger accent={accent} onClick={() => setOpen(true)} icon={PenLine}>
            Open the writing window
          </ExpandTrigger>
        </div>
      </div>

      <ExpandWindow
        open={open}
        onClose={() => setOpen(false)}
        title="Writing"
        subtitle={prompt || undefined}
        accent={accent}
        labelledBy="ielps-writing-title"
        footer={
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Checklist text={value} screen={screen} />
            <p className="text-xs text-muted-foreground">
              {state.words} {state.words === 1 ? 'word' : 'words'} · saved as you type
            </p>
          </div>
        }
      >
        <div className="grid grid-cols-1 lg:h-full lg:min-h-0 lg:grid-cols-[minmax(0,0.36fr)_minmax(0,0.64fr)]">
          <aside className="space-y-5 border-b border-border bg-soft/60 px-5 py-5 sm:px-7 lg:min-h-0 lg:overflow-y-auto lg:border-b-0 lg:border-r">
            {prompt ? (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">The task</p>
                <p className="mt-2 text-[0.95rem] leading-7 text-foreground">{prompt}</p>
              </div>
            ) : null}
            <RequiredWords screen={screen} text={value} accent={accent} />
            {screen.model_line ? (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Model</p>
                <p className={`mt-2 rounded-xl px-3.5 py-3 text-[0.95rem] leading-7 ${a.soft}`}>
                  {screen.model_line}
                </p>
              </div>
            ) : null}
            {screen.self_check?.length ? (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Before you submit</p>
                <ul className="mt-2 space-y-1.5">
                  {screen.self_check.map((item) => (
                    <li key={item} className="flex gap-2 text-sm text-muted-foreground">
                      <span className={`mt-2 size-1.5 shrink-0 rounded-full ${a.dot}`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </aside>

          <div className="flex flex-col px-5 py-5 sm:px-7 lg:min-h-0">
            <label htmlFor="ielps-writing-area" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Your writing
            </label>
            <textarea
              id="ielps-writing-area"
              value={value}
              onChange={(event) => onChange(event.target.value)}
              placeholder="Write your response in English…"
              className="mt-2 min-h-64 flex-1 resize-none rounded-2xl border border-border bg-background p-4 text-[0.95rem] leading-7 text-foreground outline-none focus:border-foreground/30"
            />
          </div>
        </div>
      </ExpandWindow>
    </div>
  )
}

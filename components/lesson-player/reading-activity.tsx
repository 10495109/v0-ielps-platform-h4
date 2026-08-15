'use client'

import { useState } from 'react'
import { BookOpen, Type } from 'lucide-react'
import type { AccentToken } from '@/lib/apps/types'
import { ACCENT } from '@/lib/apps/accent'
import { ExpandWindow, ExpandTrigger } from './expand-window'
import type { ActivityScreen } from './verified-activity-runner'

export type ReadingPassage = {
  title: string
  /** Ordered lines. A dialogue keeps its speaker; prose has none. */
  lines: Array<{ speaker?: string; text: string }>
}

/**
 * The reading text the server actually sent for this activity screen.
 *
 * Nothing is invented here. If the screen carries no passage the caller gets
 * `null` and renders the ordinary compact activity, exactly as before.
 */
export function readingPassage(screen: ActivityScreen): ReadingPassage | null {
  const raw = screen as unknown as Record<string, unknown>

  // Prose passage, if the activity contract carries one.
  const prose = typeof raw.passage === 'string' ? raw.passage : ''
  if (prose.trim()) {
    return {
      title: typeof raw.passage_title === 'string' && raw.passage_title ? raw.passage_title : 'Reading passage',
      lines: prose
        .split(/\n{1,}/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((text) => ({ text })),
    }
  }

  // A dialogue is a reading text: show it whole, in the server's own order.
  //
  // Except when the activity *is* putting that dialogue in order — printing the
  // ordered conversation there would hand the learner the answer.
  const cards = screen.dialogue_cards || []
  if (cards.length > 1 && screen.mechanic !== 'dialogue_sequence_builder') {
    return {
      title: 'Reading: the full conversation',
      lines: [...cards]
        .sort((one, two) => one.order - two.order)
        .map((card) => ({ speaker: card.speaker, text: card.text })),
    }
  }

  return null
}

function PassageBody({
  passage,
  large,
}: {
  passage: ReadingPassage
  large: boolean
}) {
  return (
    <div className={large ? 'space-y-3.5 text-[1.05rem] leading-8' : 'space-y-3 text-[0.95rem] leading-7'}>
      {passage.lines.map((line, index) => (
        <p key={index} className="text-foreground">
          {line.speaker ? (
            <span className="mr-1.5 font-semibold text-primary">{line.speaker}:</span>
          ) : null}
          {line.text}
        </p>
      ))}
    </div>
  )
}

/**
 * Wraps a reading activity so the learner can open the whole passage and answer
 * the questions beside it.
 *
 * The questions are rendered in one place at a time — in the card, or in the
 * window — and their answers live in the runner above, not inside them, so
 * moving between the two never loses an answer. The existing server-backed
 * activity and scoring path is untouched.
 */
export function ReadingActivity({
  passage,
  accent,
  instruction,
  children,
}: {
  passage: ReadingPassage
  accent: AccentToken
  instruction?: string
  children: React.ReactNode
}) {
  const a = ACCENT[accent]
  const [open, setOpen] = useState(false)
  const [large, setLarge] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      {/* Compact card — the passage is previewed, never cramped. */}
      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <header className="flex items-center justify-between gap-3 border-b border-border bg-soft px-4 py-3">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <BookOpen className={`size-4 ${a.text}`} />
            {passage.title}
          </p>
          <span className="text-xs text-muted-foreground">
            {passage.lines.length} {passage.lines.length === 1 ? 'line' : 'lines'}
          </span>
        </header>
        <div className="relative max-h-40 overflow-hidden px-4 py-3.5">
          <PassageBody passage={passage} large={false} />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card to-transparent"
          />
        </div>
        <div className="border-t border-border px-4 py-3">
          <ExpandTrigger accent={accent} onClick={() => setOpen(true)} icon={BookOpen}>
            Open the full reading
          </ExpandTrigger>
          <p className="mt-2 text-xs text-muted-foreground">
            Opens the complete passage with the questions beside it.
          </p>
        </div>
      </section>

      {/* The questions stay in place when the window is closed. */}
      {!open ? children : null}

      <ExpandWindow
        open={open}
        onClose={() => setOpen(false)}
        title={passage.title}
        subtitle={instruction}
        accent={accent}
        labelledBy="ielps-reading-title"
        footer={
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setLarge((value) => !value)}
              className="inline-flex items-center gap-2 rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              <Type className="size-3.5" />
              {large ? 'Standard text size' : 'Larger text'}
            </button>
            <p className="text-xs text-muted-foreground">
              Your answers are kept when you close this window.
            </p>
          </div>
        }
      >
        <div className="grid grid-cols-1 lg:h-full lg:min-h-0 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <div className="border-b border-border px-5 py-5 sm:px-7 lg:min-h-0 lg:overflow-y-auto lg:border-b-0 lg:border-r">
            <PassageBody passage={passage} large={large} />
          </div>
          <div className="bg-soft/60 px-5 py-5 sm:px-7 lg:min-h-0 lg:overflow-y-auto">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Questions
            </p>
            {open ? children : null}
          </div>
        </div>
      </ExpandWindow>
    </div>
  )
}

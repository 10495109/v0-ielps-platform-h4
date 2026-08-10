'use client'

import { useState } from 'react'
import { Check, X, RotateCcw } from 'lucide-react'
import type { QuizItem } from '@/lib/lesson-player/spec'
import type { AccentToken } from '@/lib/apps/types'
import { ACCENT } from '@/lib/apps/accent'
import { activityApi } from '@/lib/adapters'

/**
 * Runs a set of quiz items (match / gap-fill / MCQ). Every answer posts to
 * /api/activities/attempts via the centralized adapter; wrong answers are
 * flagged for support/review per the state rules. Calls onComplete when every
 * item has a correct answer.
 */
export function QuizRunner({
  items,
  accent,
  onComplete,
  supportAfter,
}: {
  items: QuizItem[]
  accent: AccentToken
  onComplete: () => void
  supportAfter?: number
}) {
  const a = ACCENT[accent]
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [wrongCount, setWrongCount] = useState(0)
  const [correctIds, setCorrectIds] = useState<Set<string>>(new Set())

  const item = items[index]
  if (!item) return null
  const isCorrect = revealed && selected === item.answer
  const showSupport = supportAfter != null && wrongCount >= supportAfter

  function choose(option: string) {
    if (revealed) return
    setSelected(option)
    setRevealed(true)
    const correct = option === item.answer
    void activityApi.submitAttempt({
      itemId: item.id,
      kind: item.kind,
      response: option,
      correct,
    })
    if (correct) {
      setCorrectIds((prev) => new Set(prev).add(item.id))
    } else {
      setWrongCount((w) => w + 1)
    }
  }

  function next() {
    if (index + 1 >= items.length) {
      onComplete()
      return
    }
    setIndex((i) => i + 1)
    setSelected(null)
    setRevealed(false)
  }

  function retry() {
    setSelected(null)
    setRevealed(false)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-muted-foreground">
          Item {index + 1} of {items.length}
        </span>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${a.soft}`}>
          {item.kind === 'mcq' ? 'Multiple choice' : item.kind === 'gap' ? 'Gap-fill' : 'Matching'}
        </span>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="text-base font-medium text-card-foreground">{item.prompt}</p>
        {item.sentence ? (
          <p className="mt-2 rounded-lg bg-soft px-3 py-2 font-mono text-sm text-foreground">
            {item.sentence}
          </p>
        ) : null}

        <div className="mt-4 flex flex-col gap-2">
          {(item.options ?? []).map((option) => {
            const chosen = selected === option
            const correctOption = revealed && option === item.answer
            const wrongChosen = revealed && chosen && option !== item.answer
            return (
              <button
                key={option}
                type="button"
                onClick={() => choose(option)}
                disabled={revealed}
                className={[
                  'flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition-colors',
                  correctOption
                    ? 'border-success/50 bg-success/10 text-foreground'
                    : wrongChosen
                      ? 'border-destructive/50 bg-destructive/10 text-foreground'
                      : chosen
                        ? `border-transparent ${a.soft}`
                        : 'border-border bg-background hover:border-foreground/20',
                ].join(' ')}
              >
                <span>{option}</span>
                {correctOption ? <Check className="size-4 text-success" /> : null}
                {wrongChosen ? <X className="size-4 text-destructive" /> : null}
              </button>
            )
          })}
        </div>
      </div>

      {revealed ? (
        <div className="flex items-center justify-between gap-3">
          <p className={`text-sm font-medium ${isCorrect ? 'text-success' : 'text-destructive'}`}>
            {isCorrect ? 'Correct — nicely done.' : `Not quite. Answer: “${item.answer}”.`}
          </p>
          {isCorrect ? (
            <button
              type="button"
              onClick={next}
              className={`rounded-full px-5 py-2 text-sm font-semibold ${a.solid}`}
            >
              {index + 1 >= items.length ? 'Finish' : 'Next'}
            </button>
          ) : (
            <button
              type="button"
              onClick={retry}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-soft"
            >
              <RotateCcw className="size-3.5" /> Try again
            </button>
          )}
        </div>
      ) : null}

      {showSupport ? (
        <div className="rounded-xl border border-gold/40 bg-gold/10 p-4 text-sm text-foreground">
          <p className="font-semibold">Support unlocked</p>
          <p className="mt-1 text-muted-foreground">
            After {supportAfter} tricky tries, scaffolds appear: sentence starters, gap-fill and
            matching help — as required by the state rules.
          </p>
        </div>
      ) : null}

      <div className="flex items-center gap-1.5">
        {items.map((it, i) => (
          <span
            key={it.id}
            className={[
              'h-1.5 flex-1 rounded-full',
              correctIds.has(it.id) ? a.dot : i === index ? 'bg-foreground/30' : 'bg-border',
            ].join(' ')}
          />
        ))}
      </div>
    </div>
  )
}

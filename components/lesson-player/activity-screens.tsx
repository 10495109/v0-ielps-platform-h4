'use client'

import { useMemo, useState } from 'react'
import { Check, RotateCcw, Volume2, Bookmark, AlertCircle } from 'lucide-react'
import type { AccentToken } from '@/lib/apps/types'
import { ACCENT } from '@/lib/apps/accent'
import type { ActivityScreen, Evidence } from '@/lib/activity-adapter'

/**
 * The seven real activity mechanics, one component each. Every component owns
 * its own interaction and reports evidence in exactly the shape the server's
 * scorer reads — no client-side grading happens here, because the server
 * rescores everything and ignores anything the client claims.
 */

type MechanicProps = {
  screen: ActivityScreen
  accent: AccentToken
  evidence: Evidence
  onChange: (evidence: Evidence) => void
}

function shuffleStable<T>(items: T[], seed: string): T[] {
  // Deterministic shuffle so the tiles do not reorder on every keystroke.
  let h = 0
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return items
    .map((value, index) => ({ value, key: (h + index * 2654435761) >>> 0 }))
    .sort((a, b) => a.key - b.key)
    .map((entry) => entry.value)
}

function TapWords({ screen, accent, evidence, onChange }: MechanicProps) {
  const a = ACCENT[accent]
  const pool = useMemo(
    () => shuffleStable([...(screen.correct_items ?? []), ...(screen.distractor_items ?? [])], screen.screen_id),
    [screen],
  )
  const selected = evidence.selectedItems ?? []
  const toggle = (word: string) =>
    onChange({
      selectedItems: selected.includes(word)
        ? selected.filter((w) => w !== word)
        : [...selected, word],
    })

  return (
    <div className="flex flex-wrap gap-2">
      {pool.map((word) => {
        const on = selected.includes(word)
        return (
          <button
            key={word}
            type="button"
            onClick={() => toggle(word)}
            aria-pressed={on}
            className={[
              'inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm transition-colors',
              on ? `${a.solid} border-transparent` : 'border-border bg-card text-card-foreground hover:border-foreground/25',
            ].join(' ')}
          >
            <Volume2 className="size-3.5 opacity-70" />
            {word}
            {on ? <Check className="size-3.5" /> : null}
          </button>
        )
      })}
    </div>
  )
}

function DialogueOrder({ screen, accent, evidence, onChange }: MechanicProps) {
  const a = ACCENT[accent]
  const cards = screen.dialogue_cards ?? []
  const pool = useMemo(() => shuffleStable(cards, screen.screen_id), [cards, screen.screen_id])
  const order = evidence.orderedCards ?? []

  const pick = (cardOrder: number) => {
    if (order.includes(cardOrder)) return
    onChange({ orderedCards: [...order, cardOrder] })
  }

  return (
    <div className="flex flex-col gap-4">
      <ol className="flex flex-col gap-2">
        {order.map((value, index) => {
          const card = cards.find((c) => c.order === value)
          return (
            <li key={value} className={`flex items-start gap-3 rounded-xl border border-transparent p-3 ${a.soft}`}>
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-background/70 text-[11px] font-bold">
                {index + 1}
              </span>
              <span className="text-sm">
                <span className="block text-xs font-semibold uppercase tracking-wide opacity-70">{card?.speaker}</span>
                {card?.text}
              </span>
            </li>
          )
        })}
      </ol>

      <div className="flex flex-col gap-2">
        {pool
          .filter((card) => !order.includes(card.order))
          .map((card) => (
            <button
              key={card.order}
              type="button"
              onClick={() => pick(card.order)}
              className="rounded-xl border border-border bg-card p-3 text-left text-sm text-card-foreground transition-colors hover:border-foreground/25"
            >
              <span className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {card.speaker}
              </span>
              {card.text}
            </button>
          ))}
      </div>

      {order.length ? (
        <button
          type="button"
          onClick={() => onChange({ orderedCards: [] })}
          className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="size-3.5" /> Start again
        </button>
      ) : null}
    </div>
  )
}

function ChoiceScreen({ screen, accent, evidence, onChange }: MechanicProps) {
  const a = ACCENT[accent]
  const selected = evidence.selectedOptionId ?? ''
  return (
    <div className="flex flex-col gap-2.5">
      {(screen.options ?? []).map((option) => {
        const on = selected === option.id
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange({ selectedOptionId: option.id })}
            aria-pressed={on}
            className={[
              'flex items-start gap-3 rounded-2xl border p-4 text-left text-sm transition-colors',
              on ? `${a.soft} border-current` : 'border-border bg-card text-card-foreground hover:border-foreground/25',
            ].join(' ')}
          >
            <span className={`grid size-6 shrink-0 place-items-center rounded-lg text-xs font-bold ${on ? a.solid : 'bg-muted text-muted-foreground'}`}>
              {option.id}
            </span>
            <span>{option.text}</span>
          </button>
        )
      })}
    </div>
  )
}

function TileBuilder({ screen, accent, evidence, onChange }: MechanicProps) {
  const a = ACCENT[accent]
  const tiles = screen.shuffled_tiles ?? screen.target_tiles ?? []
  const built = evidence.builtTiles ?? []
  // Tiles can repeat, so track consumption by count rather than by value.
  const remaining = useMemo(() => {
    const used = new Map<string, number>()
    built.forEach((t) => used.set(t, (used.get(t) ?? 0) + 1))
    return tiles.filter((tile) => {
      const left = used.get(tile) ?? 0
      if (left > 0) {
        used.set(tile, left - 1)
        return false
      }
      return true
    })
  }, [tiles, built])

  return (
    <div className="flex flex-col gap-4">
      <div className={`min-h-16 rounded-2xl border border-dashed border-border p-3 ${built.length ? '' : 'grid place-items-center'}`}>
        {built.length ? (
          <div className="flex flex-wrap gap-1.5">
            {built.map((tile, index) => (
              <button
                key={`${tile}-${index}`}
                type="button"
                onClick={() => onChange({ builtTiles: built.filter((_, i) => i !== index) })}
                className={`rounded-lg px-2.5 py-1.5 text-sm ${a.solid}`}
              >
                {tile}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Tap the words below to build the phrase.</p>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {remaining.map((tile, index) => (
          <button
            key={`${tile}-${index}`}
            type="button"
            onClick={() => onChange({ builtTiles: [...built, tile] })}
            className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-sm text-card-foreground transition-colors hover:border-foreground/25"
          >
            {tile}
          </button>
        ))}
      </div>
    </div>
  )
}

function SelfCheck({ screen, accent, evidence, onChange }: MechanicProps) {
  const a = ACCENT[accent]
  const checks = screen.self_check ?? []
  const state = evidence.selfChecks ?? {}
  return (
    <div className="flex flex-col gap-4">
      {screen.model_line ? (
        <p className={`rounded-2xl p-4 font-display text-lg ${a.soft}`}>{screen.model_line}</p>
      ) : null}
      <div className="flex flex-col gap-2">
        {checks.map((line) => {
          const on = state[line] === true
          return (
            <label
              key={line}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-card p-3 text-sm text-card-foreground"
            >
              <input
                type="checkbox"
                checked={on}
                onChange={() => onChange({ selfChecks: { ...state, [line]: !on } })}
                className="size-4 accent-current"
              />
              {line}
            </label>
          )
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        This step is confirmed by you and then reviewed by a teacher, so it is marked for review rather than
        auto-scored.
      </p>
    </div>
  )
}

function TransferResponse({ screen, accent, evidence, onChange }: MechanicProps) {
  const [mode, setMode] = useState<'writing' | 'speaking'>('writing')
  const a = ACCENT[accent]
  const text = evidence.responseText ?? ''
  const rules = screen.anti_gaming ?? {}
  const minUnique = rules.min_unique_words ?? 20
  const minRequired = rules.must_use_required_words ?? 2
  const required = screen.required_words ?? []

  const clean = text.toLowerCase().replace(/[^a-z0-9\s']/g, ' ').replace(/\s+/g, ' ').trim()
  const unique = new Set(clean.split(' ').filter(Boolean)).size
  const usedRequired = required.filter((word) => clean.includes(word.toLowerCase()))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1.5">
        {(['writing', 'speaking'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={[
              'rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors',
              mode === m ? a.solid : 'border border-border text-muted-foreground hover:text-foreground',
            ].join(' ')}
          >
            {m}
          </button>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        {mode === 'writing' ? screen.writing_task : screen.speaking_task}
      </p>

      <textarea
        value={text}
        onChange={(event) => onChange({ responseText: event.target.value })}
        rows={7}
        placeholder={mode === 'speaking' ? 'Say your answer, then type what you said.' : 'Write your response here.'}
        className="w-full resize-y rounded-2xl border border-border bg-card p-4 text-sm text-card-foreground outline-none focus:border-foreground/30"
      />

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
        <span className={unique >= minUnique ? 'text-muted-foreground' : 'font-medium text-foreground'}>
          {unique}/{minUnique} different words
        </span>
        <span className={usedRequired.length >= minRequired ? 'text-muted-foreground' : 'font-medium text-foreground'}>
          {usedRequired.length}/{minRequired} target words used
        </span>
        {required.length ? (
          <span className="text-muted-foreground">
            Try to use: {required.map((w) => (usedRequired.includes(w) ? `${w} ✓` : w)).join(', ')}
          </span>
        ) : null}
      </div>

      <p className="flex items-start gap-2 text-xs text-muted-foreground">
        <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
        Write this in your own words. Copying the model sentence back is rejected, and this answer goes to a
        teacher for review.
      </p>
    </div>
  )
}

function SmartReviewSave({
  screen,
  accent,
  evidence,
  onSave,
  saving,
}: MechanicProps & { onSave: (phrase: string) => void; saving: boolean }) {
  const a = ACCENT[accent]
  const [phrase, setPhrase] = useState(screen.suggested_phrase ?? '')
  const saved = Boolean(evidence.savedReviewItemId)

  return (
    <div className="flex flex-col gap-4">
      <input
        value={phrase}
        onChange={(event) => setPhrase(event.target.value)}
        disabled={saved}
        className="w-full rounded-2xl border border-border bg-card p-4 text-sm text-card-foreground outline-none focus:border-foreground/30 disabled:opacity-70"
      />
      <button
        type="button"
        disabled={saved || saving || !phrase.trim()}
        onClick={() => onSave(phrase.trim())}
        className={`inline-flex w-fit items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-60 ${saved ? a.soft : a.solid}`}
      >
        <Bookmark className="size-4" />
        {saved ? 'Saved to Smart Review' : saving ? 'Saving…' : 'Save to Smart Review'}
      </button>
      <p className="text-xs text-muted-foreground">
        This phrase is added to your review deck and scheduled for spaced repetition.
      </p>
    </div>
  )
}

export function ActivityScreenView({
  screen,
  accent,
  evidence,
  onChange,
  onSavePhrase,
  savingPhrase,
}: MechanicProps & { onSavePhrase: (phrase: string) => void; savingPhrase: boolean }) {
  const common = { screen, accent, evidence, onChange }
  let body: React.ReactNode = null
  switch (screen.mechanic) {
    case 'tap_the_lesson_words':
      body = <TapWords {...common} />
      break
    case 'dialogue_sequence_builder':
      body = <DialogueOrder {...common} />
      break
    case 'multiple_choice_meaning':
    case 'multiple_choice_form_control':
      body = <ChoiceScreen {...common} />
      break
    case 'drag_to_build_model_phrase':
      body = <TileBuilder {...common} />
      break
    case 'listen_repeat_self_check':
      body = <SelfCheck {...common} />
      break
    case 'speaking_or_writing_transfer':
      body = <TransferResponse {...common} />
      break
    case 'save_phrase_to_review_deck':
      body = <SmartReviewSave {...common} onSave={onSavePhrase} saving={savingPhrase} />
      break
    default:
      body = null
  }

  return (
    <section className="flex flex-col gap-3 rounded-3xl border border-border bg-card/40 p-5">
      <header>
        <h3 className="font-display text-base font-semibold text-foreground">{screen.learner_title}</h3>
        {screen.question || screen.instruction ? (
          <p className="mt-1 text-sm text-muted-foreground">{screen.question || screen.instruction}</p>
        ) : null}
      </header>
      {body}
    </section>
  )
}

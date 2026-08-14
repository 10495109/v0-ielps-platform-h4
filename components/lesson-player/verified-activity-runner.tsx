'use client'

import { useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import type { AccentToken } from '@/lib/apps/types'
import { ACCENT } from '@/lib/apps/accent'
import { activitiesApi, reviewApi } from '@/lib/adapters'

export type ActivityScreen = {
  screen_id: string
  mechanic: string
  instruction?: string
  prompt?: string
  correct_items?: string[]
  dialogue_cards?: Array<{ order: number; speaker?: string; text: string }>
  options?: Array<{ id: string; text: string }>
  target_tiles?: string[]
  self_check?: string[]
  required_words?: string[]
  model_line?: string
  anti_gaming?: { min_unique_words?: number; must_use_required_words?: number }
}

export type PlayableActivity = {
  lesson_id: string
  level: string
  unit_id?: string
  screens: ActivityScreen[]
}

export type ServerSubmission = {
  id: string
  score: number
  maxScore: number
  accuracy: number
  stars: number
  status: string
  results?: Array<{ screenId: string; complete: boolean; reason?: string | null }>
}

type Evidence = Record<string, unknown>

function unwrapSubmission(raw: unknown): ServerSubmission {
  const root = (raw || {}) as Record<string, unknown>
  return (root.submission || root) as ServerSubmission
}

export function VerifiedActivityRunner({
  activity,
  accent,
  onVerified,
}: {
  activity: PlayableActivity
  accent: AccentToken
  onVerified: (submission: ServerSubmission) => void
}) {
  const a = ACCENT[accent]
  const [index, setIndex] = useState(0)
  const [evidence, setEvidence] = useState<Record<string, Evidence>>({})
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string>()
  const screen = activity.screens[index]
  const currentEvidence = evidence[screen?.screen_id] || {}

  const attempts = useMemo(
    () => activity.screens.map((item) => ({ screenId: item.screen_id, evidence: evidence[item.screen_id] || {} })),
    [activity.screens, evidence],
  )

  function update(value: Evidence) {
    setEvidence((current) => ({ ...current, [screen.screen_id]: value }))
    setError(undefined)
  }

  function ready(item: ActivityScreen, value: Evidence) {
    switch (item.mechanic) {
      case 'tap_the_lesson_words': return Array.isArray(value.selectedItems) && value.selectedItems.length > 0
      case 'dialogue_sequence_builder': return Array.isArray(value.orderedCards) && value.orderedCards.length === (item.dialogue_cards || []).length
      case 'multiple_choice_meaning':
      case 'multiple_choice_form_control': return Boolean(value.selectedOptionId)
      case 'drag_to_build_model_phrase': return Array.isArray(value.builtTiles) && value.builtTiles.length === (item.target_tiles || []).length
      case 'listen_repeat_self_check': return Object.values((value.selfChecks || {}) as Record<string, boolean>).some(Boolean)
      case 'speaking_or_writing_transfer': return String(value.responseText || '').trim().length > 0
      case 'save_phrase_to_review_deck': return Boolean(value.phrase)
      default: return false
    }
  }

  async function advance() {
    if (!ready(screen, currentEvidence)) {
      setError('Complete this activity before continuing.')
      return
    }
    if (index < activity.screens.length - 1) {
      setIndex((value) => value + 1)
      return
    }

    setPending(true)
    setError(undefined)
    try {
      // Smart Review evidence is resolved by mechanic, not by position. The
      // save screen is not always the last one the server sends, and assuming
      // it is would attach the wrong phrase — or none — to the submission.
      const reviewScreen = activity.screens.find(
        (candidate) => candidate.mechanic === 'save_phrase_to_review_deck',
      )
      if (!reviewScreen) throw new Error('smart_review_screen_not_found')
      const reviewEvidence = evidence[reviewScreen.screen_id] || {}
      const phrase = String(reviewEvidence.phrase || '')
      if (!phrase) throw new Error('smart_review_phrase_missing')
      const saved = await reviewApi.savePhrase({
        lessonId: activity.lesson_id,
        phrase,
        level: activity.level,
        unitId: activity.unit_id || '',
        tags: ['lesson-player', 'smart-review'],
        kcs: [],
      }) as Record<string, unknown>
      const item = (saved.item || saved.savedItem || saved) as Record<string, unknown>
      const savedReviewItemId = String(item.id || '')
      // The server has to give us a real item id. Without one there is no
      // Smart Review evidence to submit, and self-reporting it is not allowed.
      if (!savedReviewItemId) throw new Error('smart_review_item_id_missing')
      const finalAttempts = attempts.map((attempt) =>
        attempt.screenId === reviewScreen.screen_id
          ? { ...attempt, evidence: { ...attempt.evidence, savedReviewItemId } }
          : attempt,
      )
      const clientSubmissionId = `ielps_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`
      const response = await activitiesApi.submit(activity.lesson_id, {
        clientSubmissionId,
        attempts: finalAttempts,
      })
      onVerified(unwrapSubmission(response))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The verified activity could not be submitted.')
    } finally {
      setPending(false)
    }
  }

  if (!screen) return <p className="text-sm text-muted-foreground">No verified activity is available for this lesson.</p>

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-muted-foreground">Verified activity {index + 1} of {activity.screens.length}</span>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${a.soft}`}>{screen.mechanic.replaceAll('_', ' ')}</span>
      </div>
      <Mechanic screen={screen} value={currentEvidence} onChange={update} accent={accent} />
      {error ? <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-foreground">{error}</p> : null}
      <button type="button" disabled={pending} onClick={advance} className={`self-end rounded-full px-6 py-2.5 text-sm font-semibold disabled:opacity-60 ${a.solid}`}>
        {pending ? <span className="inline-flex items-center gap-2"><Loader2 className="size-4 animate-spin" /> Submitting</span> : index + 1 === activity.screens.length ? 'Submit for server marking' : 'Next activity'}
      </button>
    </div>
  )
}

function Mechanic({ screen, value, onChange, accent }: { screen: ActivityScreen; value: Evidence; onChange: (value: Evidence) => void; accent: AccentToken }) {
  const a = ACCENT[accent]
  if (screen.mechanic === 'tap_the_lesson_words') {
    const selected = new Set((value.selectedItems || []) as string[])
    return <div className="flex flex-wrap gap-2">{(screen.correct_items || []).map((word) => <button type="button" key={word} onClick={() => { if (selected.has(word)) selected.delete(word); else selected.add(word); onChange({ selectedItems: [...selected] }) }} className={`rounded-full border px-4 py-2 text-sm font-medium ${selected.has(word) ? a.solid : 'border-border bg-card'}`}>{word}</button>)}</div>
  }
  if (screen.mechanic === 'dialogue_sequence_builder') {
    const initial = [...(screen.dialogue_cards || [])].reverse().map((card) => card.order)
    const order = ((value.orderedCards as number[]) || initial)
    const cards = new Map((screen.dialogue_cards || []).map((card) => [card.order, card]))
    const move = (at: number, by: number) => { const next = [...order]; const target = at + by; if (target < 0 || target >= next.length) return; [next[at], next[target]] = [next[target], next[at]]; onChange({ orderedCards: next }) }
    return <div className="space-y-2">{order.map((id, at) => { const card = cards.get(id); return <div key={id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"><span className="min-w-0 flex-1 text-sm"><b>{card?.speaker}:</b> {card?.text}</span><button aria-label="Move up" onClick={() => move(at, -1)}><ChevronUp className="size-4" /></button><button aria-label="Move down" onClick={() => move(at, 1)}><ChevronDown className="size-4" /></button></div> })}</div>
  }
  if (screen.mechanic.startsWith('multiple_choice')) {
    return <div className="grid gap-2">{(screen.options || []).map((option) => <button type="button" key={option.id} onClick={() => onChange({ selectedOptionId: option.id })} className={`rounded-xl border p-3 text-left text-sm ${value.selectedOptionId === option.id ? a.solid : 'border-border bg-card'}`}>{option.text}</button>)}</div>
  }
  if (screen.mechanic === 'drag_to_build_model_phrase') {
    const available = [...(screen.target_tiles || [])].reverse()
    const built = (value.builtTiles || []) as string[]
    return <div className="space-y-3"><div className="min-h-12 rounded-xl border border-dashed border-border bg-soft p-3 text-sm">{built.length ? built.join(' ') : 'Choose the words in order.'}</div><div className="flex flex-wrap gap-2">{available.map((tile, i) => <button type="button" key={`${tile}-${i}`} onClick={() => onChange({ builtTiles: [...built, tile] })} className="rounded-lg border border-border bg-card px-3 py-2 text-sm">{tile}</button>)}</div><button type="button" className="text-xs text-muted-foreground underline" onClick={() => onChange({ builtTiles: [] })}>Clear</button></div>
  }
  if (screen.mechanic === 'listen_repeat_self_check') {
    const checks = (value.selfChecks || {}) as Record<string, boolean>
    return <div className="space-y-2"><p className={`rounded-xl p-3 text-sm ${a.soft}`}>{screen.model_line}</p>{(screen.self_check || []).map((item) => <label key={item} className="flex items-center gap-3 rounded-xl border border-border p-3 text-sm"><input type="checkbox" checked={Boolean(checks[item])} onChange={(event) => onChange({ selfChecks: { ...checks, [item]: event.target.checked } })} /><span>{item}</span></label>)}</div>
  }
  if (screen.mechanic === 'speaking_or_writing_transfer') {
    const minimum = screen.anti_gaming?.min_unique_words || 1
    return <div><p className="mb-2 text-sm text-muted-foreground">Use at least {minimum} different words and include lesson language: {(screen.required_words || []).join(', ')}.</p><textarea rows={5} value={String(value.responseText || '')} onChange={(event) => onChange({ responseText: event.target.value })} className="w-full rounded-xl border border-border bg-background p-3 text-sm" placeholder="Write or dictate your own response." /></div>
  }
  if (screen.mechanic === 'save_phrase_to_review_deck') {
    return <div><p className="mb-2 text-sm text-muted-foreground">Choose a useful phrase to save in your personal Smart Review deck.</p><input value={String(value.phrase || '')} onChange={(event) => onChange({ phrase: event.target.value })} className="w-full rounded-xl border border-border bg-background p-3 text-sm" placeholder="Type the phrase to save." /></div>
  }
  return <div className="rounded-xl border border-border bg-soft p-4 text-sm">This server mechanic is unavailable in this release.</div>
}

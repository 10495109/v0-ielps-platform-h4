'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import Image from 'next/image'
import { X, Play, Pause, ImageOff, Volume2 } from 'lucide-react'
import type { AccentToken } from '@/lib/apps/types'
import { ACCENT } from '@/lib/apps/accent'
import type { EngineVocabularyCard } from '@/lib/lesson-player/engine'
import { resolveKeywordImage } from '@/lib/lesson-player/keyword-image'

/**
 * The clickable keyword vocabulary pop-up.
 *
 * This does not replace the keyword function — the same cards, from the same
 * `visual-keywords` step of the lesson engine, are still what is shown. It
 * gives each word its own small window: the picture for that word, the word,
 * its meaning, an example of it in use, and pronunciation where the platform
 * already has it.
 *
 * It stays small on purpose. It supports understanding one word; it is not a
 * second content panel.
 */

/** Whether this browser can speak the word. Never changes after load, so it has
 *  nothing to subscribe to; the server answer is `true` so the button renders in
 *  the markup and only disappears on a browser that genuinely cannot speak. */
const noSubscription = () => () => {}

function Pronounce({ word, accent, src }: { word: string; accent: AccentToken; src?: string }) {
  const a = ACCENT[accent]
  const [playing, setPlaying] = useState(false)
  const audio = useRef<HTMLAudioElement | null>(null)

  const supported = useSyncExternalStore(
    noSubscription,
    () => Boolean(src) || 'speechSynthesis' in window,
    () => true,
  )

  useEffect(
    () => () => {
      audio.current?.pause()
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel()
    },
    [],
  )

  if (!supported) return null

  function toggle() {
    if (src) {
      if (!audio.current) {
        audio.current = new Audio(src)
        audio.current.addEventListener('ended', () => setPlaying(false))
      }
      if (playing) audio.current.pause()
      else void audio.current.play()
      setPlaying(!playing)
      return
    }
    if (playing) {
      window.speechSynthesis.cancel()
      setPlaying(false)
      return
    }
    const utterance = new SpeechSynthesisUtterance(word)
    utterance.lang = 'en-GB'
    utterance.onend = () => setPlaying(false)
    window.speechSynthesis.speak(utterance)
    setPlaying(true)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold ${a.solid}`}
      aria-label={playing ? `Stop saying ${word}` : `Hear ${word}`}
    >
      {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
      Hear it
    </button>
  )
}

export function KeywordPopup({
  card,
  accent,
  onClose,
  audioSrc,
}: {
  card: EngineVocabularyCard
  accent: AccentToken
  onClose: () => void
  audioSrc?: string
}) {
  const a = ACCENT[accent]
  const picture = resolveKeywordImage(card)
  const panel = useRef<HTMLDivElement | null>(null)

  /**
   * Truthfulness, per the 17 August instruction. Until a word carries approval
   * or version metadata from the permanent 2,976-entry vocabulary programme,
   * what the pop-up can show is runtime content, not reviewed IELPS content.
   * The window says so rather than letting the learner assume otherwise. The
   * moment a word is authored and approved, the notice disappears on its own.
   */
  const meta = card as unknown as Record<string, unknown>
  const authored = Boolean(meta.approvedAt || meta.approvalStatus || meta.version || meta.reviewedAt)
  const pendingParts: string[] = []
  if (picture.kind === 'brief') pendingParts.push('no approved picture yet')
  if (card.definition || card.usageExample) {
    pendingParts.push('the meaning and example come from the lesson runtime')
  }
  if (!audioSrc) pendingParts.push('the pronunciation is your device’s voice, not a supplied recording')

  useEffect(() => {
    panel.current?.focus()
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6" role="presentation">
      <div aria-hidden="true" onClick={onClose} className="absolute inset-0 bg-indigo/45 backdrop-blur-[2px]" />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ielps-keyword-word"
        tabIndex={-1}
        className="relative w-full max-w-sm overflow-hidden rounded-t-3xl border border-border bg-card shadow-[0_28px_80px_-32px_rgba(13,0,77,0.55)] outline-none sm:rounded-3xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-full bg-card/90 text-foreground shadow-sm backdrop-blur"
        >
          <X className="size-4" />
        </button>

        {picture.kind === 'brief' ? (
          <div className="border-b border-border bg-soft px-5 py-6">
            <p className="inline-flex items-center gap-2 pr-10 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <ImageOff className="size-4 shrink-0" />
              No picture supplied for this word yet
            </p>
            {picture.brief ? (
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{picture.brief}</p>
            ) : null}
          </div>
        ) : (
          <div className="relative aspect-[4/3] w-full bg-muted">
            <Image
              src={picture.src}
              alt={picture.alt}
              fill
              sizes="(max-width: 640px) 100vw, 24rem"
              className="object-cover"
            />
          </div>
        )}

        <div className="px-5 py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 id="ielps-keyword-word" className="font-display text-2xl font-bold text-foreground">
                {card.word}
              </h3>
              {card.language ? (
                <p className="mt-0.5 text-xs uppercase tracking-wider text-muted-foreground">{card.language}</p>
              ) : null}
            </div>
            <Pronounce word={card.word} accent={accent} src={audioSrc} />
          </div>

          {card.definition ? (
            <p className="mt-3 text-[0.95rem] leading-7 text-foreground">{card.definition}</p>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              The lesson did not send a meaning for this word.
            </p>
          )}

          {card.usageExample ? (
            <p className={`mt-3 rounded-xl px-3.5 py-2.5 text-[0.95rem] leading-7 ${a.soft}`}>
              “{card.usageExample}”
            </p>
          ) : null}
        </div>

        {authored || pendingParts.length === 0 ? null : (
          <p className="border-t border-border bg-soft px-5 py-3 text-xs leading-5 text-muted-foreground">
            Pending IELPS vocabulary authoring: {pendingParts.join(', ')}. This word does not yet
            carry reviewed permanent IELPS vocabulary content.
          </p>
        )}
      </div>
    </div>
  )
}

/** A keyword the learner can click. Used wherever keywords are listed. */
export function KeywordChip({
  card,
  accent,
  active,
  onOpen,
  large,
}: {
  card: EngineVocabularyCard
  accent: AccentToken
  active: boolean
  onOpen: () => void
  large: boolean
}) {
  const a = ACCENT[accent]
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      className={[
        'inline-flex items-center gap-2 rounded-full border px-4 font-medium transition-all',
        large ? 'py-3 text-lg' : 'py-2 text-sm',
        active ? `border-transparent ${a.solid}` : 'border-border bg-card hover:border-foreground/20',
      ].join(' ')}
    >
      <Volume2 className="size-4" />
      {card.word}
    </button>
  )
}

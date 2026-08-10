'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, GraduationCap, Lock, Users, EyeOff, CheckCircle2 } from 'lucide-react'
import {
  getSessionView,
  saveSessionNote,
  endSession,
  SESSION_ERROR_COPY,
  type SessionView,
  type SessionNote,
  type NoteVisibility,
} from '@/lib/tutoring-adapter'

const VISIBILITY: { value: NoteVisibility; label: string; hint: string; icon: typeof Lock }[] = [
  { value: 'shared', label: 'Shared', hint: 'The learner can read this', icon: Users },
  { value: 'private', label: 'Private', hint: 'Only you can read this', icon: Lock },
  { value: 'internal', label: 'Internal', hint: 'Tutors only', icon: EyeOff },
]

/** Comma or newline separated, which is quicker to type than a repeating field. */
function toList(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 8)
}

function NoteCard({ note }: { note: SessionNote }) {
  const meta = VISIBILITY.find((v) => v.value === note.visibility)
  const Icon = meta?.icon ?? Lock
  const targets = note.targets ?? {}
  return (
    <li className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {note.role}
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          <Icon className="size-3" /> {meta?.label ?? note.visibility}
        </span>
      </div>
      <p className="mt-2 whitespace-pre-wrap text-sm text-card-foreground">{note.notes}</p>
      {note.learnerSummary ? (
        <p className="mt-2 rounded-xl bg-soft p-3 text-sm text-foreground">{note.learnerSummary}</p>
      ) : null}
      {(targets.strengths?.length || targets.nextSteps?.length || targets.homework?.length) ? (
        <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-3">
          {(['strengths', 'nextSteps', 'homework'] as const).map((k) =>
            targets[k]?.length ? (
              <div key={k}>
                <dt className="font-semibold capitalize text-foreground">
                  {k === 'nextSteps' ? 'Next steps' : k}
                </dt>
                <dd className="mt-0.5 text-muted-foreground">{targets[k]!.join(', ')}</dd>
              </div>
            ) : null,
          )}
        </dl>
      ) : null}
      <p className="mt-2 text-[11px] text-muted-foreground">
        {new Date(note.createdAt).toLocaleString()}
      </p>
    </li>
  )
}

/**
 * Session summary, notes and completion — steps 11 to 13 of the pathway.
 *
 * The tutor writes notes and ends the session; the learner sees the summary and
 * whatever was shared with them. Both sides call the same routes, and the server
 * decides what each may read and write: a learner cannot save an internal note,
 * and only a paid, confirmed session can be ended.
 */
export function SessionSummary() {
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [view, setView] = useState<SessionView | null>(null)
  const [loading, setLoading] = useState(true)
  const [problem, setProblem] = useState<string | null>(null)

  const [noteText, setNoteText] = useState('')
  const [visibility, setVisibility] = useState<NoteVisibility>('shared')
  const [saving, setSaving] = useState(false)

  const [focus, setFocus] = useState('')
  const [learnerSummary, setLearnerSummary] = useState('')
  const [strengths, setStrengths] = useState('')
  const [nextSteps, setNextSteps] = useState('')
  const [homework, setHomework] = useState('')
  const [ending, setEnding] = useState(false)

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('booking')
    setBookingId(id)
    if (!id) {
      setLoading(false)
      return
    }
    let cancelled = false
    getSessionView(id)
      .then((v) => !cancelled && setView(v))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  async function refresh() {
    if (bookingId) setView(await getSessionView(bookingId))
  }

  async function addNote() {
    if (!bookingId || !noteText.trim()) return
    setSaving(true)
    setProblem(null)
    try {
      const r = await saveSessionNote(bookingId, { notes: noteText, visibility })
      if (!r.ok) setProblem(SESSION_ERROR_COPY[r.reason] ?? r.reason)
      else {
        setNoteText('')
        await refresh()
      }
    } finally {
      setSaving(false)
    }
  }

  async function finish() {
    if (!bookingId) return
    setEnding(true)
    setProblem(null)
    try {
      const r = await endSession(bookingId, {
        focus: focus || undefined,
        learnerSummary: learnerSummary || undefined,
        strengths: toList(strengths),
        nextSteps: toList(nextSteps),
        homework: toList(homework),
        notes: noteText || undefined,
      })
      if (!r.ok) setProblem(SESSION_ERROR_COPY[r.reason] ?? r.reason)
      else {
        setNoteText('')
        await refresh()
      }
    } finally {
      setEnding(false)
    }
  }

  if (loading) return <p className="mx-auto max-w-3xl px-5 py-16 text-sm text-muted-foreground">Loading…</p>

  const isTutor = view?.role === 'tutor'
  const completed = view?.booking.status === 'completed'
  const summary = view?.summary ?? {}
  const visibilityOptions = VISIBILITY.filter((v) => v.value !== 'internal' || isTutor)

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 lg:px-8">
      <Link
        href="/tutors"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" /> Tutors
      </Link>

      <h1 className="mt-4 font-display text-3xl font-bold text-foreground">Session summary</h1>

      {!view ? (
        <p className="mt-4 text-sm text-muted-foreground">
          {bookingId ? 'That booking was not found on your account.' : 'No booking selected.'}
        </p>
      ) : (
        <>
          <div className="mt-4 rounded-2xl border border-border bg-card p-5">
            <p className="text-sm text-foreground">
              {isTutor ? view.booking.learnerName : view.booking.tutorName} ·{' '}
              {new Date(view.booking.startsAt).toLocaleString([], {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              {completed ? <CheckCircle2 className="size-3.5 text-success" /> : null}
              {view.booking.status.replace(/_/g, ' ')} · payment {view.booking.paymentStatus}
              {view.booking.sessionEndedAt
                ? ` · ended ${new Date(view.booking.sessionEndedAt).toLocaleString()}`
                : ''}
              {` · you are the ${view.role}`}
            </p>
          </div>

          {/* What the session produced */}
          {summary.learnerSummary || summary.strengths?.length || summary.nextSteps?.length || summary.homework?.length ? (
            <section className="mt-6 rounded-2xl border border-border bg-soft p-5">
              <h2 className="font-display text-base font-semibold text-foreground">Your session</h2>
              {summary.focus ? (
                <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                  Focus: {summary.focus}
                </p>
              ) : null}
              {summary.learnerSummary ? (
                <p className="mt-2 text-sm text-foreground">{summary.learnerSummary}</p>
              ) : null}
              <dl className="mt-3 grid gap-3 sm:grid-cols-3">
                {(
                  [
                    ['Strengths', summary.strengths],
                    ['Next steps', summary.nextSteps],
                    ['Practice', summary.homework],
                  ] as const
                ).map(([label, items]) =>
                  items?.length ? (
                    <div key={label}>
                      <dt className="text-xs font-semibold text-foreground">{label}</dt>
                      <dd className="mt-1 flex flex-col gap-0.5 text-sm text-muted-foreground">
                        {items.map((i) => (
                          <span key={i}>{i}</span>
                        ))}
                      </dd>
                    </div>
                  ) : null,
                )}
              </dl>
            </section>
          ) : null}

          {/* Notes */}
          <section className="mt-6">
            <h2 className="font-display text-base font-semibold text-foreground">
              Notes {view.notes.length ? `(${view.notes.length})` : ''}
            </h2>
            {view.notes.length ? (
              <ul className="mt-3 flex flex-col gap-3">
                {view.notes.map((n) => (
                  <NoteCard key={n.id} note={n} />
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                No notes on this session yet.
              </p>
            )}

            <div className="mt-4 rounded-2xl border border-border bg-card p-4">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={4}
                placeholder={isTutor ? 'Note for this session…' : 'Your own note about this session…'}
                className="w-full resize-y rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-foreground/30"
              />
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {visibilityOptions.map(({ value, label, hint, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    title={hint}
                    onClick={() => setVisibility(value)}
                    className={[
                      'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
                      visibility === value
                        ? 'bg-primary text-primary-foreground'
                        : 'border border-border text-muted-foreground hover:text-foreground',
                    ].join(' ')}
                  >
                    <Icon className="size-3" /> {label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={addNote}
                  disabled={saving || !noteText.trim()}
                  className="ml-auto rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save note'}
                </button>
              </div>
            </div>
          </section>

          {/* Tutor closes the session */}
          {isTutor && !completed ? (
            <section className="mt-6 rounded-2xl border border-border bg-card p-5">
              <h2 className="font-display text-base font-semibold text-foreground">End the session</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                This writes the support record on the learner's profile. Separate each item with a
                comma or a new line.
              </p>
              <div className="mt-4 flex flex-col gap-3">
                <input
                  value={focus}
                  onChange={(e) => setFocus(e.target.value)}
                  placeholder="Focus of the lesson"
                  className="rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-foreground/30"
                />
                <textarea
                  value={learnerSummary}
                  onChange={(e) => setLearnerSummary(e.target.value)}
                  rows={3}
                  placeholder="Summary the learner will see"
                  className="resize-y rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-foreground/30"
                />
                {(
                  [
                    ['Strengths', strengths, setStrengths],
                    ['Next steps', nextSteps, setNextSteps],
                    ['Practice to do', homework, setHomework],
                  ] as const
                ).map(([label, value, setter]) => (
                  <input
                    key={label}
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    placeholder={label}
                    className="rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-foreground/30"
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={finish}
                disabled={ending}
                className="mt-4 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                {ending ? 'Ending…' : 'End session and save record'}
              </button>
            </section>
          ) : null}

          {problem ? (
            <p className="mt-4 rounded-xl border border-border bg-soft p-3 text-sm text-muted-foreground">
              {problem}
            </p>
          ) : null}
        </>
      )}

      <section className="mt-6 rounded-2xl border border-border bg-soft p-5">
        <h2 className="flex items-center gap-2 font-display text-base font-semibold">
          <GraduationCap className="size-4" /> Back to your course
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          A tutor session is support evidence. It never completes a course lesson — that still runs
          through the scored IELPS lesson pipeline.
        </p>
        <Link
          href="/app/adult/dashboard"
          className="mt-4 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Continue my course
        </Link>
      </section>
    </div>
  )
}

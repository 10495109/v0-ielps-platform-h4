'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Star, Globe, ShieldCheck, CreditCard, CalendarClock } from 'lucide-react'
import {
  getTutor,
  getAvailability,
  getLiveBookingEntitlement,
  createBooking,
  type Tutor,
  type Slot,
  type Entitlement,
  type AvailabilityResult,
  type CreateBookingResult,
} from '@/lib/tutoring-adapter'

const FOCUS = ['speaking', 'writing', 'exam', 'conversation', 'homework'] as const

function money(cents?: number | null) {
  if (typeof cents !== 'number') return '—'
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

function slotTime(slot: Slot) {
  const ms = typeof slot.startUtc === 'number' ? slot.startUtc : Date.parse(String(slot.startUtc))
  return new Date(ms)
}

/**
 * Tutor profile, availability and booking.
 *
 * The booking button never confirms anything itself. It posts to the server,
 * which creates the booking as payment_pending and returns a checkout URL
 * unless a prepaid credit covers it. Whatever the server says about payment is
 * what the learner is shown.
 */
export function TutorProfile() {
  const [tutorId, setTutorId] = useState<string | null>(null)
  const [tutor, setTutor] = useState<Tutor | null>(null)
  const [availability, setAvailability] = useState<AvailabilityResult | null>(null)
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null)
  const [loading, setLoading] = useState(true)

  const [slot, setSlot] = useState<Slot | null>(null)
  const [focus, setFocus] = useState<(typeof FOCUS)[number]>('speaking')
  const [booking, setBooking] = useState<CreateBookingResult | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('tutor')
    setTutorId(id)
    if (!id) {
      setLoading(false)
      return
    }
    let cancelled = false
    Promise.all([getTutor(id), getLiveBookingEntitlement()])
      .then(async ([t, ent]) => {
        if (cancelled) return
        setTutor(t)
        setEntitlement(ent)
        if (t) setAvailability(await getAvailability(t))
      })
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  async function confirm() {
    if (!tutor || !slot) return
    setSubmitting(true)
    try {
      const startUtc = slotTime(slot).toISOString()
      setBooking(await createBooking({ tutorId: tutor.id, startUtc, kind: 'lesson' }))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <p className="mx-auto max-w-4xl px-5 py-16 text-sm text-muted-foreground">Loading…</p>

  if (!tutorId || !tutor) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-16">
        <p className="text-sm text-muted-foreground">
          {tutorId ? 'That tutor is no longer listed.' : 'No tutor selected.'}
        </p>
        <Link href="/tutors" className="mt-4 inline-block text-sm font-semibold text-primary">
          Back to tutors
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 lg:px-8">
      <Link
        href="/tutors"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" /> All tutors
      </Link>

      <header className="mt-4 flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">{tutor.name}</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            {tutor.accent || tutor.country ? (
              <span className="flex items-center gap-1">
                <Globe className="size-3.5" />
                {[tutor.accent, tutor.country].filter(Boolean).join(' · ')}
              </span>
            ) : null}
            {tutor.rating ? (
              <span className="flex items-center gap-1">
                <Star className="size-3.5 fill-gold text-gold" />
                {Number(tutor.rating).toFixed(1)}
              </span>
            ) : null}
          </p>
        </div>
        <p className="font-display text-2xl font-bold text-foreground">
          {money(tutor.price_cents)}
          <span className="ml-1 text-xs font-medium text-muted-foreground">per lesson</span>
        </p>
      </header>

      {tutor.bio ? <p className="mt-6 text-sm leading-relaxed text-foreground">{tutor.bio}</p> : null}

      <div className="mt-4 flex flex-wrap gap-1.5">
        {(tutor.levels ?? []).map((l) => (
          <span key={l} className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
            {l}
          </span>
        ))}
        {(tutor.specialties ?? []).map((s) => (
          <span key={s} className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {s}
          </span>
        ))}
      </div>

      {/* Entitlement, straight from the server */}
      <section className="mt-8 rounded-2xl border border-border bg-card p-5">
        <h2 className="flex items-center gap-2 font-display text-base font-semibold text-foreground">
          <CreditCard className="size-4" /> Your plan
        </h2>
        {entitlement ? (
          entitlement.allowed ? (
            <p className="mt-1 text-sm text-muted-foreground">
              Your <strong className="text-foreground">{entitlement.tier}</strong> plan includes live
              tutoring. Booking will confirm once payment is taken.
            </p>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">
              Live tutoring is not included in the{' '}
              <strong className="text-foreground">{entitlement.tier}</strong> plan. It needs{' '}
              {entitlement.requiredTiers.join(', ')}. You can still book — the server will take you to
              checkout and only confirm the lesson once it is paid.
            </p>
          )
        ) : (
          <p className="mt-1 text-sm text-muted-foreground">Your plan could not be read just now.</p>
        )}
      </section>

      {/* Availability */}
      <section className="mt-6">
        <h2 className="flex items-center gap-2 font-display text-base font-semibold text-foreground">
          <CalendarClock className="size-4" /> Choose a time
        </h2>

        {availability?.state === 'ok' && availability.slots.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {availability.slots.slice(0, 24).map((s, i) => {
              const d = slotTime(s)
              const on = slot === s
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSlot(s)}
                  className={[
                    'rounded-xl border px-3 py-2 text-sm transition-colors',
                    on
                      ? 'border-transparent bg-primary text-primary-foreground'
                      : 'border-border bg-card hover:border-foreground/25',
                  ].join(' ')}
                >
                  {d.toLocaleString([], {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </button>
              )
            })}
          </div>
        ) : (
          <p className="mt-3 rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
            {availability?.state === 'no_timezone'
              ? 'This tutor has not published a timezone yet, so the server cannot generate bookable slots for them. Availability appears here as soon as their profile is completed.'
              : availability?.state === 'ok'
                ? 'No open slots in the next seven days.'
                : 'Availability could not be loaded for this tutor.'}
          </p>
        )}
      </section>

      {/* Focus + confirm */}
      <section className="mt-6 rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-base font-semibold text-foreground">Lesson focus</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {FOCUS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFocus(f)}
              className={[
                'rounded-full px-3 py-1.5 text-sm capitalize transition-colors',
                focus === f
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border text-muted-foreground hover:text-foreground',
              ].join(' ')}
            >
              {f}
            </button>
          ))}
        </div>

        <button
          type="button"
          disabled={!slot || submitting}
          onClick={confirm}
          className="mt-5 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {submitting ? 'Booking…' : slot ? 'Confirm booking' : 'Pick a time first'}
        </button>

        {booking ? (
          <div className="mt-4 rounded-xl border border-border bg-soft p-4 text-sm">
            {booking.ok ? (
              <>
                <p className="font-medium text-foreground">
                  {booking.confirmed ? 'Booking confirmed.' : 'Booking created — payment needed.'}
                </p>
                <p className="mt-0.5 text-muted-foreground">
                  {booking.message ??
                    `Payment status: ${booking.paymentStatus ?? 'unknown'}.`}
                </p>
                {booking.checkoutUrl ? (
                  <a
                    href={booking.checkoutUrl}
                    className="mt-2 inline-block font-semibold text-primary"
                  >
                    Continue to payment
                  </a>
                ) : null}
                {booking.bookingId ? (
                  <Link
                    href={`/tutor/live?booking=${encodeURIComponent(booking.bookingId)}`}
                    className="mt-2 ml-4 inline-block font-semibold text-primary"
                  >
                    Open lesson lobby
                  </Link>
                ) : null}
              </>
            ) : (
              <p className="text-muted-foreground">
                The booking was not created: {booking.error ?? `status ${booking.status}`}.
              </p>
            )}
          </div>
        ) : null}
      </section>

      <p className="mt-6 flex items-start gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
        Tutor sessions are support for your course. They add evidence and recommendations to your
        record, and never mark a course lesson complete.
      </p>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, CircleSlash, GraduationCap } from 'lucide-react'
import { getBooking, SESSION_ROUTES_UNAVAILABLE, type Booking } from '@/lib/tutoring-adapter'

/**
 * Session summary.
 *
 * Steps 11 and 12 of the pathway — tutor notes and end-of-session — have no
 * route on the server. Rather than collect notes into a form that silently
 * discards them, this screen states which contracts are missing and shows the
 * booking record that does exist.
 */
export function SessionSummary() {
  const [booking, setBooking] = useState<Booking | null>(null)
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('booking')
    setBookingId(id)
    if (!id) {
      setLoading(false)
      return
    }
    let cancelled = false
    getBooking(id)
      .then((b) => !cancelled && setBooking(b))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) return <p className="mx-auto max-w-3xl px-5 py-16 text-sm text-muted-foreground">Loading…</p>

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 lg:px-8">
      <Link
        href="/tutors"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" /> Tutors
      </Link>

      <h1 className="mt-4 font-display text-3xl font-bold text-foreground">Session summary</h1>

      {booking ? (
        <div className="mt-4 rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-foreground">
            {booking.tutor_name ? `${booking.tutor_name} · ` : ''}
            {new Date(booking.start_utc).toLocaleString([], {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Booking {booking.status.replace(/_/g, ' ')} · payment {booking.payment_status}
          </p>
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          {bookingId ? 'That booking was not found on your account.' : 'No booking selected.'}
        </p>
      )}

      <section className="mt-6 rounded-2xl border border-dashed border-border p-5">
        <h2 className="flex items-center gap-2 font-display text-base font-semibold text-foreground">
          <CircleSlash className="size-4 text-muted-foreground" /> Tutor notes are not available yet
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The pathway calls for the tutor to save strengths, next steps and a learner-visible
          summary, then close the session. Neither route exists on the server, so there is nowhere to
          send them:
        </p>
        <ul className="mt-3 flex flex-col gap-1 font-mono text-xs text-muted-foreground">
          <li>{SESSION_ROUTES_UNAVAILABLE.notes}</li>
          <li>{SESSION_ROUTES_UNAVAILABLE.end}</li>
        </ul>
        <p className="mt-3 text-sm text-muted-foreground">
          The screens are built against these contracts, so they will fill in as soon as the routes
          exist. Nothing is stored locally in the meantime, because a note that looks saved but is
          not would be worse than none.
        </p>
      </section>

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

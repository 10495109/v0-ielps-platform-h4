'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Video, Mic, ShieldAlert, ExternalLink, CheckCircle2, XCircle } from 'lucide-react'
import {
  getBooking,
  joinLiveRoom,
  liveRoomState,
  type Booking,
  type JoinResult,
  type LiveRoomState,
} from '@/lib/tutoring-adapter'

type DeviceCheck = 'idle' | 'checking' | 'ok' | 'blocked' | 'missing'

const STATE_COPY: Record<LiveRoomState, string> = {
  not_available: 'This lesson is not open. A room is only created once the booking is confirmed and paid.',
  precheck: 'The room opens shortly before your lesson starts. Run your camera and microphone checks now.',
  waiting_for_tutor: 'Waiting for your tutor to join.',
  waiting_for_learner: 'Waiting for the learner to join.',
  ready_to_join: 'Your room is open.',
  connected: 'Connected.',
  reconnecting: 'Reconnecting…',
  ended: 'This lesson has ended.',
}

/**
 * Live classroom lobby.
 *
 * Device checks happen locally in the browser. The room itself is never created
 * here — joining asks the server, which refuses unless the booking is confirmed,
 * paid, and inside its join window, and then issues a participant-scoped token.
 */
export function LiveLobby() {
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [camera, setCamera] = useState<DeviceCheck>('idle')
  const [mic, setMic] = useState<DeviceCheck>('idle')
  const [join, setJoin] = useState<JoinResult | null>(null)
  const [joining, setJoining] = useState(false)

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

  async function check(kind: 'camera' | 'mic') {
    const set = kind === 'camera' ? setCamera : setMic
    set('checking')
    try {
      const stream = await navigator.mediaDevices.getUserMedia(
        kind === 'camera' ? { video: true } : { audio: true },
      )
      stream.getTracks().forEach((t) => t.stop())
      set('ok')
    } catch (e) {
      set((e as DOMException)?.name === 'NotFoundError' ? 'missing' : 'blocked')
    }
  }

  async function enterRoom() {
    if (!bookingId) return
    setJoining(true)
    try {
      setJoin(await joinLiveRoom(bookingId))
    } finally {
      setJoining(false)
    }
  }

  if (loading) return <p className="mx-auto max-w-3xl px-5 py-16 text-sm text-muted-foreground">Loading…</p>

  const state = liveRoomState(booking)

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 lg:px-8">
      <Link
        href="/tutors"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" /> Tutors
      </Link>

      <h1 className="mt-4 font-display text-3xl font-bold text-foreground">Lesson lobby</h1>

      {booking ? (
        <p className="mt-1 text-sm text-muted-foreground">
          {booking.tutor_name ? `${booking.tutor_name} · ` : ''}
          {new Date(booking.start_utc).toLocaleString([], {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit',
          })}{' '}
          · {booking.status.replace(/_/g, ' ')}
        </p>
      ) : (
        <p className="mt-1 text-sm text-muted-foreground">
          {bookingId ? 'That booking was not found on your account.' : 'No booking selected.'}
        </p>
      )}

      <p className="mt-4 rounded-2xl border border-border bg-card p-4 text-sm text-foreground">
        {STATE_COPY[state]}
      </p>

      {/* Device checks */}
      <section className="mt-6 grid gap-3 sm:grid-cols-2">
        {(
          [
            { kind: 'camera' as const, label: 'Camera', icon: Video, value: camera },
            { kind: 'mic' as const, label: 'Microphone', icon: Mic, value: mic },
          ]
        ).map(({ kind, label, icon: Icon, value }) => (
          <div key={kind} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Icon className="size-4" /> {label}
              </span>
              {value === 'ok' ? (
                <CheckCircle2 className="size-4 text-success" />
              ) : value === 'blocked' || value === 'missing' ? (
                <XCircle className="size-4 text-destructive" />
              ) : null}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {value === 'idle' && 'Not checked yet.'}
              {value === 'checking' && 'Checking…'}
              {value === 'ok' && 'Working.'}
              {value === 'blocked' && 'Permission denied in your browser.'}
              {value === 'missing' && 'No device found.'}
            </p>
            <button
              type="button"
              onClick={() => check(kind)}
              className="mt-3 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground"
            >
              {value === 'idle' ? 'Run check' : 'Check again'}
            </button>
          </div>
        ))}
      </section>

      <button
        type="button"
        onClick={enterRoom}
        disabled={!booking || joining}
        className="mt-6 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
      >
        {joining ? 'Opening room…' : 'Join room'}
      </button>

      {join ? (
        <div className="mt-4 rounded-2xl border border-border bg-soft p-4 text-sm">
          {join.state === 'joined' ? (
            <>
              <p className="font-medium text-foreground">
                Room ready — joining as {join.role} on {join.provider}.
              </p>
              <a
                href={join.joinUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 font-semibold text-primary"
              >
                Open the classroom <ExternalLink className="size-3.5" />
              </a>
            </>
          ) : join.state === 'not_confirmed' ? (
            <p className="text-muted-foreground">
              The server will not open a room for this booking yet: it becomes joinable once it is
              confirmed and paid.
            </p>
          ) : join.state === 'window_closed' ? (
            <p className="text-muted-foreground">
              The join window is closed. It opens shortly before the lesson
              {join.opensAt ? ` (${new Date(join.opensAt).toLocaleString()})` : ''}.
            </p>
          ) : join.state === 'provider_unconfigured' ? (
            <p className="text-muted-foreground">
              The video provider is not configured on the server, so no room can be created. This
              needs Daily credentials adding server-side.
            </p>
          ) : (
            <p className="text-muted-foreground">The room could not be opened: {join.reason}.</p>
          )}
        </div>
      ) : null}

      <p className="mt-8 flex items-start gap-2 rounded-2xl border border-border p-4 text-xs text-muted-foreground">
        <ShieldAlert className="mt-0.5 size-4 shrink-0" />
        Keep everything on the platform. Never share personal contact details, and use the report
        button in the classroom if anything makes you uncomfortable.
      </p>

      {booking ? (
        <Link
          href={`/tutor/summary?booking=${encodeURIComponent(booking.id)}`}
          className="mt-4 inline-block text-sm font-semibold text-primary"
        >
          Session summary
        </Link>
      ) : null}
    </div>
  )
}

import { authFetch } from '@/lib/eilps-auth'

/**
 * Tutor Live Classroom — mapped onto the routes the server actually exposes.
 *
 * The developer pack specifies /api/tutors, /api/tutor/bookings,
 * /api/live-room/:id/token and /api/progress/summary. None of those exist; the
 * live server serves this pathway from /api/tutoring/*. Per the project rule,
 * the frontend adapts rather than the backend growing duplicate routes.
 *
 *   pack contract                        real route
 *   GET  /api/tutors                     GET  /api/tutoring/tutors
 *   GET  /api/tutors/:id                 (no detail route — read from the list)
 *   GET  /api/tutors/:id/availability    GET  /api/tutoring/tutors/:id/availability
 *   POST /api/tutor/bookings             POST /api/tutoring/bookings
 *   GET  /api/tutor/bookings/:id         (no detail route — read from the list)
 *   POST /api/live-room/:id/token        POST /api/tutoring/bookings/:id/room
 *                                        then POST /api/tutoring/bookings/:id/join
 *   POST /api/tutor/session/:id/notes    (does not exist)
 *   POST /api/tutor/session/:id/end      (does not exist)
 *   GET  /api/progress/summary           GET  /api/progress
 *
 * The two session routes have no server equivalent at all, so the summary screen
 * reports them as unavailable rather than pretending to save notes.
 */

export type TutorBookingState =
  | 'draft'
  | 'payment_pending'
  | 'confirmed'
  | 'lobby_open'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show'
  | 'refunded'

export type LiveRoomState =
  | 'not_available'
  | 'precheck'
  | 'waiting_for_tutor'
  | 'waiting_for_learner'
  | 'ready_to_join'
  | 'connected'
  | 'reconnecting'
  | 'ended'

export type Tutor = {
  id: string
  name: string
  accent?: string | null
  country?: string | null
  timezone?: string | null
  headline?: string | null
  bio?: string | null
  price_cents?: number | null
  rating?: string | number | null
  levels?: string[] | null
  specialties?: string[] | null
}

export type Slot = { startUtc: number | string; endUtc?: number | string; label?: string }

export type Booking = {
  id: string
  start_utc: string
  end_utc: string
  kind: string
  status: TutorBookingState
  payment_status: 'unpaid' | 'pending' | 'paid' | 'prepaid' | 'refunded' | string
  tutor_name?: string
  is_tutor?: boolean
  video_provider?: string | null
  provider_room_id?: string | null
  join_opens_at?: string
  join_closes_at?: string
}

async function get<T>(path: string): Promise<{ ok: boolean; status: number; body: T | null }> {
  const res = await authFetch(path)
  const body = (await res.json().catch(() => null)) as T | null
  return { ok: res.ok, status: res.status, body }
}

async function post<T>(path: string, payload?: unknown): Promise<{ ok: boolean; status: number; body: T | null; error?: string }> {
  const res = await authFetch(path, {
    method: 'POST',
    body: payload === undefined ? undefined : JSON.stringify(payload),
  })
  const body = (await res.json().catch(() => null)) as (T & { error?: string; message?: string }) | null
  return { ok: res.ok, status: res.status, body, error: body?.error || body?.message }
}

/* ── Marketplace ─────────────────────────────────────────────────────────── */

export async function listTutors(): Promise<Tutor[]> {
  const r = await get<{ tutors: Tutor[] }>('/api/tutoring/tutors')
  return r.body?.tutors ?? []
}

/**
 * There is no per-tutor detail route, so the profile screen resolves its tutor
 * from the marketplace list. Reads the id from ?tutor= rather than a path
 * segment, because the portal is a static export and cannot pre-render unknown
 * ids — the same approach the lesson player uses for ?lesson=.
 */
export async function getTutor(tutorId: string): Promise<Tutor | null> {
  const tutors = await listTutors()
  return tutors.find((t) => t.id === tutorId) ?? null
}

export type AvailabilityResult =
  | { state: 'ok'; slots: Slot[] }
  | { state: 'no_timezone' }
  | { state: 'unavailable'; reason?: string }

/**
 * Availability is derived server-side from the tutor's timezone. A tutor record
 * with no timezone answers 404 tutor_not_found, which is a data gap rather than
 * a missing feature, so it is reported separately.
 */
export async function getAvailability(tutor: Tutor, slotMinutes = 30): Promise<AvailabilityResult> {
  if (!tutor.timezone) return { state: 'no_timezone' }
  const params = new URLSearchParams({ slot: String(slotMinutes) })
  const r = await get<{ slots?: Slot[] }>(
    `/api/tutoring/tutors/${encodeURIComponent(tutor.id)}/availability?${params}`,
  )
  if (!r.ok) return { state: 'unavailable', reason: String((r.body as { error?: string })?.error ?? r.status) }
  return { state: 'ok', slots: r.body?.slots ?? [] }
}

/* ── Entitlement and booking ─────────────────────────────────────────────── */

export type Entitlement = {
  tier: string
  status: string
  allowed: boolean
  requiredTiers: string[]
}

/** Live booking is gated by subscription tier, and the server is the authority. */
export async function getLiveBookingEntitlement(): Promise<Entitlement | null> {
  const r = await get<{
    subscription?: { tier?: string; status?: string }
    entitlements?: Record<string, string[]>
  }>('/api/billing/subscription')
  if (!r.ok || !r.body) return null
  const tier = String(r.body.subscription?.tier ?? 'free')
  const required = r.body.entitlements?.live_booking ?? []
  return {
    tier,
    status: String(r.body.subscription?.status ?? 'unknown'),
    allowed: required.includes(tier),
    requiredTiers: required,
  }
}

export type CreateBookingResult = {
  ok: boolean
  status: number
  bookingId?: string
  confirmed?: boolean
  paymentStatus?: string
  checkoutUrl?: string
  message?: string
  error?: string
}

/**
 * The server creates the booking as payment_pending and only confirms it once
 * Stripe or a prepaid credit has paid for it. It returns a checkout URL for the
 * unpaid case; the client never marks a booking confirmed itself.
 */
export async function createBooking(input: {
  tutorId: string
  startUtc: string
  slotMinutes?: number
  kind?: 'lesson' | 'conversation'
  learnerTz?: string
}): Promise<CreateBookingResult> {
  const r = await post<{
    bookingId?: string
    confirmed?: boolean
    paymentStatus?: string
    checkoutUrl?: string
    message?: string
  }>('/api/tutoring/bookings', {
    tutorId: input.tutorId,
    startUtc: input.startUtc,
    slotMinutes: input.slotMinutes ?? 30,
    kind: input.kind ?? 'lesson',
    learnerTz:
      input.learnerTz ??
      (typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC'),
    successUrl: typeof window !== 'undefined' ? window.location.href : undefined,
    cancelUrl: typeof window !== 'undefined' ? window.location.href : undefined,
  })
  return { ok: r.ok, status: r.status, ...(r.body ?? {}), error: r.error }
}

export async function listBookings(): Promise<Booking[]> {
  const r = await get<{ bookings: Booking[] }>('/api/tutoring/bookings')
  return r.body?.bookings ?? []
}

export async function getBooking(bookingId: string): Promise<Booking | null> {
  const bookings = await listBookings()
  return bookings.find((b) => b.id === bookingId) ?? null
}

/* ── Live room ───────────────────────────────────────────────────────────── */

export type JoinResult =
  | { state: 'joined'; joinUrl: string; role: string; provider: string; startsAt: string; endsAt: string }
  | { state: 'not_confirmed' }
  | { state: 'window_closed'; opensAt?: string; closesAt?: string }
  | { state: 'provider_unconfigured' }
  | { state: 'error'; reason?: string }

/**
 * Two server calls, in this order: create the room, then request a
 * participant-scoped token. The frontend never talks to the video provider
 * directly and never mints a token — both are the server's job, and it refuses
 * unless the booking is confirmed and paid.
 */
export async function joinLiveRoom(bookingId: string): Promise<JoinResult> {
  const room = await post<{ roomReady?: boolean }>(
    `/api/tutoring/bookings/${encodeURIComponent(bookingId)}/room`,
  )
  if (!room.ok) {
    if (room.status === 409) return { state: 'not_confirmed' }
    if (room.status === 503) return { state: 'provider_unconfigured' }
    return { state: 'error', reason: room.error }
  }

  const join = await post<{
    joinUrl?: string
    role?: string
    provider?: string
    startsAt?: string
    endsAt?: string
    opensAt?: string
    closesAt?: string
  }>(`/api/tutoring/bookings/${encodeURIComponent(bookingId)}/join`)

  if (!join.ok) {
    if (join.status === 403) {
      return { state: 'window_closed', opensAt: join.body?.opensAt, closesAt: join.body?.closesAt }
    }
    if (join.status === 409) return { state: 'not_confirmed' }
    if (join.status === 503) return { state: 'provider_unconfigured' }
    return { state: 'error', reason: join.error }
  }
  return {
    state: 'joined',
    joinUrl: String(join.body?.joinUrl ?? ''),
    role: String(join.body?.role ?? 'learner'),
    provider: String(join.body?.provider ?? 'daily'),
    startsAt: String(join.body?.startsAt ?? ''),
    endsAt: String(join.body?.endsAt ?? ''),
  }
}

/** Maps a booking plus the join window onto the pack's live room states. */
export function liveRoomState(booking: Booking | null, now = Date.now()): LiveRoomState {
  if (!booking) return 'not_available'
  if (booking.status === 'completed') return 'ended'
  if (booking.status !== 'confirmed') return 'not_available'
  const opens = booking.join_opens_at ? Date.parse(booking.join_opens_at) : Date.parse(booking.start_utc)
  const closes = booking.join_closes_at ? Date.parse(booking.join_closes_at) : Date.parse(booking.end_utc)
  if (now < opens) return 'precheck'
  if (now > closes) return 'ended'
  return 'ready_to_join'
}

export const SAFEGUARDING_PATH = '/api/tutoring/safeguarding-policy'

/**
 * Session notes and end-of-session both correspond to routes the pack specifies
 * but the server does not implement. Exported so the summary screen can state
 * that plainly instead of appearing to save something.
 */
export const SESSION_ROUTES_UNAVAILABLE = {
  notes: 'POST /api/tutor/session/:bookingId/notes',
  end: 'POST /api/tutor/session/:bookingId/end',
} as const

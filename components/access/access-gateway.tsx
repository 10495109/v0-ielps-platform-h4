'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, Loader2, ShieldCheck } from 'lucide-react'
import { PATHWAYS, type Pathway } from '@/lib/ielps-data'
import { ACCENT } from '@/lib/apps/accent'
import { authApi } from '@/lib/adapters'
import { useEilps } from '@/lib/use-eilps'

/**
 * The corrected Access Panel gateway.
 *
 * The pathway choice happens once, here, on a page of its own — not as a
 * chooser overlaid on the public landing. The learner arrives at /learner/,
 * picks the route that describes them, and continues into that route's own
 * onboarding. Choosing again is always one click away, but it is a deliberate
 * step back rather than a decision repeated on every surface.
 *
 * Everything on screen is the platform's own: the routes come from
 * GET /api/auth/pathways, and each route's form posts to the canonical
 * endpoint that route already uses. No new backend route is introduced.
 */

/** The server's account-type id for each pathway. Mirrors the pathways feed. */
const ACCOUNT_TYPE: Record<string, string> = {
  junior: 'student_classroom_u12',
  adult: 'student_12_plus',
  parents: 'parent',
  teachers: 'teacher',
  tutors: 'live_tutor',
  schools: 'school',
  studio: 'studio',
}

type LivePathway = {
  id?: string
  slug?: string
  key?: string
  name?: string
  title?: string
  label?: string
  description?: string
  blurb?: string
  enabled?: boolean
  available?: boolean
}

const LIVE_ID_TO_SLUG: Record<string, string> = {
  student_classroom_u12: 'junior',
  student_12_plus: 'adult',
  parent: 'parents',
  teacher: 'teachers',
  live_tutor: 'tutors',
  school: 'schools',
  studio: 'studio',
}

function normalizeLive(raw: unknown): Record<string, LivePathway> {
  const r = raw as { accountTypes?: unknown[]; pathways?: unknown[]; data?: unknown[] }
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray(r?.accountTypes)
      ? r.accountTypes
      : Array.isArray(r?.pathways)
        ? r.pathways
        : Array.isArray(r?.data)
          ? r.data
          : []
  if (list.length === 0) throw new Error('no_account_types')
  const map: Record<string, LivePathway> = {}
  for (const item of list as LivePathway[]) {
    const rawId = (item.id || item.slug || item.key || '').toString()
    const slug = LIVE_ID_TO_SLUG[rawId] || rawId.toLowerCase()
    if (slug) map[slug] = item
  }
  return map
}

function RouteCard({
  pathway,
  live,
  onChoose,
}: {
  pathway: Pathway
  live?: LivePathway
  onChoose: () => void
}) {
  const a = ACCENT[pathway.accent]
  const Icon = pathway.icon
  const name = live?.name || live?.title || live?.label || pathway.name
  const blurb = live?.description || live?.blurb || pathway.blurb
  const disabled = live?.enabled === false || live?.available === false

  return (
    <button
      type="button"
      onClick={onChoose}
      disabled={disabled}
      className="group flex h-full flex-col rounded-2xl border border-border bg-card p-5 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_18px_44px_-24px_rgba(13,0,77,0.45)] disabled:pointer-events-none disabled:opacity-55"
    >
      <span className={`grid size-11 place-items-center rounded-xl ${a.solid}`}>
        <Icon className="size-5" />
      </span>
      <p className={`mt-4 text-[11px] font-black uppercase tracking-wider ${a.text}`}>{pathway.short}</p>
      <h3 className="mt-1 font-display text-lg font-bold leading-snug text-foreground">{name}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{blurb}</p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-primary">
        {disabled ? 'Not available yet' : 'Continue'}
        {disabled ? null : (
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        )}
      </span>
    </button>
  )
}

function Field({
  label,
  ...input
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">{label}</span>
      <input
        {...input}
        className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary/50"
      />
    </label>
  )
}

function Onboarding({ pathway, onBack }: { pathway: Pathway; onBack: () => void }) {
  const router = useRouter()
  const a = ACCENT[pathway.accent]
  const Icon = pathway.icon
  const isJunior = pathway.slug === 'junior'
  const [mode, setMode] = useState<'signin' | 'create'>(isJunior ? 'signin' : 'create')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string>()
  const [form, setForm] = useState({
    classCode: '',
    studentIdentifier: '',
    fullName: '',
    email: '',
    password: '',
  })

  const set = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm((current) => ({ ...current, [key]: event.target.value }))

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setPending(true)
    setError(undefined)
    try {
      if (isJunior) {
        await authApi.studentLogin({
          classCode: form.classCode.trim(),
          studentIdentifier: form.studentIdentifier.trim(),
          password: form.password,
        })
      } else if (mode === 'signin') {
        await authApi.login({ email: form.email.trim(), password: form.password })
      } else {
        await authApi.register({
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          password: form.password,
          accountType: ACCOUNT_TYPE[pathway.slug],
        })
      }
      router.push(`/app/${pathway.slug}`)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'That did not work. Please check the details and try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <aside className="rounded-2xl border border-border bg-card p-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Change route
        </button>
        <span className={`mt-5 grid size-12 place-items-center rounded-xl ${a.solid}`}>
          <Icon className="size-6" />
        </span>
        <p className={`mt-4 text-[11px] font-black uppercase tracking-wider ${a.text}`}>{pathway.short}</p>
        <h2 className="mt-1 font-display text-2xl font-bold leading-tight text-foreground">{pathway.name}</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{pathway.blurb}</p>
        <ul className="mt-5 space-y-2.5 border-t border-border pt-5">
          {[
            'You choose your route once.',
            'The next screens belong to this route only.',
            isJunior
              ? 'Younger learners join with a class code, never an open sign-up.'
              : 'Placement happens inside your route, where it applies.',
          ].map((line) => (
            <li key={line} className="flex gap-2.5 text-sm text-muted-foreground">
              <Check className={`mt-0.5 size-4 shrink-0 ${a.text}`} />
              {line}
            </li>
          ))}
        </ul>
      </aside>

      <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-6">
        {isJunior ? (
          <>
            <h3 className="font-display text-xl font-bold text-foreground">Join your class</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Use the class code your teacher or parent gave you.
            </p>
            <div className="mt-5 space-y-4">
              <Field
                label="Class code"
                value={form.classCode}
                onChange={set('classCode')}
                placeholder="CLS-XXXXXX"
                autoComplete="off"
                required
              />
              <Field
                label="Your name"
                value={form.studentIdentifier}
                onChange={set('studentIdentifier')}
                placeholder="The name your teacher set up"
                autoComplete="username"
                required
              />
              <Field
                label="Password"
                type="password"
                value={form.password}
                onChange={set('password')}
                autoComplete="current-password"
                required
              />
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display text-xl font-bold text-foreground">
                {mode === 'create' ? 'Create your account' : 'Sign in'}
              </h3>
              <div className="inline-flex rounded-full border border-border p-0.5">
                {(['create', 'signin'] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setMode(option)}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                      mode === option ? a.solid : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {option === 'create' ? 'New' : 'Existing'}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-5 space-y-4">
              {mode === 'create' ? (
                <Field
                  label="Full name"
                  value={form.fullName}
                  onChange={set('fullName')}
                  autoComplete="name"
                  required
                />
              ) : null}
              <Field
                label="Email"
                type="email"
                value={form.email}
                onChange={set('email')}
                autoComplete="email"
                required
              />
              <Field
                label="Password"
                type="password"
                value={form.password}
                onChange={set('password')}
                autoComplete={mode === 'create' ? 'new-password' : 'current-password'}
                required
              />
            </div>
          </>
        )}

        {error ? (
          <p role="alert" className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-foreground">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold disabled:opacity-60 ${a.solid}`}
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          {isJunior ? 'Start learning' : mode === 'create' ? 'Create account and continue' : 'Sign in and continue'}
        </button>
        <p className="mt-3 inline-flex items-start gap-1.5 text-xs leading-5 text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
          {isJunior
            ? 'Class accounts are created by a teacher or parent. IELPS never asks a young learner for an email address.'
            : 'Your details go to IELPS only, and you can change your route at any time from this screen.'}
        </p>
      </form>
    </div>
  )
}

export function AccessGateway() {
  const { data: liveMap } = useEilps<Record<string, LivePathway>>(
    '/api/auth/pathways',
    {},
    normalizeLive,
  )
  const [chosen, setChosen] = useState<Pathway | null>(null)

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-6xl px-5 py-10 lg:px-8 lg:py-14">
        {chosen ? (
          <Onboarding pathway={chosen} onBack={() => setChosen(null)} />
        ) : (
          <>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="max-w-2xl">
                <p className="text-[11px] font-black uppercase tracking-wider text-primary">Access Panel</p>
                <h1 className="mt-1.5 text-balance font-display text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                  Choose your access route
                </h1>
                <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
                  Pick the one that describes you. You only do this once — the next screens, and
                  everything after them, belong to the route you choose here.
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {PATHWAYS.map((pathway) => (
                <RouteCard
                  key={pathway.slug}
                  pathway={pathway}
                  live={liveMap[pathway.slug]}
                  onChoose={() => setChosen(pathway)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}

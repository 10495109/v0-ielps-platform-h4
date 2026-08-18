'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { PATHWAYS, type Pathway } from '@/lib/ielps-data'
import { useEilps } from '@/lib/use-eilps'
import { SourceBadge } from '@/components/app/source-badge'
import { SHOW_ENDPOINT_LABELS } from '@/lib/developer-surface'

const ACCENT: Record<Pathway['accent'], { badge: string; bar: string; text: string }> = {
  primary: { badge: 'bg-primary text-primary-foreground', bar: 'bg-primary', text: 'text-primary' },
  secondary: { badge: 'bg-secondary text-secondary-foreground', bar: 'bg-secondary', text: 'text-secondary' },
  turquoise: { badge: 'bg-turquoise text-accent-foreground', bar: 'bg-turquoise', text: 'text-turquoise' },
  gold: { badge: 'bg-gold text-indigo', bar: 'bg-gold', text: 'text-gold' },
  indigo: { badge: 'bg-indigo text-primary-foreground', bar: 'bg-indigo', text: 'text-indigo' },
}

/** Live pathway payload shape returned by GET /api/auth/pathways. */
type LivePathway = {
  slug?: string
  key?: string
  id?: string
  name?: string
  title?: string
  label?: string
  role?: string
  description?: string
  blurb?: string
  defaultRoute?: string
  enabled?: boolean
  available?: boolean
}

/** Map the live server's account-type ids onto this app's mini-app slugs. */
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
  const r = raw as {
    accountTypes?: unknown[]
    pathways?: unknown[]
    data?: unknown[]
  }
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

function MethodBadge({ method }: { method: string }) {
  const isGet = method === 'GET'
  return (
    <span
      className={`rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold ${
        isGet ? 'bg-secondary/15 text-secondary' : 'bg-primary/15 text-primary'
      }`}
    >
      {method}
    </span>
  )
}

function PathwayCard({
  pathway,
  live,
}: {
  pathway: Pathway
  live?: LivePathway
}) {
  const Icon = pathway.icon
  const accent = ACCENT[pathway.accent]
  const name = live?.name || live?.title || live?.label || pathway.name
  const blurb = live?.description || live?.blurb || pathway.blurb
  const disabled = live?.enabled === false || live?.available === false

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow duration-200 hover:shadow-[0_10px_28px_-16px_rgba(13,0,77,0.35)]">
      <div className="relative aspect-[3/2] overflow-hidden bg-muted">
        <Image
          src={pathway.image || '/placeholder.svg'}
          alt={`${name} pathway illustration`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className={`h-[3px] w-full ${accent.bar}`} />

      <div className="flex flex-1 flex-col p-4">
        <p className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider ${accent.text}`}>
          <Icon className="h-3 w-3" />
          {pathway.short}
        </p>
        <h3 className="mt-1.5 text-pretty font-display text-base font-bold leading-tight text-foreground">
          {name}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
          {blurb}
        </p>

        {/* The endpoint strip that sat here until 18 August 2026 printed the
            routes each card hydrates from — "POST /api/auth/register" and the
            rest — on a card a learner reads. The conformance correction that
            day removed that from learner-facing surfaces. The card still
            hydrates from exactly the same routes; only the label is gone.
            pathway.backend is unchanged and remains the integration record. */}
        {SHOW_ENDPOINT_LABELS && (
          <div className="mt-3 flex flex-wrap gap-1">
            {pathway.backend.slice(0, 2).map((ep) => (
              <span
                key={ep.method + ep.path}
                className="inline-flex items-center gap-1 rounded border border-border bg-background px-1.5 py-0.5"
              >
                <MethodBadge method={ep.method} />
                <code className="max-w-[9rem] truncate font-mono text-[10px] text-muted-foreground">
                  {ep.path}
                </code>
              </span>
            ))}
            {pathway.backend.length > 2 && (
              <span className="inline-flex items-center rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] font-bold text-muted-foreground">
                +{pathway.backend.length - 2}
              </span>
            )}
          </div>
        )}

        <Link
          href={`/app/${pathway.slug}`}
          aria-disabled={disabled}
          className={`mt-3.5 inline-flex min-h-8 items-center gap-1 text-xs font-bold transition-colors ${
            disabled
              ? 'pointer-events-none text-muted-foreground'
              : `${accent.text} hover:underline`
          }`}
        >
          {disabled ? 'Coming soon' : 'Open mini-app'}
          <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
        </Link>
      </div>
    </article>
  )
}

export function PathwaysSection() {
  const { data: liveMap, source } = useEilps<Record<string, LivePathway>>(
    '/api/auth/pathways',
    {},
    normalizeLive,
  )

  return (
    <section id="pathways" className="border-b border-border bg-card/40">
      <div className="mx-auto max-w-7xl scroll-mt-20 px-5 py-10 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-primary">Explore</p>
            <h2 className="mt-1 font-display text-2xl font-black tracking-tight text-foreground sm:text-3xl">
              Seven account types, seven mini-apps
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {SHOW_ENDPOINT_LABELS && (
              <span className="hidden items-center rounded-full border border-border bg-card px-3 py-1 text-[11px] font-bold text-muted-foreground sm:inline-flex">
                GET /api/auth/pathways
              </span>
            )}
            {/* The Live / Empty / Unavailable badge stays. It is not an
                endpoint label — it tells a reader whether what they are looking
                at came from the server, which the truthfulness rules require. */}
            <SourceBadge source={source} />
          </div>
        </div>
        <p className="mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">
          Each account type is its own mini-application with a dedicated onboarding, dashboard and
          pathway screens — hydrated live from the EILPS server. Open one to explore it.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {PATHWAYS.map((p) => (
            <PathwayCard key={p.slug} pathway={p} live={liveMap[p.slug]} />
          ))}
        </div>
      </div>
    </section>
  )
}

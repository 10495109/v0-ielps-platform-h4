'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Star, Globe, Clock, Search } from 'lucide-react'
import { listTutors, type Tutor } from '@/lib/tutoring-adapter'
import { SourceBadge } from '@/components/app/source-badge'
import type { DataSource } from '@/lib/use-eilps'

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

function money(cents?: number | null, currency = 'USD') {
  if (typeof cents !== 'number') return '—'
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(cents / 100)
}

/**
 * Tutor marketplace. Filters run over the real tutor list rather than asking the
 * server, because the list route takes no filter parameters — doing it here
 * keeps the filters honest instead of implying server-side search that is not
 * there.
 */
export function TutorMarketplace() {
  const [tutors, setTutors] = useState<Tutor[]>([])
  const [source, setSource] = useState<DataSource>('loading')
  const [level, setLevel] = useState<string>('')
  const [skill, setSkill] = useState<string>('')
  const [maxPrice, setMaxPrice] = useState<number>(0)
  const [q, setQ] = useState('')

  useEffect(() => {
    let cancelled = false
    listTutors()
      .then((list) => {
        if (cancelled) return
        setTutors(list)
        setSource(list.length ? 'live' : 'unavailable')
      })
      .catch(() => !cancelled && setSource('unavailable'))
    return () => {
      cancelled = true
    }
  }, [])

  const skills = useMemo(
    () => [...new Set(tutors.flatMap((t) => t.specialties ?? []))].sort(),
    [tutors],
  )
  const priceCeiling = useMemo(
    () => Math.max(0, ...tutors.map((t) => t.price_cents ?? 0)),
    [tutors],
  )

  const filtered = useMemo(
    () =>
      tutors.filter((t) => {
        if (level && !(t.levels ?? []).includes(level)) return false
        if (skill && !(t.specialties ?? []).includes(skill)) return false
        if (maxPrice && (t.price_cents ?? 0) > maxPrice) return false
        if (q && !`${t.name} ${t.bio ?? ''} ${t.headline ?? ''}`.toLowerCase().includes(q.toLowerCase()))
          return false
        return true
      }),
    [tutors, level, skill, maxPrice, q],
  )

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Online and live tutors</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Book a one-to-one lesson. Tutor sessions support your course — they never replace it.
          </p>
        </div>
        <SourceBadge source={source} />
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search tutors"
            className="w-56 rounded-xl border border-border bg-card py-2 pl-9 pr-3 text-sm outline-none focus:border-foreground/30"
          />
        </label>

        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none focus:border-foreground/30"
        >
          <option value="">Any level</option>
          {LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>

        <select
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
          className="rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none focus:border-foreground/30"
        >
          <option value="">Any focus</option>
          {skills.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {priceCeiling > 0 && (
          <label className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm">
            <span className="text-muted-foreground">Up to</span>
            <input
              type="range"
              min={0}
              max={priceCeiling}
              step={100}
              value={maxPrice || priceCeiling}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-28"
            />
            <span className="tabular-nums font-medium">{money(maxPrice || priceCeiling)}</span>
          </label>
        )}

        <span className="ml-auto text-xs text-muted-foreground">
          {filtered.length} of {tutors.length}
        </span>
      </div>

      {source === 'unavailable' ? (
        <p className="mt-10 rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
          The tutor directory is not returning any tutors right now.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <article
              key={t.id}
              className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate font-display text-base font-semibold text-foreground">
                    {t.name}
                  </h2>
                  {t.accent || t.country ? (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <Globe className="size-3" />
                      {[t.accent, t.country].filter(Boolean).join(' · ')}
                    </p>
                  ) : null}
                </div>
                {t.rating ? (
                  <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-foreground">
                    <Star className="size-3.5 fill-gold text-gold" />
                    {Number(t.rating).toFixed(1)}
                  </span>
                ) : null}
              </div>

              {t.bio ? (
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{t.bio}</p>
              ) : null}

              <div className="mt-3 flex flex-wrap gap-1">
                {(t.levels ?? []).map((l) => (
                  <span key={l} className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium">
                    {l}
                  </span>
                ))}
                {(t.specialties ?? []).map((s) => (
                  <span key={s} className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary">
                    {s}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
                <div>
                  <p className="font-display text-lg font-bold text-foreground">
                    {money(t.price_cents)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">per lesson</p>
                </div>
                <Link
                  href={`/tutors/profile?tutor=${encodeURIComponent(t.id)}`}
                  className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                >
                  View &amp; book
                </Link>
              </div>

              {!t.timezone ? (
                <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Clock className="size-3" />
                  No availability published yet
                </p>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

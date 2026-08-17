'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { ielpsFetch } from '@/lib/eilps-http'

/**
 * The band shown when a visitor arrives having already chosen a CEFR level.
 * Approved and live since 2026-08-13; carried into this release so a promotion
 * cannot lose it.
 *
 * Two rules govern it:
 *  - With no level in the address it renders nothing at all, so the approved
 *    14 August panel baseline is unchanged. The band only exists when a level
 *    was actually chosen.
 *  - Every figure comes from the server. Nothing is typed in here and nothing
 *    is counted at build time where it could drift from the curriculum.
 *
 * It reads GET /api/curriculum/deep-catalog because that is the only route that
 * carries per-level units and lessons — /api/curriculum/deep-summary returns
 * platform totals only, and no per-level route exists. A duplicate backend
 * route is deliberately not introduced to make this lighter. The catalogue is
 * requested only when a level is actually in the address, never to draw the
 * dashboard.
 */

const LEVEL_IDS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const

type Lesson = { id?: string; title?: string }
type Unit = { lessons?: Lesson[] }
type CatalogLevel = { level?: string; title?: string; units?: Unit[] }

type Summary = {
  id: string
  title: string
  units: number
  lessons: number
  firstLessonTitle: string | null
}

/** null = still loading, false = the catalogue could not be read. */
type State = Summary | null | false

function summarise(raw: CatalogLevel): Summary {
  const units = raw.units ?? []
  const lessons = units.reduce((n, u) => n + (u.lessons?.length ?? 0), 0)
  const first = units[0]?.lessons?.[0]
  return {
    id: String(raw.level ?? ''),
    title: String(raw.title ?? ''),
    units: units.length,
    lessons,
    firstLessonTitle: first?.title ?? null,
  }
}

export function LevelBand() {
  const searchParams = useSearchParams()
  const [summary, setSummary] = useState<State>(null)

  // Read straight from the address during render rather than assigning state in
  // an effect, so there is no second pass and nothing to keep in sync.
  const asked = (searchParams.get('level') ?? '').toUpperCase()
  const level = LEVEL_IDS.includes(asked as (typeof LEVEL_IDS)[number]) ? asked : null

  useEffect(() => {
    if (!level) return
    let cancelled = false
    ielpsFetch<{ levels?: CatalogLevel[] }>('/api/curriculum/deep-catalog')
      .then((data) => {
        if (cancelled) return
        const found = (data?.levels ?? []).find(
          (l) => String(l.level ?? '').toUpperCase() === level,
        )
        setSummary(found ? summarise(found) : false)
      })
      .catch(() => {
        if (!cancelled) setSummary(false)
      })
    return () => {
      cancelled = true
    }
  }, [level])

  if (!level) return null

  return (
    <section id="your-level" className="scroll-mt-20 border-b border-border bg-card/40">
      <div className="mx-auto max-w-7xl px-5 py-9 lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-x-10 gap-y-7">
          <div className="min-w-0 max-w-2xl">
            {/* Deliberately not "you chose this on the home page" — someone can
                arrive from a bookmark or a shared link, and that sentence would
                then be a small lie. */}
            <span className="text-xs font-black uppercase tracking-[0.08em] text-secondary">
              Your chosen level
            </span>
            <h2 className="mt-1.5 text-balance font-display text-2xl font-black tracking-tight text-foreground sm:text-3xl">
              {/* Some level titles the server returns already begin with the
                  level id ("C1 Advanced English for…"), so prefixing blindly
                  would print it twice. */}
              {summary
                ? summary.title.toUpperCase().startsWith(summary.id)
                  ? summary.title
                  : `${summary.id} — ${summary.title}`
                : level}
            </h2>
            <p className="mt-2.5 text-pretty text-base leading-relaxed text-muted-foreground">
              {summary === null && 'Reading this level from the curriculum…'}
              {summary === false &&
                'The curriculum is not answering right now, so the size of this level is not shown.'}
              {summary &&
                `${summary.units} units and ${summary.lessons} lessons at this level.` +
                  (summary.firstLessonTitle
                    ? ` The first one is “${summary.firstLessonTitle}”.`
                    : '')}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {/* Corrected 17 Aug 2026 by the canonical routing decision.
                  This sent every visitor — junior, parent, teacher, school —
                  straight into the Adult Lesson Player, which is exactly the
                  generic Start behaviour the decision rules out. Pathway is
                  chosen first; the level stays in the address so the band above
                  keeps showing it. Copy and appearance are untouched: this is a
                  routing change only. */}
              <Link
                href="#pathways"
                className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-black text-indigo shadow-sm transition-transform hover:-translate-y-0.5"
              >
                Start the first {level} lesson
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="#pathways"
                className="inline-flex min-h-11 items-center rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-bold text-foreground transition-colors hover:border-turquoise"
              >
                Choose a pathway instead
              </Link>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
              Change level
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {LEVEL_IDS.map((id) => {
                const active = id === level
                return (
                  <Link
                    key={id}
                    href={`/?level=${id}`}
                    data-ielps-level={id}
                    aria-current={active ? 'true' : 'false'}
                    className={`inline-flex min-h-8 items-center rounded-full border px-3 py-1 text-xs font-black transition-colors ${
                      active
                        ? 'border-turquoise bg-turquoise/10 text-foreground'
                        : 'border-border bg-background text-muted-foreground hover:border-turquoise hover:text-foreground'
                    }`}
                  >
                    {id}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

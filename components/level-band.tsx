'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { ielpsFetch } from '@/lib/eilps-http'
import { getLevelBySlug } from '@/lib/cefr-levels'

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
 * Corrected 18 Aug 2026 by the canonical CEFR decision. The heading used to be
 * the course title the server returns ("A1 — Foundation English"), which put a
 * curriculum title where the level name belongs. The two are now separate, as
 * the decision requires: the level is named from the canonical table, and the
 * course title is stated as a course title.
 *
 * Corrected again 18 Aug 2026 (evening) by the crossed-message resolution. The
 * standalone CEFR ladder and the six standalone level pages are retired, and
 * this band is now the level-selection surface. Its information is ordered
 * canonically — code, reference descriptor, learner-facing name, then the
 * course title and its real unit and lesson counts — and it carries the
 * approved definition of the chosen level, that one alone. It did not become a
 * six-level catalogue and the retired Basic / Independent / Proficient grouping
 * was deliberately not brought across.
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

/** The course title on its own. Some titles the server returns already begin
 *  with the level id ("C1 Advanced English for…"); the id is printed beside the
 *  heading now, so repeating it here would say it twice. */
function courseTitle(s: Summary): string {
  const stripped = s.title.replace(new RegExp(`^${s.id}\\s*[—–-]?\\s*`, 'i'), '')
  return stripped || s.title
}

export function LevelBand() {
  const searchParams = useSearchParams()
  const [summary, setSummary] = useState<State>(null)

  // Read straight from the address during render rather than assigning state in
  // an effect, so there is no second pass and nothing to keep in sync.
  const asked = (searchParams.get('level') ?? '').toUpperCase()
  const level = LEVEL_IDS.includes(asked as (typeof LEVEL_IDS)[number]) ? asked : null
  const named = level ? getLevelBySlug(level) : undefined

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
            {/* Corrected 18 Aug 2026 to the canonical information hierarchy:
                the CEFR code, then the reference descriptor, then the
                learner-facing name, then the course title and its real counts —
                four separate things, in that order, never collapsed into one
                another. The code and descriptor lead because they are the
                reference identity of the level; the name is what the learner
                reads. Only this level is described. */}
            <p className="mt-1.5 flex items-baseline gap-2 font-display">
              <span className="text-xl font-black tracking-tight text-secondary">
                {named ? named.code : level}
              </span>
              {named && (
                <span className="text-sm font-bold text-muted-foreground">{named.summary}</span>
              )}
            </p>
            <h2 className="mt-1 text-balance font-display text-2xl font-black tracking-tight text-foreground sm:text-3xl">
              {/* The level name comes from the canonical table, not the server,
                  so it is right the moment the page paints and cannot drift. */}
              {named ? named.name : level}
            </h2>
            <p className="mt-2.5 text-pretty text-base leading-relaxed text-muted-foreground">
              {/* The approved definition of the chosen level, and only that one.
                  The six are never shown together — that was the retired
                  ladder's job, and the ladder is retired. */}
              {named && `${named.canDo} `}
              {summary === null && 'Reading this level from the curriculum…'}
              {summary === false &&
                'The curriculum is not answering right now, so the course at this level is not shown.'}
              {summary &&
                `Course: ${courseTitle(summary)} — ${summary.units} units and ${summary.lessons} lessons.` +
                  (summary.firstLessonTitle
                    ? ` The first lesson is “${summary.firstLessonTitle}”.`
                    : '')}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {/* Corrected 17 Aug 2026 by the canonical routing decision, in two
                  steps. First the destination: this sent every visitor — junior,
                  parent, teacher, school — straight into the Adult Lesson Player,
                  which is the generic Start behaviour the decision rules out.
                  Then the copy, approved the same day: "Continue with {level}"
                  says what actually happens. The level is retained as context and
                  the pathway is identified first; it does not mean IELPS has
                  diagnosed this visitor at this level, and it does not start or
                  unlock a lesson.

                  The secondary "Choose a pathway instead" button was removed in
                  the same instruction: once both actions led here, "instead" no
                  longer described a different action. One primary action only. */}
              <Link
                href="#pathways"
                className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-black text-indigo shadow-sm transition-transform hover:-translate-y-0.5"
              >
                Continue with {level}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
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

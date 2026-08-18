import Link from 'next/link'
import { CEFR_LEVELS, type Band } from '@/lib/cefr-levels'
import { LevelRow } from '@/components/access/level-row'

/**
 * The CEFR ladder.
 *
 * Rebuilt on 18 August 2026 through the learner system this platform already
 * runs, replacing the revoked 6 August dark treatment. Every element here is a
 * pattern the panel home already uses: the pill eyebrow and heading of a
 * section, the bordered card on the card surface, the two-column grid at the
 * same gap, the same page width and the same rhythm between sections.
 *
 * Two changes of substance came with the same instruction:
 *  - The watermarked stock photograph is gone. It belonged to the revoked
 *    package and no licensed copy exists. Nothing replaces it: the layout
 *    closes over the space, which is why the ladder now uses the full page
 *    width rather than sitting in the right-hand column beside a picture.
 *  - The three band groups keep their names — the levels are grouped, not
 *    renamed — and each group is a heading over its own cards rather than a
 *    row on a spine, so the six definitions have room to be read.
 *
 * The six codes, descriptors, names and definitions are untouched and still
 * come from lib/cefr-levels.ts, which is the canonical record for them.
 */

const BANDS: { band: Band; label: string; blurb: string }[] = [
  { band: 'Basic', label: 'Basic user', blurb: 'Everyday foundations' },
  { band: 'Independent', label: 'Independent user', blurb: 'Real-world fluency' },
  { band: 'Proficient', label: 'Proficient user', blurb: 'Academic & professional' },
]

export function CefrPanel() {
  return (
    <>
      <section className="border-b border-border bg-background py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-bold text-muted-foreground">
              Access Panel
            </span>
            <h1 className="mt-4 text-balance font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Find the level that speaks your English.
            </h1>
            <p className="mt-3 text-pretty text-lg leading-relaxed text-muted-foreground">
              Six CEFR levels, one clear ladder. Pick where you are today — A1 to
              C2 — and we&apos;ll open the right IELPS path from that exact point.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-card/40 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          {BANDS.map((group, groupIndex) => {
            const levels = CEFR_LEVELS.filter((l) => l.band === group.band)
            return (
              <div key={group.band} className={groupIndex === 0 ? '' : 'mt-14'}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-border pb-3">
                  <h2 className="font-display text-xl font-black tracking-tight text-foreground">
                    {group.label}
                  </h2>
                  <span className="text-sm text-muted-foreground">{group.blurb}</span>
                </div>
                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  {levels.map((level, i) => (
                    <LevelRow
                      key={level.code}
                      level={level}
                      index={i}
                      isLast={i === levels.length - 1}
                    />
                  ))}
                </div>
              </div>
            )
          })}

          <p className="mt-14 text-sm text-muted-foreground">
            Not sure which fits?{' '}
            {/* The design arrived with href="#". It pointed at the adult
                placement diagnostic until 17 Aug 2026, when the canonical
                routing decision ruled out exposing a generic placement funnel
                before the pathway is known — placement belongs inside the
                learner pathways that use it, and teachers, tutors, school
                administrators and studio authors do not take it at all. It now
                enters the pathway gateway, which decides whether placement is
                the next step. Copy unchanged: routing only. */}
            <Link href="/#pathways" className="font-bold text-primary hover:underline">
              Take the 5-minute placement test
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  )
}

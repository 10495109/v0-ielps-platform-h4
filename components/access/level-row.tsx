import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { CefrLevel } from '@/lib/cefr-levels'

/**
 * One level on the CEFR ladder.
 *
 * Rebuilt on 18 August 2026. The row this replaces belonged to the revoked
 * 6 August dark package: it sat on indigo, drew a vertical spine between
 * levels, and used that package's own typeface. This one is the card the
 * learner system already uses everywhere else — the same border, surface,
 * radius, padding and hover as the cards on the panel home — so nothing here
 * is a new pattern.
 *
 * The information it carries is unchanged and its order is the canonical one:
 * the CEFR code, then the reference descriptor, then the IELPS name, then the
 * definition. The course title is not shown here; it is a curriculum title and
 * belongs beside the course, not beside the level.
 */

/** The level's own accent, used for the code node only. */
const NODE: Record<CefrLevel['accent'], string> = {
  turquoise: 'bg-turquoise text-indigo',
  blue: 'bg-blue text-white',
  purple: 'bg-purple text-white',
  indigo: 'bg-indigo text-primary-foreground',
  yellow: 'bg-gold text-indigo',
}

export function LevelRow({
  level,
}: {
  level: CefrLevel
  /** Position within its band. Part of the design's component signature; the
   *  row itself does not read it. */
  index: number
  isLast: boolean
}) {
  const Icon = level.icon

  return (
    <Link
      href={`/levels/${level.code.toLowerCase()}`}
      className="group flex items-start gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
    >
      <span
        className={`grid size-11 shrink-0 place-items-center rounded-lg text-sm font-black tabular-nums ${NODE[level.accent]}`}
      >
        {level.code}
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-black uppercase tracking-wider text-secondary">
          {level.summary}
        </p>
        <h3 className="mt-1 flex items-center gap-2 font-display text-lg font-bold leading-tight text-foreground">
          <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          {level.name}
        </h3>
        <p className="mt-1.5 text-pretty text-sm leading-relaxed text-muted-foreground">
          {level.canDo}
        </p>
      </div>

      <span
        className="mt-1 grid size-8 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-colors group-hover:border-primary/40 group-hover:text-primary"
        aria-hidden="true"
      >
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  )
}

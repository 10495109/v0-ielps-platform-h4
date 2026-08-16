import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { CefrLevel } from '@/lib/cefr-levels'

const NODE_BG: Record<CefrLevel['accent'], string> = {
  turquoise: 'bg-turquoise text-indigo',
  blue: 'bg-blue text-white',
  purple: 'bg-purple text-white',
  indigo: 'bg-lilac text-indigo',
  yellow: 'bg-yellow text-indigo',
}

export function LevelRow({
  level,
  isLast,
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
      className="group relative flex gap-5 rounded-2xl px-4 py-5 transition-colors hover:bg-primary-foreground/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-indigo sm:px-5"
    >
      {/* Spine + node */}
      <div className="relative flex flex-col items-center">
        <span
          className={`z-10 grid size-12 shrink-0 place-items-center rounded-full text-sm font-extrabold tabular-nums shadow-[0_10px_25px_-12px_rgba(0,0,0,0.7)] ${NODE_BG[level.accent]}`}
        >
          {level.code}
        </span>
        {!isLast && (
          <span
            aria-hidden="true"
            className="absolute top-12 h-[calc(100%+1.25rem)] w-px bg-gradient-to-b from-primary-foreground/25 to-primary-foreground/5"
          />
        )}
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-yellow">
            {level.summary}
          </p>
          <h3 className="mt-1 flex items-center gap-2 text-lg font-extrabold tracking-tight text-primary-foreground">
            <Icon className="size-4 text-primary-foreground/50" aria-hidden="true" />
            {level.name}
          </h3>
          <p className="mt-1.5 max-w-prose text-sm leading-6 text-primary-foreground/65">
            {level.canDo}
          </p>
        </div>

        <span
          className="mt-1 grid size-9 shrink-0 place-items-center rounded-full border border-primary-foreground/20 text-primary-foreground/70 transition-all group-hover:border-yellow group-hover:bg-yellow group-hover:text-indigo"
          aria-hidden="true"
        >
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  )
}

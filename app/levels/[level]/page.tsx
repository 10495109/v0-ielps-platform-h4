import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import {
  CEFR_LEVELS,
  getLevelBySlug,
  levelSlug,
} from '@/lib/cefr-levels'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { StartLevelButton } from '@/components/access/start-level-button'

/**
 * One CEFR level.
 *
 * Rebuilt on 18 August 2026 alongside the ladder, for the same reason: the
 * 6 August dark treatment these six pages were reproduced from was revoked, and
 * only that. They now use the learner system's own shell, header, footer,
 * width, surfaces and cards, and inherit its typography rather than loading a
 * typeface of their own.
 *
 * The order the level is stated in is the canonical one — the code, then the
 * reference descriptor, then the IELPS name, then the definition. The band the
 * level belongs to is named beside the descriptor. No course title appears
 * here: a course title is curriculum, and it is shown as one beside the course
 * on the panel home.
 *
 * Two destinations were corrected earlier and are carried forward unchanged:
 * "All levels" returns to /access/, and "Continue with <level>" enters the
 * pathway gateway rather than starting a lesson. See start-level-button.tsx.
 */

/** The level's own accent, used for the code node only. */
const NODE: Record<string, string> = {
  turquoise: 'bg-turquoise text-indigo',
  blue: 'bg-blue text-white',
  purple: 'bg-purple text-white',
  indigo: 'bg-indigo text-primary-foreground',
  yellow: 'bg-gold text-indigo',
}

/** What a level's path includes. The same four for every level, because they
 *  describe how IELPS teaches rather than anything level-specific. */
const INCLUDED = [
  'Guided lessons matched to your level',
  'Speaking and listening practice',
  'Progress checks after every unit',
  'A certificate when you complete the level',
]

export function generateStaticParams() {
  return CEFR_LEVELS.map((l) => ({ level: levelSlug(l) }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ level: string }>
}) {
  const { level } = await params
  const data = getLevelBySlug(level)
  if (!data) return { title: 'Level not found — IELPS Learning' }
  return {
    title: `${data.code} ${data.name} — IELPS Learning`,
    description: data.canDo,
  }
}

export default async function LevelPage({
  params,
}: {
  params: Promise<{ level: string }>
}) {
  const { level } = await params
  const data = getLevelBySlug(level)
  if (!data) notFound()

  const Icon = data.icon
  const index = CEFR_LEVELS.findIndex((l) => l.code === data.code)
  const next = CEFR_LEVELS[index + 1]

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader away />

      <section className="border-b border-border bg-background py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <Link
            href="/access/"
            className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            All levels
          </Link>

          <div className="mt-8 flex flex-wrap items-center gap-5">
            <span
              className={`grid size-16 shrink-0 place-items-center rounded-xl font-display text-xl font-black tabular-nums ${NODE[data.accent]}`}
            >
              {data.code}
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-wider text-secondary">
                {data.band} user &middot; {data.summary}
              </p>
              <h1 className="mt-1 flex items-center gap-3 text-balance font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                <Icon className="size-7 shrink-0 text-muted-foreground" aria-hidden="true" />
                {data.name}
              </h1>
            </div>
          </div>

          <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
            {data.canDo}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-5">
            <StartLevelButton code={data.code} />
            {next && (
              <Link
                href={`/levels/${levelSlug(next)}`}
                className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground transition-colors hover:text-primary"
              >
                Next: {next.code} {next.name}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-card/40 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <h2 className="font-display text-xl font-black tracking-tight text-foreground">
            What your {data.code} path includes
          </h2>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2">
            {INCLUDED.map((item) => (
              <li
                key={item}
                className="flex items-start gap-4 rounded-xl border border-border bg-card p-5"
              >
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <Check className="size-3.5" aria-hidden="true" />
                </span>
                <p className="text-pretty text-sm font-medium leading-relaxed text-foreground">
                  {item}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}

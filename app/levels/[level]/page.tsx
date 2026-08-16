import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import {
  CEFR_LEVELS,
  getLevelBySlug,
  levelSlug,
  type CefrLevel,
} from '@/lib/cefr-levels'
import { AccessHeader } from '@/components/access/access-header'
import { StartLevelButton } from '@/components/access/start-level-button'

/**
 * The per-level page of the approved Access Panel design (16 Aug 2026),
 * reproduced as supplied.
 *
 * Two edits, both to controls that arrived inert:
 *  - "All levels" returns to /access/, which is where this panel lives in this
 *    app, rather than to the design package's own root.
 *  - "Start <level>" opens the lesson the curriculum names as the first lesson
 *    of that level. See start-level-button.tsx for how that is resolved and
 *    what happens when it cannot be.
 */

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
})

const NODE_BG: Record<CefrLevel['accent'], string> = {
  turquoise: 'bg-turquoise text-indigo',
  blue: 'bg-blue text-white',
  purple: 'bg-purple text-white',
  indigo: 'bg-lilac text-indigo',
  yellow: 'bg-yellow text-indigo',
}

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
    <main
      className={`min-h-dvh bg-indigo ${jakarta.variable}`}
      style={{ fontFamily: 'var(--font-jakarta), var(--font-inter), system-ui, sans-serif' }}
    >
      <AccessHeader />

      <section className="mx-auto max-w-4xl px-4 pb-20 pt-28 sm:px-6 lg:pt-32">
        <Link
          href="/access/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary-foreground/70 transition-colors hover:text-yellow"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          All levels
        </Link>

        <div className="mt-8 flex flex-wrap items-center gap-5">
          <span
            className={`grid size-20 shrink-0 place-items-center rounded-2xl text-2xl font-extrabold tabular-nums shadow-[0_16px_40px_-16px_rgba(0,0,0,0.8)] ${NODE_BG[data.accent]}`}
          >
            {data.code}
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-yellow">
              {data.band} user &middot; {data.summary}
            </p>
            <h1 className="mt-1 flex items-center gap-3 text-4xl font-extrabold tracking-tight text-primary-foreground sm:text-5xl">
              <Icon className="size-8 text-primary-foreground/50" aria-hidden="true" />
              {data.name}
            </h1>
          </div>
        </div>

        <p className="mt-8 max-w-2xl text-pretty text-lg leading-relaxed text-primary-foreground/75">
          {data.canDo}
        </p>

        <div className="mt-10 rounded-3xl border border-primary-foreground/10 bg-primary-foreground/[0.03] p-6 sm:p-8">
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-primary-foreground">
            What your {data.code} path includes
          </h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              'Guided lessons matched to your level',
              'Speaking and listening practice',
              'Progress checks after every unit',
              'A certificate when you complete the level',
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 text-sm leading-6 text-primary-foreground/75"
              >
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-yellow text-indigo">
                  <Check className="size-3.5" aria-hidden="true" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <StartLevelButton code={data.code} />
          {next && (
            <Link
              href={`/levels/${levelSlug(next)}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary-foreground/70 transition-colors hover:text-yellow"
            >
              Next: {next.code} {next.name}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          )}
        </div>
      </section>
    </main>
  )
}

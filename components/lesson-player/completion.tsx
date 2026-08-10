'use client'

import Link from 'next/link'
import {
  ArrowRight,
  Gamepad2,
  Compass,
  Mic,
  TrendingUp,
  Award,
  Star,
  PartyPopper,
} from 'lucide-react'
import type { AccentToken } from '@/lib/apps/types'
import { ACCENT } from '@/lib/apps/accent'
import { SECONDARY_HANDOFFS } from '@/lib/lesson-player/spec'
import type { SampleLesson } from '@/lib/lesson-player/content'

const HANDOFF_ICONS: Record<string, typeof Gamepad2> = {
  '/starpath': Gamepad2,
  '/discover': Compass,
  '/speaking': Mic,
  '/progress': TrendingUp,
  '/certificates': Award,
}

/**
 * Step-15 completion screen. Shows earned evidence and the handoff map: the
 * single platform-assigned next lesson (primary) plus optional enrichment and
 * evidence routes (secondary). Certificate appears only when eligible.
 */
export function CompletionScreen({
  slug,
  lesson,
  accent,
  score,
  stars,
  mastery,
  certificateEligible,
  onNextLesson,
}: {
  slug: string
  lesson: SampleLesson
  accent: AccentToken
  score: number
  stars: number
  mastery: number
  certificateEligible: boolean
  onNextLesson: () => void
}) {
  const a = ACCENT[accent]
  const evidence = [
    { label: 'Score', value: `${score}%` },
    { label: 'Mastery', value: `${mastery}%` },
    { label: 'Stars', value: `${stars}/3` },
  ]

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className={`relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br p-8 text-center ${a.gradient}`}>
        <span className={`mx-auto grid size-14 place-items-center rounded-2xl ${a.solid}`}>
          <PartyPopper className="size-7" />
        </span>
        <h2 className="mt-4 font-serif text-2xl font-semibold text-foreground text-balance">Lesson complete</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Progress, rewards, mastery and your review queue have been saved.
        </p>
        <div className="mt-5 flex items-center justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <Star
              key={i}
              className={`size-7 ${i < stars ? 'fill-gold text-gold' : 'text-border'}`}
            />
          ))}
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3">
          {evidence.map((e) => (
            <div key={e.label} className="rounded-xl border border-border bg-card/70 p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{e.label}</p>
              <p className={`mt-0.5 text-lg font-bold ${a.text}`}>{e.value}</p>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onNextLesson}
        className={`flex items-center justify-between rounded-2xl px-6 py-5 text-left ${a.solid}`}
      >
        <span>
          <span className="block text-xs font-semibold uppercase tracking-wide opacity-80">Primary next step</span>
          <span className="mt-0.5 block text-lg font-semibold">Continue to next lesson</span>
          <span className="mt-0.5 block text-xs opacity-80">Assigned lesson · {lesson.nextLessonId}</span>
        </span>
        <ArrowRight className="size-6" />
      </button>

      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Optional next steps</p>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {SECONDARY_HANDOFFS.map((h) => {
            const Icon = HANDOFF_ICONS[h.route] ?? Compass
            const isCert = h.route === '/certificates'
            const disabled = isCert && !certificateEligible
            const inner = (
              <div
                className={[
                  'flex h-full items-start gap-3 rounded-2xl border p-4 transition-colors',
                  disabled ? 'border-dashed border-border opacity-60' : 'border-border bg-card hover:border-foreground/20',
                ].join(' ')}
              >
                <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${a.soft}`}>
                  <Icon className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-card-foreground">{h.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {disabled ? 'Available once eligibility is met.' : h.rule}
                  </p>
                </div>
              </div>
            )
            if (disabled) return <div key={h.label}>{inner}</div>
            return (
              <Link key={h.label} href={`/app/${slug}/dashboard`}>
                {inner}
              </Link>
            )
          })}
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground text-pretty">
        Enrichment (StarPath, Discover) never replaces course completion and always returns you to the
        course spine. Certificates are issued by the backend only when eligibility is confirmed.
      </p>
    </div>
  )
}

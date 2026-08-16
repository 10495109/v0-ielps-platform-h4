import Link from 'next/link'
import { CEFR_LEVELS, type Band } from '@/lib/cefr-levels'
import { LevelRow } from '@/components/access/level-row'

const BANDS: { band: Band; label: string; blurb: string }[] = [
  { band: 'Basic', label: 'Basic user', blurb: 'Everyday foundations' },
  { band: 'Independent', label: 'Independent user', blurb: 'Real-world fluency' },
  { band: 'Proficient', label: 'Proficient user', blurb: 'Academic & professional' },
]

export function CefrPanel() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-20 pt-28 sm:px-6 lg:pt-32">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14">
        {/* Left: hero */}
        <div className="lg:sticky lg:top-10 lg:self-start">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-yellow">
            Access Panel
          </p>
          <h1 className="mt-3 text-pretty text-4xl font-extrabold leading-[1.05] tracking-tight text-primary-foreground sm:text-5xl">
            Find the level that speaks your English.
          </h1>
          <p className="mt-4 max-w-md text-pretty text-base leading-relaxed text-primary-foreground/65">
            Six CEFR levels, one clear ladder. Pick where you are today — A1 to
            C2 — and we&apos;ll open the right IELPS path from that exact point.
          </p>

          <div className="relative mt-8 overflow-hidden rounded-3xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/learners.jpg"
              alt="Four friends huddled together looking up at the camera under a bright blue sky"
              className="h-auto w-full object-contain"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-indigo/90 via-indigo/15 to-transparent"
              aria-hidden="true"
            />
            <div className="absolute inset-x-0 bottom-0 flex flex-wrap gap-x-6 gap-y-2 p-5">
              {BANDS.map((b) => (
                <div key={b.band} className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-yellow" aria-hidden="true" />
                  <span className="text-xs font-semibold text-primary-foreground">
                    {b.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: level ladder grouped by band */}
        <div className="rounded-3xl border border-primary-foreground/10 bg-primary-foreground/[0.03] p-3 sm:p-5">
          {BANDS.map((group) => {
            const levels = CEFR_LEVELS.filter((l) => l.band === group.band)
            return (
              <div key={group.band} className="[&:not(:first-child)]:mt-6">
                <div className="flex items-baseline justify-between px-4 sm:px-5">
                  <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-primary-foreground">
                    {group.label}
                  </h2>
                  <span className="text-xs font-medium text-primary-foreground/45">
                    {group.blurb}
                  </span>
                </div>
                <div className="mt-2">
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

          <p className="px-4 pb-3 pt-5 text-sm text-primary-foreground/60 sm:px-5">
            Not sure which fits?{' '}
            {/* The design arrived with href="#". This is the platform's real
                placement test — the same 144-item diagnostic the Access Panel
                home describes — not a new route made for this page. */}
            <Link
              href="/app/adult/placement/"
              className="font-semibold text-yellow hover:underline"
            >
              Take the 5-minute placement test
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  )
}

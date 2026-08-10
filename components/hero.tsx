import Image from 'next/image'
import { ArrowRight, Clock, BarChart3, Users, Award } from 'lucide-react'
import { IELPS_API_BASE } from '@/lib/ielps-api'

/** Secondary rail — BBC-style "more from this hub" tile list beside the lead story. */
const SECONDARY = [
  {
    eyebrow: 'PATHWAYS',
    title: 'Seven account types, seven mini-apps',
    meta: '7 pathways · live',
    href: '#pathways',
    Icon: Users,
  },
  {
    eyebrow: 'ADULT FLOW',
    title: 'From My Course to the adult lesson player',
    meta: '4 steps',
    href: '#adult-flow',
    Icon: BarChart3,
  },
  {
    eyebrow: 'EVIDENCE',
    title: 'Verified certificates on every CEFR level',
    meta: 'A1 – C2',
    href: '#placement',
    Icon: Award,
  },
]

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-10">
        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          {/* ── Lead story ── */}
          <article className="animate-rise">
            <span className="inline-flex items-center gap-1.5 rounded-sm bg-primary px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-primary-foreground">
              Featured · Placement
            </span>

            <h1 className="mt-4 text-balance font-display text-3xl font-black leading-[1.05] tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem]">
              One account pathway. One placement route. One clear lesson continuation.
            </h1>

            <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground lg:text-lg">
              A clean, brand-faithful shell that overlays the live EILPS platform. Choose the
              pathway that fits you, take the expanded placement diagnostic, and continue straight
              into the correct lesson player — every route wired to the live server.
            </p>

            {/* Byline-style meta row */}
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-border py-3 text-xs font-bold text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary" />
                12 min placement
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BarChart3 className="h-3.5 w-3.5 text-primary" />
                6 CEFR levels
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-primary" />
                7 account pathways
              </span>
              <span className="inline-flex items-center gap-1.5">144 diagnostic items</span>
            </div>

            <div className="relative mt-6 overflow-hidden rounded-xl border border-border bg-muted shadow-[0_20px_44px_-28px_rgba(13,0,77,0.4)]">
              <Image
                src="/hero-learning.png"
                alt="Diverse English learners connected to one IELPS learning platform with a placement compass and CEFR level ladder"
                width={900}
                height={520}
                priority
                className="h-full max-h-[360px] w-full object-cover"
              />
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <a
                href="#pathways"
                className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5"
              >
                Choose your pathway
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#placement"
                className="inline-flex min-h-11 items-center rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-bold text-foreground transition-colors hover:bg-muted"
              >
                Preview placement
              </a>
              <span className="text-xs font-medium text-muted-foreground">
                Base API: <code className="font-mono text-foreground">{IELPS_API_BASE}</code>
              </span>
            </div>
          </article>

          {/* ── Secondary rail ── */}
          <aside
            aria-label="More from this hub"
            className="animate-rise flex flex-col gap-0 [animation-delay:120ms] lg:border-l lg:border-border lg:pl-8"
          >
            <p className="pb-3 text-[11px] font-black uppercase tracking-wider text-muted-foreground">
              More from IELPS
            </p>
            {SECONDARY.map((item, i) => (
              <a
                key={item.title}
                href={item.href}
                className={`group flex items-start gap-3 py-4 transition-colors ${
                  i > 0 ? 'border-t border-border' : ''
                }`}
              >
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-secondary/12 text-secondary">
                  <item.Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-wider text-secondary">
                    {item.eyebrow}
                  </p>
                  <p className="mt-1 font-display text-sm font-bold leading-snug text-foreground group-hover:text-primary">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-muted-foreground">{item.meta}</p>
                </div>
              </a>
            ))}
          </aside>
        </div>
      </div>
    </section>
  )
}

import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

/** Fact ribbon — quiet, load-bearing proof points that sit under the lead. */
const FACTS = [
  { value: '7', label: 'Account pathways' },
  { value: '144', label: 'Diagnostic items' },
  { value: 'A1–C2', label: 'CEFR levels' },
  { value: '1', label: 'Lesson route' },
]

export function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden border-b border-border bg-indigo text-primary-foreground"
    >
      {/* Signature: a single gold hairline sweeping across the top edge */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gold" aria-hidden />

      {/* Stretched card — hugs the left edge, holds every hero element */}
      <div className="py-6 pl-4 pr-4 sm:pl-6 lg:py-10 lg:pl-8 lg:pr-10">
        <div className="animate-rise relative overflow-hidden rounded-2xl rounded-l-none border border-white/12 border-l-0 bg-white/[0.04] shadow-[0_40px_90px_-45px_rgba(0,0,0,0.8)]">
          {/* Inner accent hairline echoing the gold signature */}
          <div className="absolute left-0 top-0 h-full w-1 bg-gold" aria-hidden />

          <div className="grid gap-10 p-7 sm:p-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:p-14">
            {/* ── Lead ── */}
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[11px] font-black uppercase tracking-widest text-gold">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden />
                Integrated English Learning Platform Studio
              </span>

              <h1 className="mt-5 text-balance font-display text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.4rem]">
                Welcome to <span className="text-turquoise">IELPS</span>,
              </h1>

              <p className="mt-5 max-w-xl text-pretty font-display text-lg font-bold text-white/90 lg:text-xl">
                Your English. Your level. Your learning journey.
              </p>

              <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-white/70 lg:text-lg">
                Intelligent English Learning &amp; Progress System — designed to help you build real
                English skills at your own pace, with learning that adapts to you.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="#pathways"
                  className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-gold px-6 py-3 text-sm font-black text-indigo shadow-sm transition-transform hover:-translate-y-0.5"
                >
                  Choose your pathway
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="#placement"
                  className="inline-flex min-h-12 items-center rounded-lg border border-white/20 bg-white/[0.04] px-6 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-white/10"
                >
                  Preview placement
                </a>
              </div>

              {/* Fact ribbon */}
              <dl className="mt-10 grid max-w-lg grid-cols-2 gap-x-6 gap-y-5 border-t border-white/12 pt-6 sm:grid-cols-4">
                {FACTS.map((fact) => (
                  <div key={fact.label}>
                    <dt className="font-display text-2xl font-black text-turquoise">{fact.value}</dt>
                    <dd className="mt-1 text-[11px] font-bold uppercase tracking-wider text-white/55">
                      {fact.label}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* ── Image panel ── */}
            <div className="animate-rise relative [animation-delay:120ms]">
              <div className="relative overflow-hidden rounded-2xl border border-white/12 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.7)]">
                <Image
                  src="/hero-learning.png"
                  alt="Illustration of young English learners from around the world studying together on the IELPS platform"
                  width={900}
                  height={620}
                  priority
                  className="h-full w-full object-cover"
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-indigo/50 to-transparent"
                  aria-hidden
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

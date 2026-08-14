import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

/**
 * Fact ribbon — quiet, load-bearing proof points that sit under the lead.
 *
 * The icons are written out as raw SVG rather than imported from lucide so the
 * rendered markup cannot drift when the icon package is upgraded. These four
 * shapes and colours are the signed-off ones.
 */
const FACTS = [
  {
    value: '7',
    label: 'Account pathways',
    colour: '#22C7C6',
    icon: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
  },
  {
    value: '144',
    label: 'Diagnostic items',
    colour: '#A78BFA',
    icon: (
      <>
        <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <path d="m9 14 2 2 4-4" />
      </>
    ),
  },
  {
    value: 'A1–C2',
    label: 'CEFR levels',
    colour: '#5B93F0',
    icon: (
      <>
        <path d="M3 3v16a2 2 0 0 0 2 2h16" />
        <path d="M18 17V9" />
        <path d="M13 17V5" />
        <path d="M8 17v-3" />
      </>
    ),
  },
  {
    value: '1',
    label: 'Lesson route',
    colour: '#FFCE00',
    icon: (
      <>
        <circle cx="6" cy="19" r="3" />
        <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
        <circle cx="18" cy="5" r="3" />
      </>
    ),
  },
]

export function Hero() {
  return (
    // The page behind the panel is a deeper indigo than the panel itself, so the
    // inset panel reads as a card rather than as the whole band.
    <section
      id="top"
      className="relative overflow-hidden border-b border-border text-primary-foreground"
      style={{ background: '#070147' }}
    >
      <div style={{ padding: '22px 3.8%' }}>
        {/* #2B2C62 is the artwork's own backdrop colour, measured from the four
            corners of hero-learning.png. Any other fill shows a seam down the
            middle where the picture starts. */}
        <div
          className="mx-auto overflow-hidden"
          style={{
            borderRadius: 30,
            border: '1px solid rgba(255,255,255,.11)',
            background: '#2B2C62',
          }}
        >
          <div
            className="hero-grid grid lg:grid-cols-[1.05fr_0.95fr]"
            style={{ alignItems: 'stretch' }}
          >
            {/* ── Lead ── */}
            <div
              className="animate-rise"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '54px 0 58px 46px',
              }}
            >
              <span style={{ alignSelf: 'flex-start' }}>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[11px] font-black uppercase tracking-widest text-gold">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden />
                  Integrated English Learning Platform Studio
                </span>
              </span>

              <h1 className="mt-5 text-balance font-display text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.4rem]">
                Welcome to <span className="text-turquoise">IELPS</span>
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

              {/* Fact ribbon. The gaps and top padding are set inline because the
                  approved layout has the four facts flush in a 500px block — a
                  utility class here would re-space them the moment the stylesheet
                  is rebuilt. */}
              <dl
                className="mt-10 grid grid-cols-2 border-t border-white/12 sm:grid-cols-4"
                style={{ maxWidth: 500, columnGap: 0, rowGap: 0, paddingTop: 0 }}
              >
                {FACTS.map((fact) => (
                  <div
                    key={fact.label}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}
                  >
                    <span
                      className="inline-flex items-center justify-center rounded-full"
                      style={{
                        width: 35,
                        height: 35,
                        flex: 'none',
                        border: `2px solid ${fact.colour}`,
                        color: fact.colour,
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ width: 16, height: 16 }}
                        aria-hidden="true"
                      >
                        {fact.icon}
                      </svg>
                    </span>
                    <div>
                      <dt
                        className="font-display font-black"
                        style={{ fontSize: 22, lineHeight: '35px', color: fact.colour }}
                      >
                        {fact.value}
                      </dt>
                      <dd
                        className="uppercase"
                        style={{
                          marginTop: 4,
                          fontSize: 12,
                          fontWeight: 600,
                          letterSpacing: '.03em',
                          lineHeight: 1.42,
                          maxWidth: 76,
                          color: 'rgba(255,255,255,.72)',
                        }}
                      >
                        {fact.label}
                      </dd>
                    </div>
                  </div>
                ))}
              </dl>
            </div>

            {/* ── Image panel ── */}
            {/* The artwork is square (1024×1024) and carries its own backdrop, so
                it bleeds straight into the panel. No crop, no card, no fade: the
                learners' feet stay in the picture and the join is invisible. */}
            <div className="animate-rise relative [animation-delay:120ms]">
              <Image
                src="/hero-learning.png"
                alt="Illustration of young English learners from around the world studying together on the IELPS platform"
                width={1024}
                height={1024}
                priority
                className="w-full"
                style={{ display: 'block', height: 'auto' }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

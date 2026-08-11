import Image from 'next/image'
import { ArrowRight, Users, ClipboardList, BarChart3, MapPin } from 'lucide-react'

/** Stats row — mirrors the four proof points in the reference exactly. */
const STATS = [
  { value: '7', label: ['Account', 'Pathways'], Icon: Users, tone: 'turquoise' },
  { value: '144', label: ['Diagnostic', 'Items'], Icon: ClipboardList, tone: 'turquoise' },
  { value: 'A1–C2', label: ['CEFR', 'Levels'], Icon: BarChart3, tone: 'turquoise', accent: true },
  { value: '1', label: ['Lesson', 'Route'], Icon: MapPin, tone: 'gold' },
] as const

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-[#0a0733] text-white">
      <div className="p-3 sm:p-5 lg:py-8 lg:pl-6 lg:pr-8">
        {/* Stretched card — hugs the left edge, holds every hero element */}
        <div className="animate-rise relative grid overflow-hidden rounded-[28px] border border-white/10 bg-[#181356] shadow-[0_50px_110px_-50px_rgba(0,0,0,0.9)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.12fr)]">
          {/* ── Lead column ── */}
          <div className="order-2 p-7 sm:p-10 lg:order-1 lg:py-14 lg:pl-14 lg:pr-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-gold sm:text-[11px]">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden />
              Integrated English Learning Platform Studio
            </span>

            <h1 className="mt-6 text-balance font-display text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
              Welcome to <span className="text-[#3f5bff]">IELPS</span>,
            </h1>

            <p className="mt-6 max-w-xl text-pretty font-display text-xl font-bold text-white lg:text-2xl">
              Your English. Your level. Your learning journey.
            </p>

            <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-white/70 lg:text-lg">
              Intelligent English Learning &amp; Progress System — designed to help you build real
              English skills at your own pace, with learning that adapts to you.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#pathways"
                className="inline-flex min-h-12 items-center gap-2.5 rounded-xl bg-gold px-7 py-3.5 text-sm font-black text-[#0a0733] shadow-sm transition-transform hover:-translate-y-0.5"
              >
                Choose your pathway
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#placement"
                className="inline-flex min-h-12 items-center rounded-xl border border-white/25 px-7 py-3.5 text-sm font-bold text-white transition-colors hover:bg-white/10"
              >
                Preview placement
              </a>
            </div>

            {/* Divider + stats */}
            <dl className="mt-9 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-white/12 pt-7 sm:grid-cols-4">
              {STATS.map(({ value, label, Icon, tone, accent }) => (
                <div key={value + label[0]} className="flex items-center gap-3">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${
                      tone === 'gold' ? 'border-gold/45 text-gold' : 'border-turquoise/45 text-turquoise'
                    }`}
                    aria-hidden
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <dt
                      className={`whitespace-nowrap font-display text-2xl font-black leading-none ${
                        accent ? 'text-turquoise' : 'text-white'
                      }`}
                    >
                      {value}
                    </dt>
                    <dd className="mt-1.5 text-[10px] font-bold uppercase leading-tight tracking-wider text-white/55">
                      {label[0]}
                      <br />
                      {label[1]}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>

          {/* ── Illustration column (bleeds to card edges) ── */}
          <div className="relative order-1 aspect-[905/742] w-full lg:order-2 lg:aspect-auto lg:min-h-full">
            <Image
              src="/hero-illustration.png"
              alt="Illustration of five young learners from around the world studying English together — surrounded by language-learning and global-community elements"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover object-center"
            />
          </div>
        </div>
      </div>

      {/* PiP mascot — bottom-right, as in the reference */}
      <div className="pointer-events-none absolute bottom-2 right-4 z-10 sm:bottom-4 sm:right-8">
        <Image
          src="/hero-pip.png"
          alt="Hi, I'm PiP — your IELPS learning assistant"
          width={190}
          height={62}
          className="h-auto w-[130px] sm:w-[170px]"
        />
      </div>
    </section>
  )
}

import { ADULT_FLOW } from '@/lib/ielps-data'
import { ArrowRight } from 'lucide-react'

export function AdultFlowSection() {
  return (
    <section id="adult-flow" className="scroll-mt-20 bg-indigo py-16 text-primary-foreground">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-2xl">
          <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold text-white/85">
            Adult learner flow
          </span>
          <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
            From My Course to the correct adult lesson player
          </h2>
          <p className="mt-3 text-lg leading-relaxed text-white/70 text-pretty">
            Adult scholars continue from their dashboard straight into the authoritative
            integrated lesson player — no detours, no duplicate routes.
          </p>
        </div>

        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ADULT_FLOW.map((s, i) => (
            <li
              key={s.step}
              className="relative rounded-2xl border border-white/12 bg-white/[0.06] p-5 backdrop-blur-sm transition-colors hover:bg-white/[0.1]"
            >
              <span className="font-display text-2xl font-black text-gold">{s.step}</span>
              <h3 className="mt-2 font-display text-lg font-bold">{s.title}</h3>
              <code className="mt-1 block font-mono text-xs text-turquoise">{s.route}</code>
              <p className="mt-2 text-sm leading-relaxed text-white/70">{s.detail}</p>
              {i < ADULT_FLOW.length - 1 && (
                <ArrowRight className="absolute -right-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-white/30 lg:block" />
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

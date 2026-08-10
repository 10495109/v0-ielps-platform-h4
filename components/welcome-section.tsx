import { Sparkles, Dumbbell, Target, RotateCcw, MessageSquare, TrendingUp } from 'lucide-react'

/** "As you learn, IELPS will…" — the adaptive-learning promise. */
const CAPABILITIES = [
  {
    icon: Sparkles,
    text: 'Adapt activities to your level and performance',
  },
  {
    icon: Dumbbell,
    text: 'Help you practise vocabulary, grammar, listening, reading, speaking and writing',
  },
  {
    icon: Target,
    text: 'Identify the skills that need more practice',
  },
  {
    icon: RotateCcw,
    text: 'Bring important learning back through Smart Review',
  },
  {
    icon: MessageSquare,
    text: 'Give you immediate feedback and support',
  },
  {
    icon: TrendingUp,
    text: 'Track your progress as you move towards your next CEFR level',
  },
]

export function WelcomeSection() {
  return (
    <section id="welcome" className="scroll-mt-20 border-b border-border bg-background py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-2xl">
          <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-bold text-muted-foreground">
            How IELPS helps you
          </span>
          <h2 className="mt-4 text-balance font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Learning that adapts to you as you go
          </h2>
          <p className="mt-3 text-pretty text-lg leading-relaxed text-muted-foreground">
            As you learn, IELPS works quietly in the background — shaping every activity around where
            you are and where you&apos;re heading next.
          </p>
        </div>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="flex items-start gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" aria-hidden />
              </span>
              <p className="text-pretty text-sm font-medium leading-relaxed text-foreground">{text}</p>
            </li>
          ))}
        </ul>

        {/* Closing rhythm */}
        <div className="mt-12 rounded-2xl bg-indigo px-6 py-10 text-center text-primary-foreground lg:px-10 lg:py-12">
          <p className="text-pretty text-base leading-relaxed text-white/70">
            There is no need to rush and no need to follow anyone else&apos;s pace.
          </p>
          <p className="mt-4 font-display text-2xl font-black tracking-tight text-turquoise sm:text-3xl">
            Learn. Practise. Improve. Progress.
          </p>
          <p className="mt-4 text-pretty text-base text-white/80">
            Your IELPS journey starts here. Ready? Let&apos;s begin.
          </p>
        </div>
      </div>
    </section>
  )
}

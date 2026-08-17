import { IELPS_API_BASE } from '@/lib/ielps-api'

/**
 * The 'Placement' item was removed on 17 August 2026. It pointed only at the
 * generic diagnostic-description section on this page, and the Access Panel
 * answers one question — "How are you using IELPS?". It owns pathway
 * identification, not generic placement orientation, so the explanation moved
 * into the learner flows that actually run placement.
 *
 * This is the Access Panel's own navigation. The Public Landing's navigation is
 * separate, canonical and untouched.
 */
const NAV = [
  { label: 'Pathways', href: '#pathways' },
  { label: 'Adult flow', href: '#adult-flow' },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-[12px_5px_12px_5px] bg-primary font-display text-xl font-black text-gold">
            i
          </span>
          <span className="font-display text-2xl font-black tracking-tight text-foreground">
            IELPS
          </span>
          <span className="hidden font-display text-2xl font-light tracking-tight text-muted-foreground sm:inline">
            Learning
          </span>
        </a>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-bold text-foreground transition-colors hover:text-primary"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <a
          href={`${IELPS_API_BASE}/dashboard`}
          className="inline-flex min-h-9 items-center rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5"
        >
          Sign in
        </a>
      </div>
    </header>
  )
}

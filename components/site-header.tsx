import { Search } from 'lucide-react'
import { IELPS_API_BASE } from '@/lib/ielps-api'

const UTILITY_LINKS = [
  { label: 'For teachers', href: '#pathways' },
  { label: 'For schools', href: '#pathways' },
  { label: 'Help', href: '#placement' },
]

const NAV = [
  { label: 'Course', href: '#top' },
  { label: 'Placement', href: '#placement' },
  { label: 'Pathways', href: '#pathways' },
  { label: 'Adult flow', href: '#adult-flow' },
]

const SKILL_TABS = [
  { label: 'All', href: '#top', active: true },
  { label: 'Grammar', href: '#placement' },
  { label: 'Vocabulary', href: '#placement' },
  { label: 'Listening', href: '#placement' },
  { label: 'Speaking', href: '#placement' },
  { label: 'Reading', href: '#placement' },
  { label: 'Writing', href: '#placement' },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-background">
      {/* Tier 1 — utility bar */}
      <div className="hidden bg-indigo text-white/75 sm:block">
        <div className="mx-auto flex max-w-7xl items-center justify-end gap-5 px-5 py-1.5 lg:px-8">
          {UTILITY_LINKS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-[11px] font-semibold uppercase tracking-wider transition-colors hover:text-white"
            >
              {item.label}
            </a>
          ))}
          <span className="h-3 w-px bg-white/20" aria-hidden="true" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-white/85">
            Live overlay · EILPS
          </span>
        </div>
      </div>

      {/* Tier 2 — masthead */}
      <div className="border-b border-border/70 bg-background/95 backdrop-blur-md">
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

          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Search"
              className="hidden rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:grid sm:place-items-center"
            >
              <Search className="h-4 w-4" />
            </button>
            <a
              href={`${IELPS_API_BASE}/dashboard`}
              className="inline-flex min-h-9 items-center rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5"
            >
              Sign in
            </a>
          </div>
        </div>
      </div>

      {/* Tier 3 — skill/genre tab strip */}
      <div className="border-b border-border/70 bg-card">
        <nav
          aria-label="Skill categories"
          className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-5 lg:px-8"
        >
          {SKILL_TABS.map((tab) => (
            <a
              key={tab.label}
              href={tab.href}
              className={
                tab.active
                  ? 'shrink-0 border-b-2 border-primary px-3 py-2.5 text-xs font-bold text-primary'
                  : 'shrink-0 border-b-2 border-transparent px-3 py-2.5 text-xs font-bold text-muted-foreground transition-colors hover:text-foreground'
              }
            >
              {tab.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}

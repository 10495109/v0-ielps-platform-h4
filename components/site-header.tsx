import { SessionBadge } from '@/components/session-badge'
import { BrandMark } from '@/components/brand-mark'

const NAV = [
  { label: 'Placement', href: '#placement' },
  { label: 'Pathways', href: '#pathways' },
  { label: 'Adult flow', href: '#adult-flow' },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
        <a href="#top" className="flex items-center gap-2.5">
          <BrandMark className="size-10" />
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

        {/* Shows the signed-in learner and a working sign out, rather than a
            link that always says "Sign in" even when a session is open. */}
        <SessionBadge />
      </div>
    </header>
  )
}

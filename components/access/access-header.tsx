import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import { IELPS_API_BASE } from '@/lib/ielps-api'

/**
 * The header that ships with the approved Access Panel design (15 Aug 2026).
 *
 * The design arrived with every destination as `href="#"`. Nothing about the
 * header's appearance is changed here — the only edit is that each link now
 * points at the address that already exists on this platform, so no control in
 * the approved design is a dead end:
 *
 *   Pathways / Adult flow → the sections of the Access Panel home, which are
 *     the surfaces those words already name there.
 *   Sign in → the same destination the Access Panel home's own Sign in button
 *     uses, so there is one sign-in address and not two.
 *
 * The panel's existing light header is deliberately not reused: this design
 * sits on indigo and carries its own approved header, and swapping one in would
 * be a visual change to something already approved.
 *
 * 'Placement' was removed on 17 August 2026 with the same instruction that
 * removed it from the panel home's own header. It pointed at /#placement — the
 * generic diagnostic section — and that section no longer exists, so leaving it
 * would have made it a dead anchor as well as a placement control ahead of
 * pathway identification.
 */
const NAV = [
  { label: 'Pathways', href: '/#pathways' },
  { label: 'Adult flow', href: '/#adult-flow' },
]

export function AccessHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5" aria-label="IELPS Learning home">
          <span className="grid size-9 place-items-center rounded-xl bg-yellow text-indigo">
            <BookOpen className="size-5" aria-hidden="true" />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-primary-foreground">
            IELPS{' '}
            <span className="font-medium text-primary-foreground/55">Learning</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-semibold text-primary-foreground/70 transition-colors hover:text-yellow"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <a
          href={`${IELPS_API_BASE}/dashboard`}
          className="rounded-full border border-primary-foreground/25 px-5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:border-yellow hover:text-yellow"
        >
          Sign in
        </a>
      </div>
    </header>
  )
}

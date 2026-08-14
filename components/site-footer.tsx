import { IELPS_API_BASE } from '@/lib/ielps-api'

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-[10px_4px_10px_4px] bg-primary font-display text-base font-black text-gold">
            i
          </span>
          <span className="font-display text-lg font-extrabold text-foreground">IELPS</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Brand-faithful account &amp; placement shell overlaying the live platform at{' '}
          <code className="font-mono text-foreground">{IELPS_API_BASE}</code>. The live frontend and
          backend are unchanged.
        </p>
      </div>
    </footer>
  )
}

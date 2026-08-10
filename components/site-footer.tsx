import { BrandMark } from '@/components/brand-mark'

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <div className="flex items-center gap-2.5">
          <BrandMark className="size-8" />
          <span className="font-display text-lg font-extrabold text-foreground">IELPS</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Intelligent English Learning &amp; Progress System.
        </p>
      </div>
    </footer>
  )
}

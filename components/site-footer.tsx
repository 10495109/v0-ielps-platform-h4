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
        {/* Production wording. The previous line printed implementation detail and,
            because the API is same-origin, an empty value followed by a full stop. */}
        <p className="text-sm text-muted-foreground">
          Your account, placement and learning route across IELPS.
        </p>
      </div>
    </footer>
  )
}

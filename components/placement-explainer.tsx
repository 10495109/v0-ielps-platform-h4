import { ClipboardList } from 'lucide-react'
import { PLACEMENT } from '@/lib/ielps-data'

/**
 * What the placement diagnostic covers, and what it is not.
 *
 * Relocated here on 17 August 2026. This explanation used to sit on the Access
 * Panel home as a general "preview placement" section, ahead of any pathway
 * choice. The canonical flow puts pathway identification first, so the material
 * moved to the flow that actually runs placement — where a learner reads it at
 * the moment it applies to them rather than as orientation for everybody.
 *
 * Only the parts a learner needs came across: what is covered, how it is
 * graded, and the standards note. The showcase material that lived alongside it
 * on the panel home — the interactive sample question, the API endpoint list and
 * the stock photograph — was addressed to whoever was reviewing the panel, not
 * to a learner sitting down to be placed, so it did not travel.
 *
 * Reading this does not begin the diagnostic. The test below it does.
 */
export function PlacementExplainer() {
  return (
    <section
      aria-labelledby="ielps-placement-explainer"
      className="rounded-3xl border border-border bg-card p-6"
    >
      <div className="flex items-center gap-2">
        <ClipboardList className="size-5 shrink-0 text-primary" aria-hidden="true" />
        <h2 id="ielps-placement-explainer" className="font-display text-lg font-bold text-foreground">
          What this placement covers
        </h2>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {PLACEMENT.items} original diagnostic items — {PLACEMENT.perLevel} per CEFR level —
        spanning nine skill areas from grammar to integrated evidence.
      </p>

      <div className="mt-5 grid grid-cols-6 gap-2">
        {PLACEMENT.levels.map((level) => (
          <span
            key={level}
            className="rounded-full border border-border bg-muted py-2 text-center font-display text-sm font-black text-foreground"
          >
            {level}
          </span>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {PLACEMENT.skills.map((skill) => (
          <span
            key={skill}
            className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-semibold text-foreground"
          >
            {skill}
          </span>
        ))}
      </div>

      <p className="mt-5 rounded-r-lg border-l-4 border-gold bg-background px-4 py-3 text-sm leading-relaxed text-muted-foreground">
        {PLACEMENT.standardsNote}
      </p>
    </section>
  )
}

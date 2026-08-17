import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

/**
 * "Continue with <level>" — the level-page action from the approved Access
 * Panel design.
 *
 * Corrected on 17 August 2026 by the canonical routing decision: pathway first,
 * placement and level second. This control previously resolved the level's
 * first lesson from the curriculum and opened the Adult Lesson Player. That was
 * the generic Start behaviour the decision names — a Junior learner, a parent
 * or a school visitor pressing it was sent into the adult player regardless of
 * who they were.
 *
 * It now enters the Access Panel, which is the single pathway gateway. The
 * level travels with it as ?level=, which the approved level band on the panel
 * home already reads and shows as "Your chosen level". Nothing else consumes
 * that parameter, and nothing here allocates a level: the ladder is CEFR
 * orientation, not the routing authority, so what happens after the pathway is
 * chosen stays the pathway's own business — placement for the learner
 * pathways, linked-child onboarding for parents, roster allocation for schools,
 * straight to the dashboard for the professional roles.
 *
 * No lesson is resolved here any more, so the curriculum is no longer fetched
 * to draw this page at all.
 *
 * The copy was corrected the same day, and approved with it: "Start <level>"
 * described something that no longer happened. "Continue with <level>" means
 * what it says — carry this level forward as the visitor's selected context,
 * then identify the pathway. It is not a diagnosis of the visitor at that level
 * and it does not unlock or begin a lesson.
 *
 * The design's markup and classes are unchanged.
 */

export function StartLevelButton({ code }: { code: string }) {
  return (
    <Link
      href={`/?level=${encodeURIComponent(code)}#pathways`}
      className="inline-flex items-center gap-2 rounded-full bg-yellow px-6 py-3 text-sm font-bold text-indigo transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-indigo"
    >
      Continue with {code}
      <ArrowRight className="size-4" aria-hidden="true" />
    </Link>
  )
}

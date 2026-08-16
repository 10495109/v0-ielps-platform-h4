'use client'

import { useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { ielpsFetch } from '@/lib/eilps-http'

/**
 * "Start <level>" from the approved Access Panel design.
 *
 * The design's promise is that choosing a level opens the IELPS path from that
 * exact point, so this resolves which lesson that actually is rather than
 * sending everyone to the same default. The lesson id comes from the server:
 * GET /api/curriculum/deep-catalog is the only route that carries per-level
 * units and lessons, and it is the route the approved level band on the Access
 * Panel home already reads. No backend route was added for this and nothing is
 * derived from the level code by pattern — the id is whatever the curriculum
 * says the first lesson of that level is.
 *
 * The catalogue is a large document, so it is not fetched when the page loads.
 * It is fetched on the first sign that someone means to press the button —
 * pointer or keyboard focus — and awaited on the click if it has not arrived
 * yet. Someone who reads the page and leaves pays nothing for it.
 *
 * If the catalogue cannot be read, this falls back to the same destination the
 * approved level band uses for its own Start control, carrying the level. That
 * screen does not claim to be a lesson, so a visitor is never dropped into the
 * wrong level by a failed lookup.
 *
 * Entitlement and sign-in are untouched. The lesson player asks the server, and
 * a visitor who is not signed in or not entitled meets the platform's own
 * answer there exactly as before.
 */

type Lesson = { id?: string }
type Unit = { lessons?: Lesson[] }
type CatalogLevel = { level?: string; units?: Unit[] }

export function StartLevelButton({ code }: { code: string }) {
  const router = useRouter()
  const lookup = useRef<Promise<string | null> | null>(null)

  const resolve = useCallback(() => {
    if (!lookup.current) {
      lookup.current = ielpsFetch<{ levels?: CatalogLevel[] }>('/api/curriculum/deep-catalog')
        .then((data) => {
          const found = (data?.levels ?? []).find(
            (l) => String(l.level ?? '').toUpperCase() === code.toUpperCase(),
          )
          const first = found?.units?.[0]?.lessons?.[0]?.id
          return first ? String(first) : null
        })
        .catch(() => null)
    }
    return lookup.current
  }, [code])

  const start = useCallback(async () => {
    const lessonId = await resolve()
    router.push(
      lessonId
        ? `/app/adult/learner/?lesson=${encodeURIComponent(lessonId)}`
        : `/app/adult/player/?level=${encodeURIComponent(code)}`,
    )
  }, [resolve, router, code])

  return (
    <button
      type="button"
      onPointerEnter={resolve}
      onFocus={resolve}
      onClick={start}
      className="inline-flex items-center gap-2 rounded-full bg-yellow px-6 py-3 text-sm font-bold text-indigo transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-indigo"
    >
      Start {code}
      <ArrowRight className="size-4" aria-hidden="true" />
    </button>
  )
}

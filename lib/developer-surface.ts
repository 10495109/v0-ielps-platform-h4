/**
 * Whether developer-facing wiring detail may be drawn on a learner surface.
 *
 * Added 18 August 2026 by the conformance correction: technical endpoint
 * labels — "POST /api/auth/register", "GET /api/school/parent/dashboard" —
 * must not be presented to a learner as content. They remain available to
 * diagnostics and to the release evidence, which is why this is a switch and
 * not a deletion.
 *
 * The switch is off unless the environment asks for it, so the default build —
 * the one that ships — carries none of it. Nothing about the API wiring depends
 * on this value: no route, no request, no response handling reads it. It
 * decides whether a label is painted, nothing else.
 *
 * To take an endpoint-annotated capture for developer evidence:
 *   NEXT_PUBLIC_IELPS_SHOW_ENDPOINTS=1 npm run build
 */
export const SHOW_ENDPOINT_LABELS =
  process.env.NEXT_PUBLIC_IELPS_SHOW_ENDPOINTS === '1'

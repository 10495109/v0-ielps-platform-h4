import type { LucideIcon } from 'lucide-react'

export type AccentToken =
  | 'primary'
  | 'secondary'
  | 'turquoise'
  | 'gold'
  | 'indigo'

export type Endpoint = { method: string; path: string }

export type PanelKind =
  | 'stat'
  | 'list'
  | 'cards'
  | 'table'
  | 'timeline'
  | 'note'
  | 'action'

/**
 * A real write against a real route.
 *
 * Three rules hold for every action panel and are enforced by the component
 * rather than by each caller. Nothing is reported as done until the server
 * says so — there is no optimistic state anywhere. Nothing is sent until every
 * value the route needs is present, so no sample or placeholder identifier is
 * ever substituted to make a request succeed. And whatever the server answers,
 * including a refusal, is what the learner is shown.
 */
export type ActionField = {
  name: string
  label: string
  hint?: string
  type?: 'text' | 'textarea'
  placeholder?: string
  /**
   * Where a path parameter comes from when it is not typed. `organisation`
   * resolves from the signed-in School context; the field is not shown and the
   * action stays in PARAMETER REQUIRED until it resolves.
   */
  source?: 'organisation'
}

export type ActionSpec = {
  endpoint: Endpoint
  /** Values substituted into `:name` placeholders in the endpoint path. */
  params?: ActionField[]
  /** Values sent in the request body. */
  fields?: ActionField[]
  cta: string
  /** What the action does, and any server-side rule worth stating first. */
  note?: string
  /** Wording for a successful response. The server payload is shown beneath it. */
  successNote?: string
}

/** Normalised shapes each panel kind renders. Samples are authored in these shapes. */
export type StatItem = { label: string; value: string; hint?: string }
export type ListItem = {
  title: string
  subtitle?: string
  meta?: string
  status?: 'ok' | 'pending' | 'alert' | 'info'
}
export type CardItem = {
  title: string
  subtitle?: string
  body?: string
  tag?: string
  image?: string
}
export type TableData = { columns: string[]; rows: string[][] }
export type TimelineItem = { time: string; title: string; detail?: string }

export type Panel = {
  id: string
  title: string
  kind: PanelKind
  /** Endpoint chip shown on the panel and (when GET) used to hydrate it. */
  endpoint?: Endpoint
  /** Override the proxy GET path if it differs from endpoint.path. */
  fetchPath?: string
  /** Map a raw live response into the panel's render shape. */
  transform?: (raw: unknown) => unknown
  /** Fallback sample data, already in the panel's render shape. */
  sample: unknown
  /** Static supporting copy for `note` panels. */
  note?: string
  /**
   * Optional bullets for a `note` panel. Used where the copy is a boundary or
   * a sequence rather than a sentence — role separation, for instance — and a
   * paragraph would bury it. Never carries live or sample data.
   */
  noteItems?: string[]
  /**
   * Render a `note` panel as progressive disclosure: the title stays visible
   * and the explanation opens on request. Used for secondary material that has
   * to be available but should not add to what is on screen by default.
   */
  collapsible?: boolean
  /** Label on the disclosure control when `collapsible` is set. */
  summary?: string
  /** Definition for an `action` panel. */
  action?: ActionSpec
  /**
   * Resolve the `:id` in this panel's path from the signed-in School context
   * before fetching. Until it resolves the panel makes no request and reports
   * PARAMETER REQUIRED, so no sample identifier is ever sent.
   */
  pathParam?: 'organisation'
  /** Override the wording shown when the server answered with no records. */
  emptyNote?: string
  span?: 1 | 2 | 3
}

export type Screen = {
  slug: string
  label: string
  icon: LucideIcon
  title: string
  description: string
  panels: Panel[]
}

export type OnboardingField = {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'select' | 'code'
  placeholder?: string
  options?: string[]
}

export type OnboardingStep = {
  key: string
  title: string
  description: string
  endpoint?: Endpoint
  fields?: OnboardingField[]
  cta: string
}

export type AccountApp = {
  slug: string
  name: string
  role: string
  tagline: string
  intro: string
  accent: AccentToken
  icon: LucideIcon
  image: string
  /** Live EILPS entry route (informational). */
  liveEntry: string
  onboarding: {
    headline: string
    sub: string
    steps: OnboardingStep[]
  }
  screens: Screen[]
  /** Full endpoint group from the server map, shown in the wiring drawer. */
  endpoints: Endpoint[]
  /**
   * Not one of the public account pathways. A protected app has a route and is
   * reachable when the server grants the role, but it is never offered as a
   * choice on the public Access Panel.
   */
  protectedSurface?: boolean
}

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
}

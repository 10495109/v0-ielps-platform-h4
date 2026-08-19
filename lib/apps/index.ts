import type { AccountApp } from './types'
import { junior } from './junior'
import { adult } from './adult'
import { parents } from './parents'
import { teachers } from './teachers'
import { tutors } from './tutors'
import { schools } from './schools'
import { studio } from './studio'
import { admin } from './admin'

/**
 * Every mini-app that has a route, protected surfaces included.
 *
 * The public Access Panel does not read this list — it renders PATHWAYS from
 * lib/ielps-data.ts, which is and stays seven account choices. This list exists
 * so a route can be generated, which is a different question from whether the
 * surface is offered to a visitor.
 */
export const ACCOUNT_APPS: AccountApp[] = [
  junior,
  adult,
  parents,
  teachers,
  tutors,
  schools,
  studio,
  admin,
]

/** The seven account pathways, in the order the Access Panel presents them. */
export const PUBLIC_ACCOUNT_APPS: AccountApp[] = ACCOUNT_APPS.filter(
  (app) => !app.protectedSurface,
)

export const APP_BY_SLUG: Record<string, AccountApp> = Object.fromEntries(
  ACCOUNT_APPS.map((a) => [a.slug, a]),
)

export function getApp(slug: string): AccountApp | undefined {
  return APP_BY_SLUG[slug]
}

export function getScreen(app: AccountApp, screenSlug: string) {
  return app.screens.find((s) => s.slug === screenSlug)
}

export type { AccountApp } from './types'

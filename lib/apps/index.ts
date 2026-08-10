import type { AccountApp } from './types'
import { junior } from './junior'
import { adult } from './adult'
import { parents } from './parents'
import { teachers } from './teachers'
import { tutors } from './tutors'
import { schools } from './schools'
import { studio } from './studio'

export const ACCOUNT_APPS: AccountApp[] = [
  junior,
  adult,
  parents,
  teachers,
  tutors,
  schools,
  studio,
]

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

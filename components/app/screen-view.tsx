'use client'

import { getApp, getScreen } from '@/lib/apps'
import { AppShell } from './app-shell'
import { Panel } from './panel'
import { WiringDrawer } from './wiring-drawer'
import { notFound } from 'next/navigation'

export function ScreenView({
  slug,
  screenSlug,
}: {
  slug: string
  screenSlug: string
}) {
  const app = getApp(slug)
  if (!app) return notFound()
  const screen = getScreen(app, screenSlug)
  if (!screen) return notFound()

  return (
    <AppShell app={app} activeScreen={screen.slug}>
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-balance font-display text-2xl font-bold text-foreground lg:text-3xl">
              {screen.title}
            </h1>
            <p className="mt-1 max-w-2xl text-pretty text-sm text-muted-foreground">
              {screen.description}
            </p>
          </div>
          <WiringDrawer app={app} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {screen.panels.map((panel) => (
            <Panel key={panel.id} panel={panel} accent={app.accent} />
          ))}
        </div>
      </div>
    </AppShell>
  )
}

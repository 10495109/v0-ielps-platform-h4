'use client'

import { useEffect, useState } from 'react'
import { getApp, getScreen } from '@/lib/apps'
import { AppShell } from './app-shell'
import { Panel } from './panel'
import { WiringDrawer } from './wiring-drawer'
import { notFound } from 'next/navigation'
import { fetchCurrentUser } from '@/lib/eilps-auth'

export function ScreenView({
  slug,
  screenSlug,
}: {
  slug: string
  screenSlug: string
}) {
  const [name, setName] = useState<string | null>(null)
  useEffect(() => {
    let cancelled = false
    fetchCurrentUser().then((u) => {
      if (!cancelled && u?.name) setName(u.name)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const app = getApp(slug)
  if (!app) return notFound()
  const screen = getScreen(app, screenSlug)
  if (!screen) return notFound()

  // Greeting titles carry a placeholder name; use the signed-in learner's.
  const title = name ? screen.title.replace(/,\s*[A-Z][\w'-]*$/, `, ${name}`) : screen.title

  return (
    <AppShell app={app} activeScreen={screen.slug}>
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-balance font-display text-2xl font-bold text-foreground lg:text-3xl">
              {title}
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

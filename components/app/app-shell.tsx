'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { ArrowLeft, Menu, PanelsTopLeft, GraduationCap } from 'lucide-react'
import type { AccountApp } from '@/lib/apps/types'
import { ACCENT } from '@/lib/apps/accent'
import { PLAYER_VARIANTS } from '@/lib/lesson-player/variants'
import { cn } from '@/lib/utils'

export function AppShell({
  app,
  activeScreen,
  children,
}: {
  app: AccountApp
  activeScreen?: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const a = ACCENT[app.accent]
  const Icon = app.icon

  return (
    <div className="flex min-h-dvh bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-card transition-transform lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center gap-3 border-b border-border p-4">
          <span className={cn('flex size-10 items-center justify-center rounded-xl', a.solid)}>
            <Icon className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-semibold text-foreground">
              {app.name}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">{app.role}</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="flex flex-col gap-1">
            {app.screens.map((s) => {
              const SIcon = s.icon
              const active = activeScreen === s.slug
              return (
                <li key={s.slug}>
                  <Link
                    href={`/app/${app.slug}/${s.slug}`}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      active
                        ? a.solid
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                  >
                    <SIcon className="size-4" aria-hidden />
                    {s.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="border-t border-border p-3">
          {PLAYER_VARIANTS[app.slug] ? (
            <Link
              href={`/app/${app.slug}/learner`}
              onClick={() => setOpen(false)}
              className={cn(
                'mb-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
                a.solid,
              )}
            >
              <GraduationCap className="size-4" aria-hidden />
              {PLAYER_VARIANTS[app.slug].entryLabel}
            </Link>
          ) : null}
          <Link
            href={`/app/${app.slug}/onboarding`}
            onClick={() => setOpen(false)}
            className={cn(
              'mb-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              PLAYER_VARIANTS[app.slug] ? 'text-muted-foreground hover:bg-muted hover:text-foreground' : a.soft,
            )}
          >
            <PanelsTopLeft className="size-4" aria-hidden />
            Onboarding flow
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            All account types
          </Link>
        </div>
      </aside>

      {open && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-indigo/40 lg:hidden"
        />
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur lg:px-8">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-lg border border-border p-2 text-foreground lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="size-4" aria-hidden />
          </button>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="hidden sm:inline">EILPS</span>
            <span className="hidden sm:inline">/</span>
            <span className="font-medium text-foreground">{app.name}</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Image
              src={app.image}
              alt=""
              width={36}
              height={36}
              className="hidden size-9 rounded-full object-cover ring-2 ring-border sm:block"
            />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ArrowRight, Sparkles, GraduationCap } from 'lucide-react'
import { getApp } from '@/lib/apps'
import { ACCENT } from '@/lib/apps/accent'
import { PLAYER_VARIANTS } from '@/lib/lesson-player/variants'
import { cn } from '@/lib/utils'
import { notFound } from 'next/navigation'

export function MiniAppHome({ slug }: { slug: string }) {
  const app = getApp(slug)
  if (!app) return notFound()
  const a = ACCENT[app.accent]
  const Icon = app.icon
  const variant = PLAYER_VARIANTS[app.slug]

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8 lg:py-14">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          All account types
        </Link>

        {/* Hero */}
        <div
          className={cn(
            'mt-6 grid gap-8 rounded-3xl border border-border bg-gradient-to-br p-6 lg:grid-cols-[1.1fr_1fr] lg:p-10',
            a.gradient,
          )}
        >
          <div className="flex flex-col justify-center">
            <span
              className={cn(
                'inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold',
                a.solid,
              )}
            >
              <Icon className="size-3.5" aria-hidden />
              {app.role}
            </span>
            <h1 className="mt-4 text-balance font-display text-3xl font-bold text-foreground lg:text-4xl">
              {app.tagline}
            </h1>
            <p className="mt-3 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground lg:text-base">
              {app.intro}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/app/${app.slug}/onboarding`}
                className={cn(
                  'inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5',
                  a.solid,
                )}
              >
                Start onboarding
                <Sparkles className="size-4" aria-hidden />
              </Link>
              <Link
                href={`/app/${app.slug}/dashboard`}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition-transform hover:-translate-y-0.5"
              >
                Open dashboard
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
            {variant ? (
              <Link
                href={`/app/${app.slug}/learner`}
                className={cn(
                  'mt-4 inline-flex w-fit items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold transition-transform hover:-translate-y-0.5',
                  a.text,
                )}
              >
                <GraduationCap className="size-4" aria-hidden />
                {variant.entryLabel} — 15-step player
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            ) : null}
          </div>
          <div className="flex items-center justify-center">
            <Image
              src={app.image}
              alt={app.name}
              width={520}
              height={400}
              className="w-full max-w-md rounded-2xl object-cover shadow-sm"
              priority
            />
          </div>
        </div>

        {/* Screens */}
        <h2 className="mt-10 font-display text-lg font-semibold text-foreground">
          Inside this mini-app
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {app.screens.map((s) => {
            const SIcon = s.icon
            return (
              <Link
                key={s.slug}
                href={`/app/${app.slug}/${s.slug}`}
                className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className={cn('flex size-10 items-center justify-center rounded-xl', a.soft)}>
                  <SIcon className="size-5" aria-hidden />
                </span>
                <p className="mt-4 font-display text-sm font-semibold text-foreground">
                  {s.label}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {s.description}
                </p>
                <span className={cn('mt-3 inline-flex items-center gap-1 text-xs font-semibold', a.text)}>
                  Open
                  <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

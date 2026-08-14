'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Check, ChevronRight, ArrowRight, PartyPopper, Loader2 } from 'lucide-react'
import { getApp } from '@/lib/apps'
import type { OnboardingField } from '@/lib/apps/types'
import { ACCENT } from '@/lib/apps/accent'
import { useEilpsAction } from '@/lib/use-eilps'
import { EndpointChip } from './source-badge'
import { cn } from '@/lib/utils'
import { notFound } from 'next/navigation'

export function OnboardingFlow({ slug }: { slug: string }) {
  const resolvedApp = getApp(slug)
  const app = resolvedApp || getApp('adult')!
  const a = ACCENT[app.accent]
  const Icon = app.icon
  const steps = app.onboarding.steps

  const [current, setCurrent] = useState(0)
  const [done, setDone] = useState(false)
  const { submit, pending, error } = useEilpsAction()

  if (!resolvedApp) return notFound()

  const step = steps[current]
  const isLast = current === steps.length - 1
  const needsPlacement = app.slug === 'adult' || app.slug === 'junior'

  async function handleNext(formData: FormData) {
    const body: Record<string, string> = {}
    step.fields?.forEach((f) => {
      body[f.name] = String(formData.get(f.name) || '')
    })
    try {
      if (step.endpoint) {
        await submit(step.endpoint.path, body, step.endpoint.method)
      }
      if (isLast) {
        setDone(true)
      } else {
        setCurrent((c) => c + 1)
      }
    } catch {
      // The server error below keeps the learner on the current verified step.
    }
  }

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1fr_1.1fr] lg:px-8 lg:py-16">
        {/* Left rail */}
        <div className="flex flex-col">
          <Link
            href="/"
            className="mb-8 inline-flex w-fit items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
          >
            EILPS account types
          </Link>
          <span className={cn('flex size-12 items-center justify-center rounded-2xl', a.solid)}>
            <Icon className="size-6" aria-hidden />
          </span>
          <h1 className="mt-5 text-balance font-display text-3xl font-bold text-foreground">
            {app.onboarding.headline}
          </h1>
          <p className="mt-2 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
            {app.onboarding.sub}
          </p>

          <ol className="mt-8 flex flex-col gap-3">
            {steps.map((s, i) => {
              const state = done || i < current ? 'done' : i === current ? 'active' : 'todo'
              return (
                <li key={s.key} className="flex items-center gap-3">
                  <span
                    className={cn(
                      'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                      state === 'done' && 'bg-success text-primary-foreground',
                      state === 'active' && a.solid,
                      state === 'todo' && 'bg-muted text-muted-foreground',
                    )}
                  >
                    {state === 'done' ? <Check className="size-4" aria-hidden /> : i + 1}
                  </span>
                  <span
                    className={cn(
                      'text-sm',
                      state === 'todo' ? 'text-muted-foreground' : 'font-medium text-foreground',
                    )}
                  >
                    {s.title}
                  </span>
                </li>
              )
            })}
          </ol>

          <div className="mt-auto hidden pt-10 lg:block">
            <Image
              src={app.image}
              alt=""
              width={420}
              height={280}
              className="w-full max-w-sm rounded-2xl object-cover"
            />
          </div>
        </div>

        {/* Right: form / success */}
        <div className="flex items-start">
          <div className="w-full rounded-3xl border border-border bg-card p-6 shadow-sm lg:p-8">
            {done ? (
              <div className="flex flex-col items-center py-8 text-center">
                <span className={cn('flex size-14 items-center justify-center rounded-2xl', a.soft)}>
                  <PartyPopper className="size-7" aria-hidden />
                </span>
                <h2 className="mt-5 font-display text-xl font-bold text-foreground">
                  You&apos;re all set
                </h2>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  {needsPlacement
                    ? 'Your learner access is ready. Complete the server-scored placement before your adaptive course starts.'
                    : `Your ${app.role.toLowerCase()} space is ready. Open the dashboard to continue.`}
                </p>
                <Link
                  href={needsPlacement ? `/app/${app.slug}/placement` : `/app/${app.slug}/dashboard`}
                  className={cn(
                    'mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5',
                    a.solid,
                  )}
                >
                  {needsPlacement ? 'Start placement' : 'Open dashboard'}
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>
            ) : (
              <form
                action={handleNext}
                key={step.key}
                className="flex flex-col animate-rise"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    Step {current + 1} of {steps.length}
                  </p>
                  {step.endpoint && (
                    <EndpointChip method={step.endpoint.method} path={step.endpoint.path} />
                  )}
                </div>
                <h2 className="mt-3 font-display text-xl font-bold text-foreground">
                  {step.title}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>

                <div className="mt-6 flex flex-col gap-4">
                  {step.fields?.map((f) => (
                    <Field key={f.name} field={f} />
                  ))}
                  {!step.fields?.length && (
                    <div className={cn('rounded-xl p-4 text-sm', a.soft)}>
                      This step calls the live route directly. Continue to run it.
                    </div>
                  )}
                </div>

                {error && (
                  <p className="mt-4 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                    {error}. This step has not been completed.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={pending}
                  className={cn(
                    'mt-7 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5 disabled:opacity-70',
                    a.solid,
                  )}
                >
                  {pending ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                  ) : (
                    <>
                      {step.cta}
                      {isLast ? (
                        <Check className="size-4" aria-hidden />
                      ) : (
                        <ChevronRight className="size-4" aria-hidden />
                      )}
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ field }: { field: OnboardingField }) {
  const base =
    'w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/25'
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-foreground">{field.label}</span>
      {field.type === 'select' ? (
        <select name={field.name} className={base} defaultValue="">
          <option value="" disabled>
            Choose…
          </option>
          {field.options?.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : (
        <input
          name={field.name}
          type={field.type === 'code' ? 'text' : field.type}
          placeholder={field.placeholder}
          className={cn(base, field.type === 'code' && 'font-mono tracking-widest uppercase')}
        />
      )}
    </label>
  )
}

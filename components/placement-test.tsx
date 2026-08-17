'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, ChevronRight, Loader2 } from 'lucide-react'
import { getApp } from '@/lib/apps'
import { ACCENT } from '@/lib/apps/accent'
import { placementApi } from '@/lib/adapters'
import { useEilps } from '@/lib/use-eilps'
import { SourceBadge } from '@/components/app/source-badge'
import { PlacementExplainer } from '@/components/placement-explainer'

type PlacementItem = {
  id: string
  level: string
  skill: string
  title: string
  prompt: string
  context?: string
  options: string[]
}

type PlacementPayload = {
  items: PlacementItem[]
  totalAvailable: number
  method?: string
  status?: string
  limitations?: string[]
}

export function PlacementTest({ slug }: { slug: 'adult' | 'junior' }) {
  const app = getApp(slug)!
  const a = ACCENT[app.accent]
  const { data, source } = useEilps<PlacementPayload | null>(
    '/api/assessment/level-check?limit=144',
    null,
    (raw) => {
      const payload = raw as PlacementPayload
      if (!Array.isArray(payload.items)) throw new Error('invalid_placement_contract')
      return payload
    },
  )
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string>()
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const item = data?.items[index]
  const answered = item ? answers[item.id] != null : false
  const percent = data?.items.length ? Math.round((Object.keys(answers).length / data.items.length) * 100) : 0
  const responses = useMemo(() => Object.entries(answers).map(([itemId, answer]) => ({ itemId, answer })), [answers])

  async function next() {
    if (!item || !answered) return
    if (data && index + 1 < data.items.length) {
      setIndex((value) => value + 1)
      return
    }
    setPending(true)
    setError(undefined)
    try {
      const scored = await placementApi.score({ responses })
      setResult(scored as Record<string, unknown>)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Placement could not be scored.')
    } finally {
      setPending(false)
    }
  }

  if (source !== 'live') {
    // The explanation of what this diagnostic covers sits here, at the entry to
    // the flow that runs it — relocated from the Access Panel home on
    // 17 Aug 2026. It is orientation, not the test: nothing below begins until
    // a learner signs in and the server sends real items.
    return (
      <main className="min-h-dvh bg-background p-5">
        <div className="mx-auto grid max-w-2xl gap-5">
          <div className="rounded-3xl border border-border bg-card p-6"><div className="flex justify-between gap-3"><h1 className="font-display text-2xl font-bold">IELPS placement</h1><SourceBadge source={source} /></div><p className="mt-3 text-sm text-muted-foreground">Sign in with a learner account to load the operational placement diagnostic. No sample questions are shown.</p><Link href={`/app/${slug}/onboarding`} className="mt-6 inline-flex text-sm font-semibold text-primary underline">Return to learner access</Link></div>
          <PlacementExplainer />
        </div>
      </main>
    )
  }

  if (result) {
    return <main className="min-h-dvh bg-background p-5"><div className="mx-auto max-w-2xl rounded-3xl border border-border bg-card p-6"><span className={`grid size-12 place-items-center rounded-2xl ${a.solid}`}><Check className="size-6" /></span><h1 className="mt-5 font-display text-2xl font-bold">Your placement is ready</h1><p className="mt-2 text-sm text-muted-foreground">Recommended CEFR level</p><p className={`mt-1 font-display text-5xl font-black ${a.text}`}>{String(result.recommendedLevel || result.level || 'Pending')}</p>{result.productiveSkillConfirmationRequired ? <p className="mt-4 rounded-xl border border-gold/40 bg-gold/10 p-3 text-sm">Speaking and writing evidence is required to confirm this advanced placement.</p> : null}<Link href={`/app/${slug}/dashboard`} className={`mt-6 inline-flex rounded-xl px-5 py-3 text-sm font-semibold ${a.solid}`}>Open my course</Link></div></main>
  }

  return (
    <main className="min-h-dvh bg-background px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between gap-3"><Link href={`/app/${slug}/onboarding`} className="inline-flex items-center gap-1 text-sm text-muted-foreground"><ArrowLeft className="size-4" /> Back</Link><SourceBadge source={source} /></div>
        <div className="mt-5 rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-8">
          <div className="flex items-center justify-between text-xs text-muted-foreground"><span>Question {index + 1} of {data?.items.length}</span><span>{percent}% answered</span></div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-border"><div className={`h-full ${a.dot}`} style={{ width: `${percent}%` }} /></div>
          <span className={`mt-6 inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${a.soft}`}>{item?.level} · {item?.skill.replaceAll('_', ' ')}</span>
          <h1 className="mt-4 font-display text-xl font-bold text-foreground sm:text-2xl">{item?.prompt}</h1>
          {item?.context ? <p className="mt-3 rounded-xl bg-soft p-3 text-sm">{item.context}</p> : null}
          <div className="mt-6 grid gap-2">{item?.options.map((option, optionIndex) => <button type="button" key={option} onClick={() => setAnswers((current) => ({ ...current, [item.id]: optionIndex }))} className={`rounded-xl border p-4 text-left text-sm font-medium ${answers[item.id] === optionIndex ? a.solid : 'border-border bg-background hover:border-foreground/30'}`}>{option}</button>)}</div>
          {error ? <p role="alert" className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm">{error}</p> : null}
          <button type="button" disabled={!answered || pending} onClick={next} className={`mt-6 ml-auto flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold disabled:opacity-50 ${a.solid}`}>{pending ? <Loader2 className="size-4 animate-spin" /> : null}{data && index + 1 === data.items.length ? 'Score my placement' : 'Next question'}<ChevronRight className="size-4" /></button>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{data?.method}</p>
      </div>
    </main>
  )
}

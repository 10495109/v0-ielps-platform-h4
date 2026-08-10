'use client'

import { Radio, WifiOff, Loader2, Lock } from 'lucide-react'
import type { DataSource } from '@/lib/use-eilps'
import { cn } from '@/lib/utils'

export function SourceBadge({ source }: { source: DataSource }) {
  if (source === 'loading') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
        <Loader2 className="size-3 animate-spin" aria-hidden />
        Loading
      </span>
    )
  }
  if (source === 'forbidden') {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full bg-gold/25 px-2 py-0.5 text-[10px] font-medium text-indigo"
        title="The endpoint is live, but your role may not read it. Sign in with an administrator account."
      >
        <Lock className="size-3" aria-hidden />
        Admin only
      </span>
    )
  }
  const live = source === 'live'
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
        live ? 'bg-success/12 text-success' : 'bg-muted text-muted-foreground',
      )}
      title={
        live
          ? 'Hydrated from the live EILPS server'
          : 'Live server unavailable — showing sample data'
      }
    >
      {live ? (
        <Radio className="size-3" aria-hidden />
      ) : (
        <WifiOff className="size-3" aria-hidden />
      )}
      {live ? 'Live' : 'Sample'}
    </span>
  )
}

export function EndpointChip({
  method,
  path,
}: {
  method: string
  path: string
}) {
  const tone: Record<string, string> = {
    GET: 'bg-secondary/10 text-secondary',
    POST: 'bg-primary/10 text-primary',
    PATCH: 'bg-gold/25 text-indigo',
    PUT: 'bg-accent/20 text-accent-foreground',
    DELETE: 'bg-destructive/10 text-destructive',
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
      <span className={cn('rounded px-1 py-px font-semibold', tone[method] || 'bg-muted')}>
        {method}
      </span>
      <span className="truncate">{path}</span>
    </span>
  )
}

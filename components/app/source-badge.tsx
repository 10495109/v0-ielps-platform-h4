'use client'

import {
  Radio,
  WifiOff,
  Loader2,
  LockKeyhole,
  ShieldAlert,
  CircleOff,
  Settings,
} from 'lucide-react'
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

  const states = {
    live: { label: 'Live', title: 'Hydrated from the live IELPS server', Icon: Radio, cls: 'bg-success/12 text-success' },
    empty: { label: 'Empty', title: 'The server returned no records for this account', Icon: CircleOff, cls: 'bg-muted text-muted-foreground' },
    authentication: { label: 'Sign in', title: 'Authentication is required for this data', Icon: LockKeyhole, cls: 'bg-muted text-muted-foreground' },
    permission: { label: 'Permission required', title: 'This account does not have permission', Icon: ShieldAlert, cls: 'bg-gold/25 text-indigo' },
    entitlement: { label: 'Upgrade required', title: 'This content requires an active entitlement', Icon: LockKeyhole, cls: 'bg-gold/25 text-indigo' },
    admin: { label: 'Admin only', title: 'An administrator role is required', Icon: ShieldAlert, cls: 'bg-gold/25 text-indigo' },
    provider: { label: 'Provider not configured', title: 'The external provider is not configured', Icon: Settings, cls: 'bg-muted text-muted-foreground' },
    not_implemented: { label: 'Not wired', title: 'No canonical server route was found', Icon: CircleOff, cls: 'bg-muted text-muted-foreground' },
    unavailable: { label: 'Unavailable', title: 'The IELPS server could not provide this data', Icon: WifiOff, cls: 'bg-muted text-muted-foreground' },
    sample: { label: 'Sample', title: 'Explicit demonstration content', Icon: WifiOff, cls: 'bg-muted text-muted-foreground' },
  } as const

  const state = states[source]
  const Icon = state.Icon
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
        state.cls,
      )}
      title={state.title}
    >
      <Icon className="size-3" aria-hidden />
      {state.label}
    </span>
  )
}

export function EndpointChip({ method, path }: { method: string; path: string }) {
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

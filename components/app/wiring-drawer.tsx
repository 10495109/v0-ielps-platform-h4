'use client'

import { useState } from 'react'
import { Cable, X } from 'lucide-react'
import type { AccountApp } from '@/lib/apps/types'
import { EndpointChip } from './source-badge'
import { cn } from '@/lib/utils'

export function WiringDrawer({ app }: { app: AccountApp }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Cable className="size-3.5" aria-hidden />
        Server wiring
        <span className="rounded-full bg-muted px-1.5 py-0.5 font-mono text-[10px]">
          {app.endpoints.length}
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-indigo/40"
          />
          <aside
            className={cn(
              'relative flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-xl',
              'animate-rise',
            )}
          >
            <header className="flex items-center justify-between border-b border-border p-5">
              <div>
                <h2 className="font-display text-base font-semibold text-foreground">
                  Live server wiring
                </h2>
                <p className="text-xs text-muted-foreground">
                  {app.name} · IELPS API contracts
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-border p-2 text-muted-foreground hover:text-foreground"
                aria-label="Close wiring panel"
              >
                <X className="size-4" aria-hidden />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto p-5">
              <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
                This mini-app hydrates its cards and actions from the following
                live IELPS routes under the canonical{' '}
                <code className="rounded bg-muted px-1 py-0.5 font-mono">/api</code>{' '}
                namespace. GET routes without path parameters hydrate automatically.
              </p>
              <ul className="flex flex-col gap-2">
                {app.endpoints.map((e) => (
                  <li key={`${e.method} ${e.path}`}>
                    <EndpointChip method={e.method} path={e.path} />
                  </li>
                ))}
              </ul>
              <p className="mt-5 rounded-lg bg-soft p-3 text-[11px] leading-relaxed text-muted-foreground">
                Live entry route on the platform:{' '}
                <code className="font-mono text-foreground">{app.liveEntry}</code>
              </p>
            </div>
          </aside>
        </div>
      )}
    </>
  )
}

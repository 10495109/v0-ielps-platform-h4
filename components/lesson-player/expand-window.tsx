'use client'

import { useCallback, useEffect, useRef } from 'react'
import { X, Minimize2 } from 'lucide-react'
import type { AccentToken } from '@/lib/apps/types'
import { ACCENT } from '@/lib/apps/accent'

/**
 * The shared expansion window used by the reading and writing activities.
 *
 * The point of it is space: a reading passage and its questions, or a writing
 * prompt and a real writing area, do not fit inside a lesson card. Clicking
 * "expand" lifts the same activity into a window that fills the screen without
 * leaving the lesson, and closing it puts the learner back exactly where they
 * were with their work intact — the window renders the *same* activity state,
 * it does not own a second copy of it.
 *
 * Behaviour: Escape closes, the backdrop closes, focus moves into the window
 * and returns to the trigger, and the page behind does not scroll. On a phone
 * the window is the whole screen; from `sm` up it is a centred card.
 */
export function ExpandWindow({
  open,
  onClose,
  title,
  subtitle,
  accent,
  children,
  footer,
  labelledBy = 'ielps-expand-title',
}: {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  accent: AccentToken
  children: React.ReactNode
  footer?: React.ReactNode
  labelledBy?: string
}) {
  const a = ACCENT[accent]
  const panel = useRef<HTMLDivElement | null>(null)
  const restoreTo = useRef<HTMLElement | null>(null)

  const close = useCallback(() => onClose(), [onClose])

  useEffect(() => {
    if (!open) return
    restoreTo.current = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panel.current?.focus()

    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation()
        close()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
      restoreTo.current?.focus?.()
    }
  }, [open, close])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-center sm:items-center sm:p-6"
      role="presentation"
    >
      <div
        aria-hidden="true"
        onClick={close}
        className="absolute inset-0 bg-indigo/45 backdrop-blur-[2px]"
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className="relative flex h-full w-full flex-col overflow-hidden border-border bg-card shadow-[0_28px_80px_-32px_rgba(13,0,77,0.55)] outline-none sm:h-[min(88vh,52rem)] sm:max-w-6xl sm:rounded-3xl sm:border"
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-border bg-soft px-5 py-4 sm:px-7">
          <div className="min-w-0">
            <h2
              id={labelledBy}
              className="truncate font-display text-lg font-bold text-foreground sm:text-xl"
            >
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={close}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${a.soft} hover:brightness-95`}
          >
            <Minimize2 className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Close window</span>
            <X className="size-4 sm:hidden" aria-hidden="true" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>

        {footer ? (
          <footer className="shrink-0 border-t border-border bg-card px-5 py-3.5 sm:px-7">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>
  )
}

/** The "open the big window" affordance used in the compact lesson card. */
export function ExpandTrigger({
  accent,
  onClick,
  children,
  icon: Icon,
}: {
  accent: AccentToken
  onClick: () => void
  children: React.ReactNode
  icon: React.ComponentType<{ className?: string }>
}) {
  const a = ACCENT[accent]
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-transform hover:-translate-y-0.5 ${a.solid}`}
    >
      <Icon className="size-4" />
      {children}
    </button>
  )
}

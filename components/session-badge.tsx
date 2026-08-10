'use client'

import { useEffect, useState } from 'react'
import { LogOut } from 'lucide-react'
import { fetchCurrentUser, logout, type EilpsUser } from '@/lib/eilps-auth'

const ROLE_LABEL: Record<string, string> = {
  learner: 'Adult learner',
  student: 'Junior learner',
  parent: 'Parent',
  teacher: 'Teacher',
  tutor: 'Live tutor',
  school_admin: 'School admin',
  admin: 'Administrator',
}

/**
 * Shows the live EILPS session. Signing in still happens on the platform's own
 * /signin screen; this reflects that session and can end it.
 */
export function SessionBadge() {
  const [user, setUser] = useState<EilpsUser | null>(null)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchCurrentUser().then((u) => {
      if (cancelled) return
      setUser(u)
      setChecked(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (!checked) {
    return (
      <span className="hidden rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold text-muted-foreground sm:inline-flex">
        Checking session…
      </span>
    )
  }

  if (!user) {
    return (
      <a
        href="/signin"
        className="inline-flex min-h-9 items-center rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5"
      >
        Sign in
      </a>
    )
  }

  const label = ROLE_LABEL[user.role] || user.role

  return (
    <div className="flex items-center gap-2">
      <span className="hidden rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground sm:inline-flex">
        {user.name} · {label}
      </span>
      <button
        type="button"
        onClick={async () => {
          await logout()
          window.location.href = '/'
        }}
        className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <LogOut className="size-4" aria-hidden />
        Sign out
      </button>
    </div>
  )
}

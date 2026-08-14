'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { PipAgent } from './pip-agent'
import { ielpsFetch } from '@/lib/eilps-http'

type PipRole = 'learner' | 'junior' | 'parent' | 'teacher' | 'school' | 'studio' | 'tutor'

/** Server roles do not map one-to-one onto PiP's pathway roles. */
const ROLE_MAP: Record<string, PipRole> = {
  learner: 'learner',
  student: 'learner',
  parent: 'parent',
  teacher: 'teacher',
  tutor: 'tutor',
  school_admin: 'school',
  admin: 'school',
  owner: 'school',
}

/** The account app being viewed is a better signal than the bare server role. */
const SLUG_ROLE: Record<string, PipRole> = {
  junior: 'junior',
  adult: 'learner',
  parents: 'parent',
  teachers: 'teacher',
  tutors: 'tutor',
  schools: 'school',
  studio: 'studio',
}

/**
 * Mounts PiP across the Access Panel and gives it the context it needs to answer
 * usefully: which pathway the user is in, which route they are on, and the role
 * the server actually returned.
 *
 * Junior screens run in safe mode, which is what stops PiP offering billing,
 * tutor, studio or school routes to a child.
 *
 * The role lookup goes through the canonical ielpsFetch helper, so a signed-out
 * visitor gets the 401 classified as `authentication` and PiP simply stays on
 * its default learner role rather than erroring. No credentials are stored.
 */
export function PipMount() {
  const pathname = usePathname() || '/'
  const [role, setRole] = useState<PipRole>('learner')

  const slug = pathname.match(/^\/app\/([^/]+)/)?.[1]
  const slugRole = slug ? SLUG_ROLE[slug] : undefined

  useEffect(() => {
    let cancelled = false
    ielpsFetch<{ user?: { role?: string } }>('/api/auth/me')
      .then((payload) => {
        if (cancelled) return
        const serverRole = payload?.user?.role
        const mapped = serverRole ? ROLE_MAP[String(serverRole)] : undefined
        if (mapped) setRole(mapped)
      })
      .catch(() => {
        /* signed out, or the role is not readable: PiP keeps its default */
      })
    return () => {
      cancelled = true
    }
  }, [])

  const effectiveRole = slugRole ?? role
  const lessonId =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('lesson') ?? undefined
      : undefined

  return (
    <PipAgent
      role={effectiveRole}
      accountPathway={slug}
      route={pathname}
      lessonId={lessonId}
      juniorSafeMode={effectiveRole === 'junior'}
    />
  )
}

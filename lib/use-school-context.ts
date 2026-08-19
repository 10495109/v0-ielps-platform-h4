'use client'

import { useEilps } from './use-eilps'

/**
 * The signed-in School organisation.
 *
 * Several routes are organisation-scoped — the practice report, the parent-link
 * approval, the roster connections — and every one of them needs a real
 * organisation identifier. There is exactly one honest source for it: the
 * server's own answer to GET /api/school/admin/overview, which returns the
 * organisations the caller actually belongs to.
 *
 * When that call has not resolved, or the caller belongs to none, this returns
 * null and every dependent surface stays in PARAMETER REQUIRED. It never falls
 * back to a sample identifier: an id invented to make a request succeed would
 * either fail against a real database or, worse, succeed against somebody
 * else's organisation.
 */

type OrgLike = { id?: unknown; organization_id?: unknown; organizationId?: unknown; name?: unknown }

function firstOrganisation(raw: unknown): { id: string; name?: string } | null {
  if (!raw || typeof raw !== 'object') return null
  const record = raw as Record<string, unknown>
  const list = Array.isArray(record.organizations)
    ? record.organizations
    : Array.isArray(record.organisations)
      ? record.organisations
      : null
  if (!list?.length) return null
  const org = list[0] as OrgLike
  const id = org.id ?? org.organization_id ?? org.organizationId
  if (id == null || id === '') return null
  return { id: String(id), name: typeof org.name === 'string' ? org.name : undefined }
}

export function useSchoolOrganisation() {
  const { data, source } = useEilps<{ id: string; name?: string } | null>(
    '/api/school/admin/overview',
    null,
    (raw) => firstOrganisation(raw),
  )
  return {
    organisationId: data?.id ?? null,
    organisationName: data?.name,
    source,
  }
}

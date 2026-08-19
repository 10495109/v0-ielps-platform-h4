'use client'

import { useState } from 'react'
import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react'
import { IelpsHttpError } from '@/lib/eilps-http'
import { useEilpsAction } from '@/lib/use-eilps'
import { useSchoolOrganisation } from '@/lib/use-school-context'
import { withParams } from '@/lib/adapters'
import type { ActionField, ActionSpec, AccentToken } from '@/lib/apps/types'
import { ACCENT } from '@/lib/apps/accent'
import { cn } from '@/lib/utils'

/**
 * The panel that performs a real write.
 *
 * Everything here exists to keep one promise: the screen never claims an
 * outcome the server has not given. A pending relationship stays pending until
 * a 2xx comes back with the record in it; a refusal is rendered as a refusal in
 * the wording that matches the status; and a request is not sent at all while
 * any value the route needs is still missing, so nothing is ever substituted to
 * make a call go through.
 *
 * The organisation identifier is the case that matters most. It comes from the
 * signed-in School context and from nowhere else. Until it resolves the action
 * is disabled and says PARAMETER REQUIRED, which is the truthful state — an
 * example id here would either fail or act on an organisation that is not the
 * caller's.
 */

const STATE_COPY: Record<string, string> = {
  authentication: 'Sign in to perform this action.',
  permission: 'This account does not have permission to perform this action.',
  entitlement: 'An active lesson or subscription entitlement is required.',
  admin: 'An administrator role is required to perform this action.',
  provider: 'The required external provider has not been configured.',
  not_implemented: 'A canonical server route has not been wired for this action.',
  unavailable: 'The IELPS server could not complete this action.',
}

function messageFor(error: unknown) {
  if (error instanceof IelpsHttpError) {
    // A 4xx validation answer is the server telling the caller what is wrong
    // with the request, so its own words are more useful than a generic line.
    if (error.status === 422 || error.status === 400) {
      return `The server rejected this request: ${error.message}`
    }
    return STATE_COPY[error.state] || error.message
  }
  return error instanceof Error ? error.message : 'The action could not be completed.'
}

export function ActionPanel({ spec, accent }: { spec: ActionSpec; accent: AccentToken }) {
  const a = ACCENT[accent]
  const { organisationId } = useSchoolOrganisation()
  const { submit, pending } = useEilpsAction()
  const [values, setValues] = useState<Record<string, string>>({})
  const [result, setResult] = useState<unknown>(null)
  const [error, setError] = useState<string>()

  const params = spec.params || []
  const fields = spec.fields || []

  const resolve = (field: ActionField) =>
    field.source === 'organisation' ? organisationId || '' : (values[field.name] || '').trim()

  const missing = [...params, ...fields].filter((f) => !resolve(f))
  const unresolvedContext = params.some((f) => f.source === 'organisation' && !organisationId)
  const ready = missing.length === 0 && !pending

  async function run() {
    setError(undefined)
    setResult(null)
    const path = withParams(
      spec.endpoint.path,
      Object.fromEntries(params.map((p) => [p.name, resolve(p)])),
    )
    const body = fields.length
      ? Object.fromEntries(fields.map((f) => [f.name, resolve(f)]))
      : undefined
    try {
      setResult(await submit(path, body, spec.endpoint.method))
    } catch (caught) {
      setError(messageFor(caught))
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {spec.note && <p className="text-sm leading-relaxed text-muted-foreground">{spec.note}</p>}

      {unresolvedContext && (
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Parameter required
          <span className="ml-1 font-normal normal-case tracking-normal">
            The organisation identifier comes from the signed-in School context and has not
            resolved for this account.
          </span>
        </p>
      )}

      {[...params, ...fields]
        .filter((f) => f.source !== 'organisation')
        .map((field) => (
          <label key={field.name} className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-foreground">{field.label}</span>
            {field.type === 'textarea' ? (
              <textarea
                className="min-h-20 rounded-xl border border-border bg-soft px-3 py-2 text-sm"
                value={values[field.name] || ''}
                placeholder={field.placeholder}
                onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
              />
            ) : (
              <input
                className="rounded-xl border border-border bg-soft px-3 py-2 text-sm"
                value={values[field.name] || ''}
                placeholder={field.placeholder}
                onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
              />
            )}
            {field.hint && <span className="text-[11px] text-muted-foreground">{field.hint}</span>}
          </label>
        ))}

      <div>
        <button
          type="button"
          disabled={!ready}
          onClick={run}
          className={cn(
            'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors',
            a.solid,
            !ready && 'cursor-not-allowed opacity-50',
          )}
        >
          {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
          {spec.cta}
        </button>
      </div>

      {error && (
        <div className="flex gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-foreground">
          <AlertTriangle className="size-4 shrink-0 text-destructive" aria-hidden />
          <p>{error}</p>
        </div>
      )}

      {result != null && !error && (
        <div className="flex gap-2 rounded-xl border border-success/30 bg-success/5 p-3 text-sm text-foreground">
          <CheckCircle2 className="size-4 shrink-0 text-success" aria-hidden />
          <div className="min-w-0">
            <p>{spec.successNote || 'The server accepted this action.'}</p>
            {/* The server's own record, shown verbatim. Nothing is summarised
                into a status the response did not contain. */}
            <pre className="mt-2 max-h-40 overflow-auto rounded-lg bg-soft p-2 text-[11px] leading-relaxed">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Award, CheckCircle2, Loader2, Search } from 'lucide-react'
import { certificateApi } from '@/lib/adapters'

export function CertificateVerifier() {
  const [code, setCode] = useState('')
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState<string>()
  const [pending, setPending] = useState(false)

  async function verify(event: React.FormEvent) {
    event.preventDefault()
    if (!code.trim()) return
    setPending(true)
    setError(undefined)
    setResult(null)
    try {
      const raw = await certificateApi.verify(code.trim())
      const root = (raw || {}) as Record<string, unknown>
      setResult((root.certificate || root) as Record<string, unknown>)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Certificate verification failed.')
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="min-h-dvh bg-background px-4 py-12">
      <div className="mx-auto max-w-2xl rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <span className="grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground"><Award className="size-6" /></span>
        <h1 className="mt-5 font-display text-3xl font-bold text-foreground">Verify an IELPS certificate</h1>
        <p className="mt-2 text-sm text-muted-foreground">Enter the public verification code printed on the certificate.</p>
        <form onSubmit={verify} className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input value={code} onChange={(event) => setCode(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-border bg-background px-4 py-3 font-mono text-sm" placeholder="Certificate code" aria-label="Certificate code" />
          <button disabled={pending} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60">
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />} Verify
          </button>
        </form>
        {error ? <p role="alert" className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-foreground">{error}</p> : null}
        {result ? (
          <section className="mt-5 rounded-2xl border border-success/40 bg-success/10 p-5">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground"><CheckCircle2 className="size-5 text-success" /> Certificate verified</h2>
            <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              {Object.entries(result).filter(([, value]) => ['string', 'number', 'boolean'].includes(typeof value)).slice(0, 10).map(([key, value]) => <div key={key}><dt className="text-xs font-semibold uppercase text-muted-foreground">{key.replaceAll('_', ' ')}</dt><dd className="text-foreground">{String(value)}</dd></div>)}
            </dl>
          </section>
        ) : null}
        <Link href="/" className="mt-7 inline-block text-sm font-medium text-primary underline">Return to the Access Panel</Link>
      </div>
    </main>
  )
}

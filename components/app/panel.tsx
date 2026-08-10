'use client'

import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Info,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react'
import { useEilps } from '@/lib/use-eilps'
import type {
  Panel as PanelType,
  StatItem,
  ListItem,
  CardItem,
  TableData,
  TimelineItem,
  AccentToken,
} from '@/lib/apps/types'
import { ACCENT } from '@/lib/apps/accent'
import { SourceBadge, EndpointChip } from './source-badge'
import { cn } from '@/lib/utils'

const SPAN: Record<number, string> = {
  1: 'lg:col-span-1',
  2: 'lg:col-span-2',
  3: 'lg:col-span-3',
}

function hasPlaceholder(path: string) {
  return path.includes(':')
}

export function Panel({
  panel,
  accent,
}: {
  panel: PanelType
  accent: AccentToken
}) {
  const canFetch =
    panel.kind !== 'note' &&
    panel.endpoint?.method === 'GET' &&
    !hasPlaceholder(panel.fetchPath || panel.endpoint.path)

  const fetchPath = canFetch
    ? panel.fetchPath || panel.endpoint!.path
    : null

  const { data, source, error } = useEilps<unknown>(
    fetchPath,
    panel.sample,
    panel.transform
      ? (raw) => {
          const out = panel.transform!(raw)
          // Guard against empty/malformed live payloads — keep the sample.
          if (Array.isArray(out) && out.length === 0) throw new Error('empty')
          return out
        }
      : undefined,
  )

  const displaySource = panel.kind === 'note' ? undefined : source

  return (
    <section
      className={cn(
        'flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm',
        SPAN[panel.span || 1],
      )}
    >
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-sm font-semibold text-foreground">
            {panel.title}
          </h3>
          {panel.endpoint && (
            <div className="mt-1.5">
              <EndpointChip method={panel.endpoint.method} path={panel.endpoint.path} />
            </div>
          )}
        </div>
        {displaySource && <SourceBadge source={displaySource} />}
      </header>

      <div className="flex-1">
        {source === 'forbidden' ? (
          <ForbiddenBody message={error} />
        ) : (
          <PanelBody panel={panel} data={data} accent={accent} />
        )}
      </div>
    </section>
  )
}

/**
 * A 403 is not a failure to show sample data through — the endpoint works, this
 * role just may not read it. Say so plainly, and pass the server's own reason
 * through rather than paraphrasing it.
 */
function ForbiddenBody({ message }: { message?: string }) {
  return (
    <div className="flex gap-3 rounded-xl border border-dashed border-border p-4">
      <ShieldCheck className="size-5 shrink-0 text-muted-foreground" aria-hidden />
      <div>
        <p className="text-sm font-medium text-card-foreground">
          Administrator role required
        </p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {message || 'This account may not read this endpoint.'} Sign in with an
          administrator account to see the live data here.
        </p>
      </div>
    </div>
  )
}

/**
 * The live server may return a shape that doesn't match a panel's render kind
 * (e.g. an object where an array is expected). Coerce to the expected shape,
 * falling back to the authored sample so a panel can never crash on live data.
 */
function coerceArray<T>(data: unknown, sample: unknown): T[] {
  if (Array.isArray(data)) return data as T[]
  return (Array.isArray(sample) ? sample : []) as T[]
}

function coerceTable(data: unknown, sample: unknown): TableData {
  const isTable = (v: unknown): v is TableData =>
    !!v &&
    typeof v === 'object' &&
    Array.isArray((v as TableData).columns) &&
    Array.isArray((v as TableData).rows)
  if (isTable(data)) return data
  return isTable(sample) ? sample : { columns: [], rows: [] }
}

function PanelBody({
  panel,
  data,
  accent,
}: {
  panel: PanelType
  data: unknown
  accent: AccentToken
}) {
  const a = ACCENT[accent]
  switch (panel.kind) {
    case 'stat':
      return <StatGrid items={coerceArray<StatItem>(data, panel.sample)} accent={accent} />
    case 'list':
      return <ListView items={coerceArray<ListItem>(data, panel.sample)} />
    case 'cards':
      return <CardGrid items={coerceArray<CardItem>(data, panel.sample)} accent={accent} />
    case 'table':
      return <TableView data={coerceTable(data, panel.sample)} />
    case 'timeline':
      return <Timeline items={coerceArray<TimelineItem>(data, panel.sample)} accent={accent} />
    case 'note':
      return (
        <div className={cn('flex gap-3 rounded-xl p-4', a.soft)}>
          <ShieldCheck className="size-5 shrink-0" aria-hidden />
          <p className="text-sm leading-relaxed">{panel.note}</p>
        </div>
      )
    default:
      return null
  }
}

function StatGrid({ items, accent }: { items: StatItem[]; accent: AccentToken }) {
  const a = ACCENT[accent]
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
      {items.map((s) => (
        <div key={s.label} className="rounded-xl border border-border bg-soft p-4">
          <div className="flex items-baseline gap-1.5">
            <span className={cn('font-display text-2xl font-bold', a.text)}>
              {s.value}
            </span>
            {s.hint && (
              <span className="text-[10px] font-medium text-muted-foreground">
                {s.hint}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
        </div>
      ))}
    </div>
  )
}

const STATUS_ICON = {
  ok: { icon: CheckCircle2, cls: 'text-success' },
  pending: { icon: Clock, cls: 'text-secondary' },
  alert: { icon: AlertTriangle, cls: 'text-destructive' },
  info: { icon: Info, cls: 'text-muted-foreground' },
}

function ListView({ items }: { items: ListItem[] }) {
  return (
    <ul className="flex flex-col divide-y divide-border">
      {items.map((it, i) => {
        const s = STATUS_ICON[it.status || 'info']
        const Icon = s.icon
        return (
          <li key={i} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
            <Icon className={cn('size-4 shrink-0', s.cls)} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{it.title}</p>
              {it.subtitle && (
                <p className="truncate text-xs text-muted-foreground">{it.subtitle}</p>
              )}
            </div>
            {it.meta && (
              <span className="shrink-0 text-xs font-medium text-muted-foreground">
                {it.meta}
              </span>
            )}
          </li>
        )
      })}
    </ul>
  )
}

function CardGrid({ items, accent }: { items: CardItem[]; accent: AccentToken }) {
  const a = ACCENT[accent]
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((c, i) => (
        <button
          key={i}
          type="button"
          className={cn(
            'group flex flex-col rounded-xl border border-border bg-soft p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md',
          )}
        >
          <div className="flex items-center justify-between gap-2">
            {c.subtitle && (
              <span className="text-[11px] font-medium text-muted-foreground">
                {c.subtitle}
              </span>
            )}
            {c.tag && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold',
                  a.soft,
                )}
              >
                {c.tag}
                <ChevronRight className="size-3 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </span>
            )}
          </div>
          <p className="mt-2 font-display text-sm font-semibold text-foreground">
            {c.title}
          </p>
          {c.body && (
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{c.body}</p>
          )}
        </button>
      ))}
    </div>
  )
}

function TableView({ data }: { data: TableData }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border">
            {data.columns.map((col) => (
              <th
                key={col}
                className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, i) => (
            <tr
              key={i}
              className="border-b border-border/60 last:border-0 hover:bg-soft"
            >
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={cn(
                    'px-3 py-2.5',
                    j === 0 ? 'font-medium text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Timeline({ items, accent }: { items: TimelineItem[]; accent: AccentToken }) {
  const a = ACCENT[accent]
  return (
    <ol className="relative flex flex-col gap-5 pl-5">
      <span className="absolute left-[3px] top-1 bottom-1 w-px bg-border" aria-hidden />
      {items.map((it, i) => (
        <li key={i} className="relative">
          <span
            className={cn(
              'absolute -left-5 top-1 size-2 rounded-full ring-4 ring-card',
              a.dot,
            )}
            aria-hidden
          />
          <p className="text-xs font-semibold text-muted-foreground">{it.time}</p>
          <p className="text-sm font-medium text-foreground">{it.title}</p>
          {it.detail && <p className="text-xs text-muted-foreground">{it.detail}</p>}
        </li>
      ))}
    </ol>
  )
}

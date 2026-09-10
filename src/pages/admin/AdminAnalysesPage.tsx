import { useCallback, useEffect, useState } from 'react'
import { admin, adminResultHref, fmtKmh, type AdminAnalysisRow } from '../../api/admin'
import { OpenReportButton } from '../../components/admin/OpenReportButton'
import { Card, Chip, Reveal } from '../../components/site/ui'

// TODO: For Future
// const PIPELINE_FILTERS = [
//   { key: '', label: 'All' },
//   { key: 'action', label: 'Action' },
//   { key: 'ball_flight', label: 'Ball flight' },
// ]

const STATUS_FILTERS = [
  { key: '', label: 'Any status' },
  { key: 'completed', label: 'Completed' },
  { key: 'processing', label: 'Processing' },
  { key: 'analyzing', label: 'Analyzing' },
  { key: 'queued', label: 'Queued' },
  { key: 'failed', label: 'Failed' },
]

function statusTone(status: string): 'ok' | 'warn' | 'bad' | 'neutral' | 'lime' {
  if (status === 'completed') return 'ok'
  if (status === 'failed') return 'bad'
  if (status === 'queued') return 'neutral'
  return 'warn'
}

function when(iso: string) {
  return new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function threwLine(a: AdminAnalysisRow) {
  return (
    [a.delivery_type, a.bowling_arm ? `${a.bowling_arm}-arm` : null, a.bowling_style].filter(Boolean).join(' · ') || '—'
  )
}

export function AdminAnalysesPage() {
  const [items, setItems] = useState<AdminAnalysisRow[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  // TODO: For Future
  // const [pipeline, setPipeline] = useState('')
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 20

  const load = useCallback(() => {
    admin
      .analyses({ pipeline: 'action', status: status || undefined, search: search || undefined, page, pageSize })
      // TODO: For Future — both pipelines: pipeline: pipeline || undefined
      .then((r) => {
        setItems(r.items)
        setTotal(r.total)
        setLoadError(null)
      })
      .catch((err) => {
        setItems([])
        setLoadError(err instanceof Error ? err.message : 'Could not load analyses')
      })
  }, [status, search, page])
  // TODO: For Future — include pipeline in deps when restored: [pipeline, status, search, page]

  useEffect(() => {
    load()
  }, [load])

  const pages = Math.max(1, Math.ceil(total / pageSize))

  const pager = (
    <div className="flex items-center justify-between border-t border-white/8 px-5 py-3 text-xs text-chalk/50">
      <span>
        Page {page} of {pages}
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="min-h-10 rounded-lg border border-white/10 px-3 py-1.5 font-semibold disabled:opacity-30"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={page >= pages}
          onClick={() => setPage((p) => Math.min(pages, p + 1))}
          className="min-h-10 rounded-lg border border-white/10 px-3 py-1.5 font-semibold disabled:opacity-30"
        >
          Next
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <h1 className="font-display text-3xl font-extrabold text-chalk">Analyses</h1>
        <p className="pt-1.5 text-sm text-chalk/55">{total} action analyses.</p>
        {/* TODO: For Future — both pipelines: {total} analyses across both pipelines. */}
      </Reveal>

      <Reveal delay={40}>
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={search}
            onChange={(e) => {
              setPage(1)
              setSearch(e.target.value)
            }}
            placeholder="Search by player name…"
            className="field field-dark w-full max-w-xs"
          />
          {/* TODO: For Future
          <div className="flex flex-wrap gap-1.5">
            {PIPELINE_FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => {
                  setPage(1)
                  setPipeline(f.key)
                }}
                className={`min-h-10 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                  pipeline === f.key
                    ? 'border-lime/50 bg-lime/15 text-lime'
                    : 'border-white/10 bg-white/[0.03] text-chalk/60 hover:text-chalk'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          */}
          <select
            value={status}
            onChange={(e) => {
              setPage(1)
              setStatus(e.target.value)
            }}
            className="field field-dark w-auto min-h-10"
          >
            {STATUS_FILTERS.map((f) => (
              <option key={f.key} value={f.key} className="bg-charcoal">
                {f.label}
              </option>
            ))}
          </select>
        </div>
      </Reveal>

      <Reveal delay={80}>
        {loadError ? (
          <div role="alert" className="mb-3 rounded-2xl border border-bad/30 bg-bad/10 px-4 py-3 text-sm text-bad">
            {loadError}
          </div>
        ) : null}
        {/* Mobile: stacked cards so Open stays reachable without sideways scroll. */}
        <div className="flex flex-col gap-3 md:hidden">
          {items === null ? (
            [0, 1, 2].map((i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-white/5" />)
          ) : items.length === 0 ? (
            <Card tone="dark" interactive={false} className="p-8 text-center text-sm text-chalk/40">
              No analyses match those filters.
            </Card>
          ) : (
            items.map((a) => {
              const href = a.status === 'completed' ? adminResultHref(a.pipeline, a.result_id) : null
              return (
                <Card key={a.id} tone="dark" interactive={false} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-display text-base font-bold text-chalk">{a.player_name ?? '—'}</p>
                      <p className="truncate text-xs text-chalk/40">{a.user ? a.user.name : 'Unattributed'}</p>
                      <p className="pt-1 text-xs capitalize text-chalk/55">{threwLine(a)}</p>
                      {/* TODO: For Future
                      <p className="pt-1 text-xs capitalize text-chalk/55">
                        {a.pipeline === 'action' ? 'Action' : 'Ball flight'} · {threwLine(a)}
                      </p>
                      */}
                      <div className="flex flex-wrap items-center gap-2 pt-2">
                        <Chip tone={statusTone(a.status)}>{a.status}</Chip>
                        <span className="text-xs font-semibold text-chalk">{fmtKmh(a.ball_speed_kmh)}</span>
                        <span className="text-[11px] text-chalk/40">{when(a.created_at)}</span>
                      </div>
                    </div>
                    {href ? <OpenReportButton to={href} /> : null}
                  </div>
                </Card>
              )
            })
          )}
          {items && items.length > 0 ? (
            <Card tone="dark" interactive={false} className="overflow-hidden p-0">
              {pager}
            </Card>
          ) : null}
        </div>

        <Card tone="dark" interactive={false} className="hidden overflow-hidden p-0 md:block">
          <div className="scroll-slim overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/8 text-[11px] uppercase tracking-[0.1em] text-chalk/40">
                  <th className="px-5 py-3 font-semibold">Player</th>
                  <th className="px-5 py-3 font-semibold">User</th>
                  <th className="px-5 py-3 font-semibold">Threw</th>
                  <th className="px-5 py-3 font-semibold">Ball</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Created</th>
                  <th className="px-5 py-3 text-right font-semibold">Open</th>
                </tr>
              </thead>
              <tbody>
                {items === null ? (
                  [0, 1, 2].map((i) => (
                    <tr key={i}>
                      <td colSpan={7} className="px-5 py-3">
                        <div className="h-8 animate-pulse rounded-lg bg-white/5" />
                      </td>
                    </tr>
                  ))
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-chalk/40">
                      No analyses match those filters.
                    </td>
                  </tr>
                ) : (
                  items.map((a) => {
                    const href = a.status === 'completed' ? adminResultHref(a.pipeline, a.result_id) : null
                    return (
                      <tr key={a.id} className="border-b border-white/6">
                        <td className="px-5 py-3 font-semibold text-chalk">{a.player_name ?? '—'}</td>
                        <td className="px-5 py-3 text-chalk/60">
                          {a.user ? (
                            <>
                              <p>{a.user.name}</p>
                              <p className="text-xs text-chalk/35">{a.user.email}</p>
                            </>
                          ) : (
                            <span className="text-chalk/30">Unattributed</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-chalk/60">
                          <p className="capitalize">{threwLine(a)}</p>
                          {/* TODO: For Future
                          <p>{a.pipeline === 'action' ? 'Action' : 'Ball flight'}</p>
                          <p className="text-xs capitalize text-chalk/40">{threwLine(a)}</p>
                          */}
                        </td>
                        <td className="px-5 py-3 font-semibold text-chalk">{fmtKmh(a.ball_speed_kmh)}</td>
                        <td className="px-5 py-3">
                          <Chip tone={statusTone(a.status)}>{a.status}</Chip>
                          {a.status === 'failed' && a.message ? (
                            <p className="max-w-xs truncate pt-1 text-[11px] text-bad/80">{a.message}</p>
                          ) : null}
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap text-chalk/60">{when(a.created_at)}</td>
                        <td className="px-5 py-3 text-right">
                          {href ? <OpenReportButton to={href} /> : <span className="text-xs text-chalk/25">—</span>}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
          {pager}
        </Card>
      </Reveal>
    </div>
  )
}

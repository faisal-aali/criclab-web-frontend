import { useCallback, useEffect, useState } from 'react'
import { admin, type AdminAnalysisRow } from '../../api/admin'
import { Card, Chip, Reveal } from '../../components/site/ui'

const PIPELINE_FILTERS = [
  { key: '', label: 'All' },
  { key: 'action', label: 'Action' },
  { key: 'ball_flight', label: 'Ball flight' },
]
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

export function AdminAnalysesPage() {
  const [items, setItems] = useState<AdminAnalysisRow[] | null>(null)
  const [total, setTotal] = useState(0)
  const [pipeline, setPipeline] = useState('')
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 20

  const load = useCallback(() => {
    admin
      .analyses({ pipeline: pipeline || undefined, status: status || undefined, search: search || undefined, page, pageSize })
      .then((r) => {
        setItems(r.items)
        setTotal(r.total)
      })
      .catch(() => setItems([]))
  }, [pipeline, status, search, page])

  useEffect(() => {
    load()
  }, [load])

  const pages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <h1 className="font-display text-3xl font-extrabold text-chalk">Analyses</h1>
        <p className="pt-1.5 text-sm text-chalk/55">{total} analyses across both pipelines.</p>
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
            className="field field-dark max-w-xs"
          />
          <div className="flex gap-1.5">
            {PIPELINE_FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => {
                  setPage(1)
                  setPipeline(f.key)
                }}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                  pipeline === f.key
                    ? 'border-lime/50 bg-lime/15 text-lime'
                    : 'border-white/10 bg-white/[0.03] text-chalk/60 hover:text-chalk'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <select
            value={status}
            onChange={(e) => {
              setPage(1)
              setStatus(e.target.value)
            }}
            className="field field-dark w-auto"
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
        <Card tone="dark" interactive={false} className="overflow-hidden p-0">
          <div className="scroll-slim overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/8 text-[11px] uppercase tracking-[0.1em] text-chalk/40">
                  <th className="px-5 py-3 font-semibold">Player</th>
                  <th className="px-5 py-3 font-semibold">User</th>
                  <th className="px-5 py-3 font-semibold">Pipeline</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Created</th>
                </tr>
              </thead>
              <tbody>
                {items === null ? (
                  [0, 1, 2].map((i) => (
                    <tr key={i}>
                      <td colSpan={5} className="px-5 py-3">
                        <div className="h-8 animate-pulse rounded-lg bg-white/5" />
                      </td>
                    </tr>
                  ))
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-chalk/40">
                      No analyses match those filters.
                    </td>
                  </tr>
                ) : (
                  items.map((a) => (
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
                        {a.pipeline === 'action' ? 'Action' : 'Ball flight'}
                      </td>
                      <td className="px-5 py-3">
                        <Chip tone={statusTone(a.status)}>{a.status}</Chip>
                        {a.status === 'failed' && a.message ? (
                          <p className="pt-1 max-w-xs truncate text-[11px] text-bad/80">{a.message}</p>
                        ) : null}
                      </td>
                      <td className="px-5 py-3 text-chalk/60">{when(a.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-white/8 px-5 py-3 text-xs text-chalk/50">
            <span>
              Page {page} of {pages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-white/10 px-3 py-1.5 font-semibold disabled:opacity-30"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= pages}
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                className="rounded-lg border border-white/10 px-3 py-1.5 font-semibold disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>
        </Card>
      </Reveal>
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { admin, fmtKmh, type AdminLeaderboardRow } from '../../api/admin'
import { Card, Chip, Reveal } from '../../components/site/ui'
import { ResultsPage } from '../ResultsPage'

function when(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

function medal(rank: number) {
  if (rank === 1) return { label: '1st', className: 'border-lime/50 bg-lime text-night' }
  if (rank === 2) return { label: '2nd', className: 'border-white/25 bg-white/15 text-chalk' }
  if (rank === 3) return { label: '3rd', className: 'border-seam/40 bg-seam/20 text-seam' }
  return { label: String(rank), className: 'border-white/12 bg-white/5 text-chalk/70' }
}

export function AdminLeaderboardPage() {
  const [params, setParams] = useSearchParams()
  const selected = params.get('report')
  const [items, setItems] = useState<AdminLeaderboardRow[] | null>(null)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    admin
      .leaderboard()
      .then((r) => setItems(r.items))
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load the leaderboard'))
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q || !items) return items ?? []
    return items.filter((row) => {
      const hay = [row.player_name, row.user?.name, row.user?.email, row.delivery_type, row.bowling_arm]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [items, search])

  const selectedRow = items?.find((r) => r.result_id === selected) ?? null

  const openReport = (id: string) => setParams({ report: id }, { replace: true })
  const closeReport = () => setParams({}, { replace: true })

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5 lg:min-h-0">
      <Reveal className="shrink-0">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-chalk">Leaderboard</h1>
            <p className="pt-1.5 text-sm text-chalk/55">
              Every ranked Action throw, fastest first. Open a row to read that player’s report.
            </p>
          </div>
          {items ? <Chip>{items.length} ranked</Chip> : null}
        </div>
      </Reveal>

      {error ? (
        <div role="alert" className="rounded-2xl border border-bad/30 bg-bad/10 px-4 py-3.5 text-sm text-bad">
          {error}
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col gap-5 xl:flex-row xl:items-stretch">
        <div className="flex min-h-0 flex-1 flex-col gap-3 xl:w-[22rem] xl:shrink-0">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by player, email, delivery…"
            className="field field-dark w-full shrink-0"
          />

          <Card tone="dark" interactive={false} className="flex min-h-0 flex-1 flex-col overflow-hidden p-0">
            <div className="scroll-visible min-h-0 flex-1">
            {items === null && !error ? (
              <div className="space-y-2 p-4">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded-xl bg-white/5" />
                ))}
              </div>
            ) : null}

            {items && filtered.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-chalk/40">
                {items.length === 0 ? 'No ranked throws yet.' : 'No throws match that search.'}
              </p>
            ) : null}

            {filtered.length > 0 ? (
              <ul className="divide-y divide-white/6">
                {filtered.map((row) => {
                  const tone = medal(row.rank)
                  const active = selected === row.result_id
                  return (
                    <li key={`${row.rank}-${row.result_id}`}>
                      <button
                        type="button"
                        onClick={() => openReport(row.result_id)}
                        className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition ${
                          active ? 'bg-lime/12' : 'hover:bg-white/[0.04]'
                        }`}
                      >
                        <span
                          className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border text-xs font-extrabold ${tone.className}`}
                        >
                          {tone.label}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-1.5">
                            <span className="truncate font-semibold text-chalk">{row.player_name}</span>
                            {row.delivery_type ? (
                              <Chip tone="neutral">{row.delivery_type}</Chip>
                            ) : null}
                          </span>
                          <span className="mt-0.5 block truncate text-[11px] text-chalk/40">
                            {row.user?.email || row.user?.name || 'Unattributed'}
                            {row.bowling_arm ? ` · ${row.bowling_arm}-arm` : ''}
                            {row.created_at ? ` · ${when(row.created_at)}` : ''}
                          </span>
                        </span>
                        <span className="shrink-0 text-right">
                          <span className="font-display block text-lg font-extrabold leading-none text-gradient-lime">
                            {fmtKmh(row.ball_speed_kmh)}
                          </span>
                          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-chalk/40">
                            km/h
                          </span>
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            ) : null}
            </div>
          </Card>
        </div>

        {selected ? (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40 bg-night/70 xl:hidden"
              aria-label="Close report"
              onClick={closeReport}
            />
            <aside className="fixed inset-0 z-50 flex flex-col bg-charcoal xl:static xl:z-auto xl:min-w-0 xl:flex-1 xl:rounded-[var(--radius-card)] xl:border xl:border-white/10 xl:bg-charcoal/40">
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/8 px-3 py-3 sm:px-4">
                <p className="text-sm font-semibold text-chalk/80">Staff report</p>
                <div className="flex shrink-0 items-center gap-2">
                  <Link
                    to={`/admin/reports/${selected}`}
                    className="rounded-lg border border-white/12 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-chalk/60 transition hover:border-lime/40 hover:text-chalk"
                  >
                    Full page
                  </Link>
                  {selectedRow?.user_id ? (
                    <Link
                      to={`/admin/users/${selectedRow.user_id}/history`}
                      className="hidden rounded-lg border border-white/12 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-chalk/60 transition hover:border-lime/40 hover:text-chalk sm:inline-flex"
                    >
                      History
                    </Link>
                  ) : null}
                  <button
                    type="button"
                    onClick={closeReport}
                    className="grid h-9 w-9 place-items-center rounded-lg border border-white/12 text-chalk/60 transition hover:border-lime/40 hover:text-chalk"
                    aria-label="Close report"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="scroll-visible min-h-0 flex-1 overflow-x-hidden px-3 py-4 sm:px-5 sm:py-5">
                <ResultsPage key={selected} deliveryId={selected} />
              </div>
            </aside>
          </>
        ) : (
          <div className="hidden min-w-0 flex-1 items-center justify-center rounded-[var(--radius-card)] border border-dashed border-white/12 xl:flex">
            <p className="max-w-xs text-center text-sm text-chalk/40">
              Select a throw to open that player’s report on the right.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

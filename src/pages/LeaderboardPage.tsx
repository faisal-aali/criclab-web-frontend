import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listLeaderboard, type LeaderboardRow } from '../api/client'
import { Backdrop, Card, Chip, Reveal, TiltCard } from '../components/site/ui'

function fmtKmh(n: number | null) {
  return typeof n === 'number' && Number.isFinite(n) ? n.toFixed(1) : '—'
}

function when(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

function medal(rank: number) {
  if (rank === 1) return { label: '1st', className: 'border-lime/50 bg-lime text-night' }
  if (rank === 2) return { label: '2nd', className: 'border-white/25 bg-white/15 text-chalk' }
  if (rank === 3) return { label: '3rd', className: 'border-seam/40 bg-seam/20 text-seam' }
  return { label: String(rank), className: 'border-white/12 bg-white/5 text-chalk/70' }
}

function ThrowRow({ row, max }: { row: LeaderboardRow; max: number }) {
  const speed = row.ball_speed_kmh ?? 0
  const width = max > 0 ? Math.max(8, (speed / max) * 100) : 8
  const tone = medal(row.rank)
  const inner = (
    <Card
      interactive={row.mine}
      className={`ring-glow flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5 ${
        row.mine ? 'border-lime/35' : ''
      }`}
    >
      <span
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border font-display text-sm font-extrabold ${tone.className}`}
      >
        {tone.label}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-display text-base font-bold text-chalk">{row.player_name}</p>
          {row.mine ? <Chip tone="lime">You</Chip> : null}
          {row.delivery_type ? <Chip tone="neutral">{row.delivery_type}</Chip> : null}
        </div>
        <p className="pt-1 text-xs text-chalk/40">
          {row.bowling_arm ? `${row.bowling_arm}-arm · ` : ''}
          {row.created_at ? when(row.created_at) : ''}
          {row.mine ? ' · open your report' : ''}
        </p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/8">
          <div className="h-full rounded-full bg-gradient-to-r from-lime/70 to-lime" style={{ width: `${width}%` }} />
        </div>
      </div>
      <div className="shrink-0 text-right">
        <p className="font-display text-3xl font-extrabold leading-none text-gradient-lime">{fmtKmh(row.ball_speed_kmh)}</p>
        <p className="pt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-chalk/40">km/h ball</p>
        {row.arm_speed_kmh != null ? (
          <p className="pt-1 text-xs text-chalk/50">{fmtKmh(row.arm_speed_kmh)} arm</p>
        ) : null}
      </div>
    </Card>
  )

  if (row.mine && row.result_id) {
    return (
      <Link to={`/app/results/${row.result_id}`} className="block">
        <TiltCard max={4}>{inner}</TiltCard>
      </Link>
    )
  }
  return inner
}

export function LeaderboardPage() {
  const [items, setItems] = useState<LeaderboardRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listLeaderboard()
      .then((r) => setItems(r.items))
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load the leaderboard'))
  }, [])

  const max = Math.max(1, ...(items ?? []).map((r) => r.ball_speed_kmh ?? 0))
  const podium = (items ?? []).slice(0, 3)
  const rest = (items ?? []).slice(3)

  return (
    <div className="space-y-7">
      <Reveal className="on-night relative overflow-hidden rounded-[var(--radius-card)] border border-white/10 px-5 py-7 sm:px-7 sm:py-8">
        <Backdrop plate="stadium" scrim="dark" parallax={0.07} />
        <div
          className="pointer-events-none absolute -right-16 -top-14 h-52 w-52 animate-glow-breathe rounded-full bg-lime/10 blur-[90px]"
          aria-hidden
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <Chip tone="lime">Leaderboard</Chip>
            <h1 className="font-display mt-3 text-3xl font-extrabold leading-tight text-chalk sm:text-4xl">
              Fastest <span className="text-gradient-lime">throws</span>
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-chalk/60">
              The twenty quickest Action deliveries on CricLab, ranked by measured ball speed — not
              estimates, not Ball flight. Other players’ full reports stay private.
            </p>
          </div>
          {items?.length ? <Chip>{items.length} ranked</Chip> : null}
        </div>
      </Reveal>

      {error ? (
        <div role="alert" className="rounded-2xl border border-bad/30 bg-bad/10 px-4 py-3.5 text-sm text-bad">
          {error}
        </div>
      ) : null}

      {items === null && !error ? (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      ) : null}

      {items && items.length === 0 ? (
        <Card interactive={false} className="p-10 text-center">
          <p className="font-display text-lg font-bold text-chalk">No ranked throws yet</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-chalk/55">
            A delivery only appears here once Action has a measured ball speed.
          </p>
        </Card>
      ) : null}

      {podium.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-3">
          {podium.map((row, i) => (
            <Reveal key={`${row.rank}-${row.created_at}`} delay={i * 60}>
              <ThrowRow row={row} max={max} />
            </Reveal>
          ))}
        </div>
      ) : null}

      {rest.length > 0 ? (
        <div className="flex flex-col gap-3">
          {rest.map((row, i) => (
            <Reveal key={`${row.rank}-${row.created_at}`} delay={Math.min(i * 40, 240)}>
              <ThrowRow row={row} max={max} />
            </Reveal>
          ))}
        </div>
      ) : null}
    </div>
  )
}

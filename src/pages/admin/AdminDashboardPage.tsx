import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { admin, adminResultHref, fmtKmh, type DashboardRange, type DashboardSummary } from '../../api/admin'
import { OpenReportButton } from '../../components/admin/OpenReportButton'
import { BarList, Donut, TrendLine } from '../../components/admin/charts'
import { Card, Chip, Reveal } from '../../components/site/ui'

const RANGES: { key: DashboardRange; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: '7d', label: '7 days' },
  { key: '30d', label: '30 days' },
  { key: '90d', label: '90 days' },
]

function HealthRow({
  label,
  value,
  hint,
  tone = 'default',
}: {
  label: string
  value: number
  hint?: string
  tone?: 'default' | 'warn' | 'bad' | 'ok'
}) {
  const color =
    tone === 'bad' ? 'text-bad' : tone === 'warn' ? 'text-warn' : tone === 'ok' ? 'text-ok' : 'text-chalk'
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-white/6 py-2.5 last:border-0">
      <div>
        <p className="text-sm text-chalk/70">{label}</p>
        {hint ? <p className="text-[11px] text-chalk/35">{hint}</p> : null}
      </div>
      <p className={`font-display text-xl font-extrabold ${color}`}>{value}</p>
    </div>
  )
}

export function AdminDashboardPage() {
  const [range, setRange] = useState<DashboardRange>('30d')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [data, setData] = useState<DashboardSummary | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (range === 'custom' && (!customFrom || !customTo)) return
    admin
      .dashboard(range, range === 'custom' ? customFrom : undefined, range === 'custom' ? customTo : undefined)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load the dashboard'))
  }, [range, customFrom, customTo])

  const maxThrow = Math.max(1, ...(data?.recent_throws ?? []).map((t) => t.ball_speed_kmh ?? 0))

  return (
    <div className="flex flex-col gap-8">
      <Reveal>
        <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-night px-5 py-7 sm:px-8 sm:py-9">
          <div
            className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-lime/15 blur-[110px]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-seam/20 blur-[90px]"
            aria-hidden
          />
          <div className="relative flex flex-col gap-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-lime">Platform pulse</p>
                <h1 className="font-display mt-2 text-4xl font-extrabold tracking-tight text-chalk sm:text-5xl">
                  Command centre
                </h1>
                <p className="mt-2 max-w-lg text-sm text-chalk/55">
                  Who signed up, what got analysed, and which throws just landed — without a wall of
                  identical cards.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] p-1">
                {RANGES.map((r) => (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => setRange(r.key)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                      range === r.key ? 'bg-lime text-night' : 'text-chalk/55 hover:text-chalk'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setRange('custom')}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                    range === 'custom' ? 'bg-lime text-night' : 'text-chalk/55 hover:text-chalk'
                  }`}
                >
                  Custom
                </button>
              </div>
            </div>
            {range === 'custom' ? (
              <div className="flex flex-wrap gap-2">
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="field field-dark !py-1.5 text-xs"
                />
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="field field-dark !py-1.5 text-xs"
                />
              </div>
            ) : null}

            {data ? (
              <div className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 sm:p-6">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-chalk/40">
                    Analyses in this range
                  </p>
                  <p className="font-display mt-2 text-6xl font-extrabold leading-none text-chalk sm:text-7xl">
                    {data.videos.range}
                  </p>
                  <p className="mt-3 text-sm text-chalk/50">
                    {data.videos.total} completed all-time · {data.videos.today} today · {data.videos.week} this
                    week
                  </p>
                  <div className="mt-5">
                    <TrendLine points={data.analyses_trend} height={88} />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                  <Link
                    to="/admin/users"
                    className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 transition hover:border-lime/30"
                  >
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-chalk/40">Accounts</p>
                    <p className="font-display mt-1 text-3xl font-extrabold text-chalk">{data.users.total}</p>
                    <p className="pt-1 text-xs text-chalk/45">
                      {data.users.new} new · {data.users.active} active in 24h
                    </p>
                  </Link>
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-chalk/40">Live pipeline</p>
                    <p
                      className={`font-display mt-1 text-3xl font-extrabold ${
                        data.videos.processing ? 'text-warn' : 'text-chalk'
                      }`}
                    >
                      {data.videos.processing}
                    </p>
                    <p className="pt-1 text-xs text-chalk/45">
                      {data.videos.failed_range} failed in range · {data.videos.failed_total} ever
                    </p>
                  </div>
                  <Link
                    to="/admin/tickets"
                    className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 transition hover:border-lime/30"
                  >
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-chalk/40">Open tickets</p>
                    <p className={`font-display mt-1 text-3xl font-extrabold ${data.support.open ? 'text-warn' : 'text-ok'}`}>
                      {data.support.open}
                    </p>
                    <p className="pt-1 text-xs text-chalk/45">{data.support.resolved} resolved</p>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
                <div className="h-52 animate-pulse rounded-2xl bg-white/5" />
                <div className="h-52 animate-pulse rounded-2xl bg-white/5" />
              </div>
            )}
          </div>
        </div>
      </Reveal>

      {error ? <div className="rounded-xl border border-bad/30 bg-bad/10 px-4 py-2.5 text-sm text-bad">{error}</div> : null}

      {data ? (
        <>
          <Reveal delay={40}>
            <div className="grid gap-4 lg:grid-cols-5">
              <Card tone="dark" interactive={false} className="p-5 lg:col-span-3">
                <p className="pb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-chalk/40">
                  Signups over the range
                </p>
                <TrendLine points={data.signups_trend} />
              </Card>
              <Card tone="dark" interactive={false} className="p-5 lg:col-span-2">
                <p className="pb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-chalk/40">
                  Pipelines this range
                </p>
                <BarList
                  rows={[
                    { label: 'Action', value: data.videos.by_pipeline.action },
                    { label: 'Ball flight', value: data.videos.by_pipeline.ball_flight, tone: '#d9743c' },
                  ]}
                />
              </Card>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="grid gap-4 lg:grid-cols-3">
              <Card tone="dark" interactive={false} className="p-5">
                <div className="flex items-center justify-between pb-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-chalk/40">People</p>
                  <Link to="/admin/users" className="text-[11px] font-bold uppercase tracking-[0.12em] text-lime">
                    Users
                  </Link>
                </div>
                <HealthRow label="Unverified" value={data.users.unverified} tone={data.users.unverified ? 'warn' : 'ok'} />
                <HealthRow label="Inactive" value={data.users.inactive} />
                <HealthRow
                  label="Disabled"
                  value={data.users.disabled}
                  tone={data.users.disabled ? 'bad' : 'default'}
                />
              </Card>
              {/* TODO: For Future */}
              {/* <Card tone="dark" interactive={false} className="p-5">
                <div className="flex items-center justify-between pb-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-chalk/40">Coaching</p>
                  <Link to="/admin/coaching" className="text-[11px] font-bold uppercase tracking-[0.12em] text-lime">
                    Bookings
                  </Link>
                </div>
                <Donut
                  segments={[
                    { label: 'Upcoming', value: data.coaching.upcoming },
                    { label: 'Completed', value: data.coaching.completed },
                    { label: 'Cancelled', value: data.coaching.cancelled },
                  ]}
                />
              </Card> */}
              <Card tone="dark" interactive={false} className="p-5">
                <div className="flex items-center justify-between pb-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-chalk/40">Support mix</p>
                  <Link to="/admin/tickets" className="text-[11px] font-bold uppercase tracking-[0.12em] text-lime">
                    Queue
                  </Link>
                </div>
                <div className="flex h-[148px] items-end gap-3 pt-4">
                  <div className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t-lg bg-warn/80"
                      style={{ height: `${Math.max(8, (data.support.open / Math.max(1, data.support.open + data.support.resolved)) * 120)}px` }}
                    />
                    <span className="text-[11px] font-semibold text-chalk/50">Open</span>
                  </div>
                  <div className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t-lg bg-ok/80"
                      style={{
                        height: `${Math.max(8, (data.support.resolved / Math.max(1, data.support.open + data.support.resolved)) * 120)}px`,
                      }}
                    />
                    <span className="text-[11px] font-semibold text-chalk/50">Resolved</span>
                  </div>
                </div>
              </Card>
            </div>
          </Reveal>

          {data.in_progress?.length ? (
            <Reveal delay={100}>
              <div className="flex items-end justify-between pb-3">
                <h2 className="font-display text-lg font-bold text-chalk">In the lab now</h2>
                <Chip tone="warn">{data.in_progress.length} running</Chip>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {data.in_progress.map((j) => (
                  <Card key={j.id} tone="dark" interactive={false} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-chalk">
                          {j.player_name || (j.pipeline === 'action' ? 'Action' : 'Ball flight')}
                        </p>
                        <p className="text-xs text-chalk/40">
                          {j.user ? j.user.name : 'Unattributed'} · {j.stage || j.status}
                        </p>
                      </div>
                      <span className="font-display text-lg font-extrabold text-warn">{j.progress ?? 0}%</span>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/8">
                      <div className="h-full rounded-full bg-warn" style={{ width: `${Math.min(100, j.progress ?? 0)}%` }} />
                    </div>
                  </Card>
                ))}
              </div>
            </Reveal>
          ) : null}

          <Reveal delay={120}>
            <div className="flex items-end justify-between gap-3 pb-4">
              <div>
                <h2 className="font-display text-lg font-bold text-chalk">Latest throws</h2>
                <p className="pt-1 text-sm text-chalk/45">Open a report here — it stays inside admin.</p>
              </div>
              <Link to="/admin/analyses" className="text-[11px] font-bold uppercase tracking-[0.12em] text-lime hover:text-chalk">
                All analyses
              </Link>
            </div>
            {data.recent_throws?.length === 0 ? (
              <Card tone="dark" interactive={false} className="px-5 py-10 text-center text-sm text-chalk/40">
                No completed deliveries yet.
              </Card>
            ) : (
              <div className="grid gap-3">
                {(data.recent_throws ?? []).map((t) => {
                  const href = adminResultHref(t.pipeline, t.result_id)
                  const pct = t.ball_speed_kmh ? Math.max(12, (t.ball_speed_kmh / maxThrow) * 100) : 0
                  return (
                    <Card key={t.id} tone="dark" interactive={false} className="p-4 sm:p-5">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-display text-base font-bold text-chalk">{t.player_name ?? '—'}</p>
                            <Chip tone={t.pipeline === 'action' ? 'lime' : 'neutral'}>
                              {t.pipeline === 'action' ? 'Action' : 'Ball flight'}
                            </Chip>
                          </div>
                          <p className="pt-1 text-xs text-chalk/40">
                            {t.user ? `${t.user.name}` : 'Unattributed'}
                            {t.delivery_type ? ` · ${t.delivery_type}` : ''}
                            {t.bowling_arm ? ` · ${t.bowling_arm}-arm` : ''}
                          </p>
                          <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/8">
                            <div className="h-full rounded-full bg-lime/80" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-4">
                          <div className="text-right">
                            <p className="font-display text-2xl font-extrabold text-chalk">{fmtKmh(t.ball_speed_kmh)}</p>
                            <p className="text-[11px] uppercase tracking-[0.12em] text-chalk/35">ball km/h</p>
                            <p className="pt-1 text-xs text-chalk/50">{fmtKmh(t.arm_speed_kmh)} arm</p>
                          </div>
                          {href ? <OpenReportButton to={href} /> : null}
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </Reveal>
        </>
      ) : null}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { admin, type DashboardRange, type DashboardSummary } from '../../api/admin'
import { BarList, Donut, TrendLine } from '../../components/admin/charts'
import { Card, Reveal } from '../../components/site/ui'

const RANGES: { key: DashboardRange; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: '7d', label: 'Last 7 days' },
  { key: '30d', label: 'Last 30 days' },
  { key: '90d', label: 'Last 90 days' },
]

function StatCard({
  label,
  value,
  sub,
  tone = 'default',
}: {
  label: string
  value: number | string
  sub?: string
  tone?: 'default' | 'warn' | 'bad'
}) {
  return (
    <Card tone="dark" interactive={false} className="p-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-chalk/40">{label}</p>
      <p
        className={`font-display pt-1.5 text-3xl font-extrabold ${
          tone === 'bad' ? 'text-bad' : tone === 'warn' ? 'text-warn' : 'text-chalk'
        }`}
      >
        {value}
      </p>
      {sub ? <p className="pt-1 text-[11px] text-chalk/40">{sub}</p> : null}
    </Card>
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

  return (
    <div className="flex flex-col gap-7">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-chalk">Dashboard</h1>
            <p className="pt-1.5 text-sm text-chalk/55">Platform-wide activity at a glance.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {RANGES.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => setRange(r.key)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                  range === r.key
                    ? 'border-lime/50 bg-lime/15 text-lime'
                    : 'border-white/10 bg-white/[0.03] text-chalk/60 hover:text-chalk'
                }`}
              >
                {r.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setRange('custom')}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                range === 'custom'
                  ? 'border-lime/50 bg-lime/15 text-lime'
                  : 'border-white/10 bg-white/[0.03] text-chalk/60 hover:text-chalk'
              }`}
            >
              Custom
            </button>
            {range === 'custom' ? (
              <>
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
              </>
            ) : null}
          </div>
        </div>
      </Reveal>

      {error ? (
        <div className="rounded-xl border border-bad/30 bg-bad/10 px-4 py-2.5 text-sm text-bad">{error}</div>
      ) : null}

      {!data ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      ) : (
        <>
          <Reveal delay={40}>
            <h2 className="pb-3 text-xs font-bold uppercase tracking-[0.18em] text-chalk/45">Users</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Total users" value={data.users.total} />
              <StatCard label="New in range" value={data.users.new} />
              <StatCard label="Active (24h)" value={data.users.active} />
              <StatCard label="Inactive" value={data.users.inactive} tone="warn" />
            </div>
          </Reveal>

          <Reveal delay={80}>
            <h2 className="pb-3 text-xs font-bold uppercase tracking-[0.18em] text-chalk/45">Videos analysed</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Total analysed" value={data.videos.total} />
              <StatCard label="Today" value={data.videos.today} />
              <StatCard label="This week" value={data.videos.week} />
              <StatCard label="This month" value={data.videos.month} />
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="grid gap-4 lg:grid-cols-2">
              <Card tone="dark" interactive={false} className="p-5">
                <p className="pb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-chalk/40">
                  Signups over the range
                </p>
                <TrendLine points={data.signups_trend} />
              </Card>
              <Card tone="dark" interactive={false} className="p-5">
                <p className="pb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-chalk/40">
                  Analyses completed over the range
                </p>
                <TrendLine points={data.analyses_trend} />
              </Card>
            </div>
          </Reveal>

          <Reveal delay={160}>
            <div className="grid gap-4 lg:grid-cols-3">
              <Card tone="dark" interactive={false} className="p-5">
                <p className="pb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-chalk/40">
                  Coaching sessions
                </p>
                <Donut
                  segments={[
                    { label: 'Upcoming', value: data.coaching.upcoming },
                    { label: 'Completed', value: data.coaching.completed },
                    { label: 'Cancelled', value: data.coaching.cancelled },
                  ]}
                />
              </Card>
              <Card tone="dark" interactive={false} className="p-5">
                <p className="pb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-chalk/40">
                  Analyses by pipeline
                </p>
                <BarList
                  rows={[
                    { label: 'Action', value: data.videos.by_pipeline.action },
                    { label: 'Ball flight', value: data.videos.by_pipeline.ball_flight, tone: '#d9743c' },
                  ]}
                />
                {data.videos.failed_range > 0 ? (
                  <p className="pt-3 text-xs text-bad">{data.videos.failed_range} failed in this range</p>
                ) : null}
              </Card>
              <Card tone="dark" interactive={false} className="flex flex-col gap-4 p-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-chalk/40">
                  Support tickets
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-chalk/60">Open</span>
                  <span className="font-display text-2xl font-extrabold text-warn">{data.support.open}</span>
                </div>
                <div className="flex items-center justify-between border-t border-white/8 pt-3">
                  <span className="text-sm text-chalk/60">Resolved</span>
                  <span className="font-display text-2xl font-extrabold text-ok">{data.support.resolved}</span>
                </div>
              </Card>
            </div>
          </Reveal>
        </>
      )}
    </div>
  )
}

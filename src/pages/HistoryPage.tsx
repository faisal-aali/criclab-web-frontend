import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listDeliveries, metricReady, type Delivery } from '../api/client'

export function HistoryPage() {
  const [items, setItems] = useState<Delivery[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listDeliveries()
      .then((res) => setItems(res.items))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load history'))
  }, [])

  return (
    <section className="animate-rise">
      <h1 className="font-display text-4xl font-bold text-pitch">History</h1>
      <p className="mt-2 text-sm text-pitch/65">Previous deliveries. Re-upload a clip to re-run analysis — old rows stay as they were.</p>

      {error ? <p className="mt-4 text-ball">{error}</p> : null}

      <div className="mt-6 space-y-3">
        {items.length === 0 && !error ? (
          <p className="rounded-2xl border border-dashed border-pitch/20 bg-white/50 p-8 text-center text-pitch/60">
            No deliveries yet. <Link className="font-semibold text-pitch underline" to="/">Analyze an Action clip</Link>
          </p>
        ) : null}
        {items.map((d) => {
          const ball = d.metrics?.ball_speed_kmh
          const arm = d.metrics?.arm_speed_kmh
          const ballOk = metricReady(ball)
          const style = d.metrics?.player_profile?.bowling_style
          const armSide = d.metrics?.player_profile?.bowling_arm || d.metrics?.throwing_side
          return (
            <Link
              key={d.id}
              to={`/results/${d.id}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-pitch/10 bg-white/75 px-4 py-4 shadow-sm transition hover:border-pitch/25"
            >
              <div>
                <div className="font-semibold text-pitch">{d.player_name || 'Bowler'}</div>
                <div className="mt-1 flex flex-wrap gap-2 text-xs text-pitch/50">
                  <span>{d.created_at ? new Date(d.created_at).toLocaleString() : d.id}</span>
                  {armSide ? <span className="capitalize">{armSide}-arm</span> : null}
                  {style ? <span className="capitalize">{style}</span> : null}
                </div>
                {d.analysis_summary ? (
                  <p className="mt-2 line-clamp-2 max-w-2xl text-sm text-pitch/70">{d.analysis_summary}</p>
                ) : null}
              </div>
              <div className="text-right">
                <div className="font-display text-2xl font-bold text-pitch">
                  {ballOk ? `${Number(ball!.value).toFixed(1)}` : '—'}
                </div>
                <div className="text-xs uppercase tracking-wider text-pitch/45">
                  {ballOk ? 'ball km/h' : 'ball speed n/a'}
                </div>
                {!ballOk && metricReady(arm) ? (
                  <div className="mt-1 text-[11px] text-pitch/50">Arm {Number(arm!.value).toFixed(0)} km/h</div>
                ) : null}
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

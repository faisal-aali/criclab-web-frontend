import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { assetUrl, getBalltrackSession, metricReady, type BalltrackSession } from '../api/client'
import { DrillShelf } from '../components/DrillShelf'
import { MetricCard } from '../components/MetricCard'

export function BallFlightResultsPage() {
  const { sessionId } = useParams()
  const [data, setData] = useState<BalltrackSession | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) return
    getBalltrackSession(sessionId)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load session'))
  }, [sessionId])

  if (error) return <p className="text-ball">{error}</p>
  if (!data) {
    return (
      <div className="flex items-center gap-3 text-pitch/60">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-pitch/30 border-t-pitch" />
        Loading ball-flight session…
      </div>
    )
  }

  const overlay = assetUrl(data.artifacts?.cloudinary_overlay_url || data.artifacts?.overlay_url)
  const pitchMap = assetUrl(data.artifacts?.cloudinary_pitch_map_url || data.artifacts?.pitch_map_url)
  const deliveries = data.deliveries || []
  const first = deliveries[0]?.metrics

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-seam">Ball flight</p>
          <h1 className="font-display mt-1 text-4xl font-extrabold text-pitch">{data.title || 'Session'}</h1>
          <p className="mt-1 text-sm text-pitch/60">
            Pitch-plane from stump homography. Cards only show a number when validation passed (about 45–155 km/h,
            bounce on the square).
          </p>
        </div>
        <Link
          to="/ball-flight"
          className="rounded-xl border border-pitch/20 bg-white px-4 py-2 text-sm font-semibold text-pitch transition hover:bg-pitch hover:text-white"
        >
          New session
        </Link>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        This is not Action arm speed and not a radar gun. Wrong camera still yields —.
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.55fr_0.85fr]">
        <div className="space-y-4">
          {overlay ? (
            <div className="overflow-hidden rounded-3xl border border-pitch/10 bg-black shadow-2xl">
              <div className="border-b border-white/10 bg-pitch-deep px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white/70">
                Overlay · speed / line / length HUD
              </div>
              <video className="aspect-video w-full object-contain" src={overlay} controls playsInline />
            </div>
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-3xl bg-black text-white/60">
              No overlay
            </div>
          )}
          {pitchMap ? (
            <div className="overflow-hidden rounded-2xl border border-pitch/10 bg-white p-3 shadow-sm">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-pitch/55">Pitch map</p>
              <img src={pitchMap} alt="Pitch map of bounce points" className="w-full rounded-xl" />
            </div>
          ) : null}
        </div>

        <aside className="space-y-3">
          <h2 className="font-display text-base font-bold text-pitch">Headline delivery</h2>
          <div className="grid gap-3">
            <MetricCard label="Ball speed" metric={first?.speed_kmh} />
            <MetricCard label="Line" metric={first?.line_m} />
            <MetricCard label="Length" metric={first?.length_m} />
          </div>
          {!metricReady(first?.speed_kmh) ? (
            <p className="text-xs text-pitch/55">
              Speed stays hidden unless the track looks like a cricket ball toward the batter.
            </p>
          ) : null}
        </aside>
      </div>

      {deliveries.length > 1 ? (
        <div>
          <h2 className="font-display mb-3 text-lg font-bold text-pitch">All tracked deliveries</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {deliveries.map((d) => (
              <div key={d.id} className="rounded-2xl border border-pitch/10 bg-white p-4 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-pitch/45">Ball {d.index}</p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <MetricCard label="Speed" metric={d.metrics?.speed_kmh} />
                  <MetricCard label="Line" metric={d.metrics?.line_m} />
                  <MetricCard label="Length" metric={d.metrics?.length_m} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {data.analysis?.summary ? (
        <article className="rounded-2xl border border-pitch/10 bg-white p-5 shadow-sm">
          <h2 className="font-display text-base font-bold text-pitch">AI coach</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm text-pitch/80">{data.analysis.summary}</p>
          {data.analysis.improvements ? (
            <p className="mt-3 whitespace-pre-wrap text-sm text-pitch/75">{data.analysis.improvements}</p>
          ) : null}
        </article>
      ) : null}

      <DrillShelf drills={data.analysis?.recommendations} heading="Drills for this session" />
    </div>
  )
}

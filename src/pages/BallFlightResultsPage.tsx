import { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { assetUrl, getBalltrackSession, metricReady, type BalltrackSession } from '../api/client'
import { AdminReportChrome, AdminStaffBanner } from '../components/admin/AdminStaffBanner'
import { DrillShelf } from '../components/DrillShelf'
import { MetricCard } from '../components/MetricCard'
import { Button, Card, Chip, Reveal } from '../components/site/ui'
import { TrajectoryArc } from '../components/site/visuals'

export function BallFlightResultsPage() {
  const { sessionId } = useParams()
  const inAdmin = useLocation().pathname.startsWith('/admin')
  const [data, setData] = useState<BalltrackSession | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [mediaTick, setMediaTick] = useState(0)

  useEffect(() => {
    if (!sessionId) return
    getBalltrackSession(sessionId)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load session'))
  }, [sessionId, mediaTick])

  if (error) {
    return (
      <div className="mx-auto w-full max-w-xl">
        <div
          role="alert"
          className="rounded-[var(--radius-card)] border border-bad/30 bg-bad/10 p-6 text-center"
        >
          <Chip tone="bad">Session unavailable</Chip>
          <p className="mt-3 text-sm leading-relaxed break-words text-bad">{error}</p>
          <div className="mt-5 flex justify-center">
            <Button to={inAdmin ? '/admin/analyses' : '/app/ball-flight'} variant="secondary" size="sm">
              {inAdmin ? 'Back to analyses' : 'Start a new session'}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3 text-sm text-chalk/60">
          <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-lime/30 border-t-lime" />
          Opening your ball-flight session…
        </div>
        <div className="grid gap-5 lg:grid-cols-[1.55fr_0.85fr]">
          <div className="aspect-video animate-pulse rounded-[var(--radius-card)] border border-white/10 bg-white/[0.04]" />
          <div className="flex flex-col gap-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-[var(--radius-card)] border border-white/10 bg-white/[0.04]"
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const overlay = assetUrl(data.artifacts?.cloudinary_overlay_url || data.artifacts?.overlay_url)
  const pitchMap = assetUrl(data.artifacts?.cloudinary_pitch_map_url || data.artifacts?.pitch_map_url)
  const deliveries = data.deliveries || []
  const first = deliveries[0]?.metrics

  return (
    <div className="space-y-6">
      <AdminStaffBanner />
      <AdminReportChrome />
      {/* ---------------- Header ---------------- */}
      <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <Chip tone="lime">Ball flight</Chip>
          <h1 className="font-display mt-3 text-3xl font-extrabold leading-tight break-words text-chalk sm:text-4xl">
            {data.title || 'Session'}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-chalk/60">
            Measured off the pitch between both sets of stumps. A card only shows a number when the
            delivery passed our checks (roughly 45–155 km/h, bouncing on the square).
          </p>
        </div>
        <Button
          to={inAdmin ? '/admin/analyses' : '/app/ball-flight'}
          variant="secondary"
          size="sm"
          className="self-start sm:self-auto"
        >
          {inAdmin ? 'Back to analyses' : 'New session'}
        </Button>
      </Reveal>

      <div className="flex items-start gap-3 rounded-2xl border border-warn/25 bg-warn/10 px-4 py-3.5 text-sm leading-relaxed text-warn">
        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-warn/20 text-[11px] font-bold">
          i
        </span>
        <span className="min-w-0">
          This is not the arm speed from an Action report, and it is not a radar gun. Filmed from
          the wrong position, it still shows — rather than a number.
        </span>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.55fr_0.85fr]">
        {/* ---------------- Footage ---------------- */}
        <div className="flex min-w-0 flex-col gap-4">
          {overlay ? (
            <Card interactive={false} className="overflow-hidden p-0">
              <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-lime" />
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-chalk/50">
                  Tracked delivery · speed, line and length on screen
                </span>
              </div>
              <video
                className="aspect-video w-full bg-night object-contain"
                src={overlay}
                controls
                playsInline
                onError={() => {
                  if (mediaTick > 1) return
                  setMediaTick((n) => n + 1)
                }}
              />
            </Card>
          ) : (
            <Card interactive={false} className="p-6">
              <div className="on-night flex aspect-video flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/12 bg-night/40 p-6 text-center">
                <div className="h-24 w-full max-w-xs opacity-60">
                  <TrajectoryArc />
                </div>
                <p className="text-sm font-semibold text-chalk">No marked-up clip for this session</p>
                <p className="max-w-sm text-xs leading-relaxed text-chalk/50">
                  The numbers below are still whatever we could measure from your footage.
                </p>
              </div>
            </Card>
          )}

          {pitchMap ? (
            <Card interactive={false} className="p-4">
              <p className="pb-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-chalk/50">
                Pitch map · where each ball landed
              </p>
              <img
                src={pitchMap}
                alt="Pitch map of bounce points"
                className="w-full rounded-xl border border-white/10 bg-night"
              />
            </Card>
          ) : null}
        </div>

        {/* ---------------- Headline delivery ---------------- */}
        <aside className="flex min-w-0 flex-col gap-3">
          <h2 className="font-display text-base font-bold text-chalk">Headline delivery</h2>
          {data.error ? (
            <div role="alert" className="rounded-xl border border-bad/30 bg-bad/10 px-3.5 py-3 text-xs leading-relaxed text-bad">
              This session did not finish: {data.error}
            </div>
          ) : null}
          {deliveries.length === 0 ? (
            <Card interactive={false} className="p-5 text-center">
              <p className="font-display text-base font-bold text-chalk">No ball found in this session</p>
              <p className="mt-2 text-xs leading-relaxed text-chalk/55">
                Nothing in the clip read as a ball travelling from the bowler toward the batter, so
                there is no speed, line or length to show. Film from behind the bowler with both
                stump sets in frame and try again.
              </p>
            </Card>
          ) : null}
          <div className="grid gap-3">
            <MetricCard label="Ball speed" metric={first?.speed_kmh} />
            <MetricCard label="Line" metric={first?.line_m} />
            <MetricCard label="Length" metric={first?.length_m} />
          </div>
          {deliveries.length > 0 && !metricReady(first?.speed_kmh) ? (
            <p className="rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-3 text-xs leading-relaxed text-chalk/55">
              Speed stays hidden unless the ball’s path clearly reads as a delivery travelling
              toward the batter.
            </p>
          ) : null}
        </aside>
      </div>

      {/* ---------------- All deliveries ---------------- */}
      {deliveries.length > 1 ? (
        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-lg font-bold text-chalk">All tracked deliveries</h2>
            <Chip>{deliveries.length} balls</Chip>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {deliveries.map((d, i) => (
              <Reveal key={d.id} delay={i * 50}>
                <Card interactive={false} className="h-full p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-chalk/40">
                    Ball {d.index}
                  </p>
                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <MetricCard label="Speed" metric={d.metrics?.speed_kmh} />
                    <MetricCard label="Line" metric={d.metrics?.line_m} />
                    <MetricCard label="Length" metric={d.metrics?.length_m} />
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      {/* ---------------- Written read ---------------- */}
      {data.analysis?.summary ? (
        <Reveal>
          <Card interactive={false} className="p-5 sm:p-6">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-lime/15 text-sm font-bold text-lime">
                ”
              </span>
              <h2 className="font-display text-base font-bold text-chalk">Coach’s read</h2>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-chalk/75">
              {data.analysis.summary}
            </p>
            {data.analysis.improvements ? (
              <p className="mt-3 whitespace-pre-wrap border-t border-white/10 pt-3 text-sm leading-relaxed text-chalk/65">
                {data.analysis.improvements}
              </p>
            ) : null}
          </Card>
        </Reveal>
      ) : null}

      <DrillShelf drills={data.analysis?.recommendations} heading="Drills for this session" />
    </div>
  )
}

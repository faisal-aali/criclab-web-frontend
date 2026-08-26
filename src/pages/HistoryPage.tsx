import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listDeliveries, metricReady, type Delivery } from '../api/client'
import { Button, Card, Chip, Reveal } from '../components/site/ui'
import { BowlerSkeleton, SeamBall } from '../components/site/visuals'

export function HistoryPage() {
  const [items, setItems] = useState<Delivery[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listDeliveries()
      .then((res) => setItems(res.items))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load history'))
  }, [])

  return (
    <div className="space-y-6">
      {/* ---------------- Header ---------------- */}
      <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <Chip tone="lime">History</Chip>
          <h1 className="font-display mt-3 text-3xl font-extrabold leading-tight text-chalk sm:text-4xl">
            Every delivery you’ve <span className="text-gradient-lime">measured</span>
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-chalk/60">
            Upload a clip again to get a fresh read — past entries stay exactly as they were, so a
            change in action is a comparison rather than a memory.
          </p>
        </div>
        {items.length ? (
          <div className="shrink-0 self-start sm:self-auto">
            <Chip>{items.length} deliveries</Chip>
          </div>
        ) : null}
      </Reveal>

      {error ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-bad/30 bg-bad/10 px-4 py-3.5 text-sm text-bad"
        >
          <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-bad/20 text-[11px] font-bold">
            !
          </span>
          <span className="min-w-0 break-words">{error}</span>
        </div>
      ) : null}

      {/* ---------------- Empty state ---------------- */}
      {items.length === 0 && !error ? (
        <Reveal>
          <Card interactive={false} className="relative overflow-hidden p-8 text-center sm:p-12">
            <div className="pointer-events-none absolute inset-0 bg-grid-tech opacity-[0.35]" aria-hidden />
            <div className="relative mx-auto flex max-w-md flex-col items-center gap-5">
              <div className="relative h-36 w-32">
                <BowlerSkeleton />
                <div className="absolute -right-6 bottom-2 animate-float-slow">
                  <SeamBall size={40} />
                </div>
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-chalk">No deliveries yet</h2>
                <p className="mt-2 text-sm leading-relaxed text-chalk/60">
                  Film one ball on a phone, side-on, with the whole body in frame. As soon as the
                  first clip is analysed it lands here, and every session after it stacks up
                  alongside.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <Button to="/app" size="md">
                  Analyse a clip
                  <span aria-hidden>→</span>
                </Button>
                <Button to="/record" variant="secondary" size="md">
                  Filming guide
                </Button>
              </div>
            </div>
          </Card>
        </Reveal>
      ) : null}

      {/* ---------------- Deliveries ---------------- */}
      {items.length ? (
        <div className="flex flex-col gap-3">
          {items.map((d, i) => {
            const ball = d.metrics?.ball_speed_kmh
            const arm = d.metrics?.arm_speed_kmh
            const ballOk = metricReady(ball)
            const style = d.metrics?.player_profile?.bowling_style
            const armSide = d.metrics?.player_profile?.bowling_arm || d.metrics?.throwing_side
            const pace = d.metrics?.delivery_type
            const paceOk = pace?.status === 'ok' && pace.value
            const slowMo = Boolean(d.metrics?.timebase?.slow_motion || d.metrics?.quality?.slow_motion)
            return (
              <Reveal key={d.id} delay={Math.min(i * 45, 260)}>
                <Link to={`/app/results/${d.id}`} className="group block">
                  <Card className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-display text-base font-bold text-chalk transition group-hover:text-lime">
                          {d.player_name || 'Bowler'}
                        </span>
                        {paceOk ? <Chip tone="lime">{pace.value}</Chip> : null}
                        {slowMo ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-seam/35 bg-seam/10 px-2.5 py-1 text-[11px] font-semibold text-seam">
                            Slow-mo recovered
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-chalk/45">
                        <span>{d.created_at ? new Date(d.created_at).toLocaleString() : d.id}</span>
                        {armSide ? <span className="capitalize">{armSide}-arm</span> : null}
                        {style ? <span className="capitalize">{style}</span> : null}
                      </div>
                      {d.analysis_summary ? (
                        <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-relaxed text-chalk/65">
                          {d.analysis_summary}
                        </p>
                      ) : null}
                    </div>

                    <div className="shrink-0 text-right">
                      {ballOk ? (
                        <>
                          <div className="font-display text-3xl font-extrabold leading-none text-gradient-lime">
                            {Number(ball!.value).toFixed(1)}
                          </div>
                          <div className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-seam">
                            ball km/h
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="font-display text-3xl font-extrabold leading-none text-chalk/25">
                            —
                          </div>
                          <div className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-chalk/40">
                            ball speed n/a
                          </div>
                        </>
                      )}
                      {!ballOk && metricReady(arm) ? (
                        <div className="mt-1.5 text-[11px] text-chalk/50">
                          Arm {Number(arm!.value).toFixed(0)} km/h
                        </div>
                      ) : null}
                    </div>
                  </Card>
                </Link>
              </Reveal>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

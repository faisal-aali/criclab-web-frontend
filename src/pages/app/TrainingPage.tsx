import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  training,
  type FocusArea,
  type TrainingPlan,
  type TrainingProfile,
  type TrendMetric,
} from '../../api/training'
import { DrillShelf } from '../../components/DrillShelf'
import { Backdrop, Button, Card, Chip, Reveal, Tooltip } from '../../components/site/ui'

const MIN_SAMPLE = 3
const POLL_MS = 2500
const STATUS_ROTATE_MS = 4000

const GENERATING_MESSAGES = [
  'Reading your trends…',
  'Weighing your focus areas…',
  'Writing your coaching notes…',
  'Matching drills from the catalog…',
]

function formatTag(tag: string) {
  return tag.replace(/_/g, ' ')
}

function RefreshPlanButton({
  onClick,
  isGenerating,
  refreshing,
  pageLoading,
  planStatus,
  needsRefresh,
}: {
  onClick: () => void
  isGenerating: boolean
  refreshing: boolean
  pageLoading: boolean
  planStatus: TrainingPlan['status'] | undefined
  needsRefresh: boolean
}) {
  const isDisabled =
    isGenerating || refreshing || pageLoading || (planStatus === 'ok' && !needsRefresh)

  let reason: string | undefined
  if (isDisabled) {
    if (isGenerating) {
      reason = 'AI is currently generating your plan'
    } else if (refreshing) {
      reason = 'Requesting the latest plan...'
    } else if (pageLoading) {
      reason = 'Your training profile is still loading'
    } else {
      reason = 'Your plan is already up to date — no new data to include'
    }
  }

  const label = isGenerating
    ? 'AI is working…'
    : refreshing
      ? 'Requesting…'
      : needsRefresh
        ? 'Update plan'
        : planStatus === 'llm_unavailable'
          ? 'Retry plan'
          : 'Refresh plan'

  return (
    <Tooltip content={reason} show={isDisabled && !!reason}>
      <Button variant="primary" onClick={onClick} disabled={isDisabled}>
        {label}
      </Button>
    </Tooltip>
  )
}

/** Short date label; adds the year only when the series spans more than one. */
function formatPointDate(iso: string, multiYear: boolean) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: multiYear ? 'numeric' : undefined,
  })
}

function TrendChart({ metric, label, unit = '' }: { metric: TrendMetric; label: string; unit?: string }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const svgWrapRef = useRef<HTMLDivElement | null>(null)

  const values = metric?.series?.map((p) => p.value) || []
  if (!values.length) {
    return (
      <div className="grid h-24 place-items-center rounded-xl border border-white/8 bg-white/[0.03] text-xs text-chalk/35">
        No data yet
      </div>
    )
  }

  const width = 280
  const height = 96
  const padX = 12
  const padY = 10
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = Math.max(0.001, max - min)
  const xs = metric.series.map((_, i) => padX + (i * (width - padX * 2)) / Math.max(1, metric.series.length - 1))
  const ys = metric.series.map((p) => padY + (1 - (p.value - min) / range) * (height - padY * 2))

  const line = ys.map((y, i) => `${i === 0 ? 'M' : 'L'}${xs[i].toFixed(1)},${y.toFixed(1)}`).join(' ')

  const multiYear = (() => {
    const years = new Set(
      metric.series
        .map((p) => new Date(p.date).getFullYear())
        .filter((y) => Number.isFinite(y)),
    )
    return years.size > 1
  })()

  const updateHoverFromClientX = (clientX: number) => {
    const el = svgWrapRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    if (rect.width <= 0) return
    const relX = ((clientX - rect.left) / rect.width) * width
    let nearest = 0
    let nearestDist = Infinity
    for (let i = 0; i < xs.length; i++) {
      const dist = Math.abs(xs[i] - relX)
      if (dist < nearestDist) {
        nearestDist = dist
        nearest = i
      }
    }
    setHoverIndex(nearest)
  }

  const hovered = hoverIndex != null ? metric.series[hoverIndex] : null

  // Position the tooltip in pixel space over the chart, clamped to stay inside it.
  const tooltipLeftPct =
    hoverIndex != null ? Math.min(92, Math.max(8, (xs[hoverIndex] / width) * 100)) : 50

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-chalk">{label}</span>
        <span className="text-xs text-chalk/50">
          {metric.latest != null ? `${metric.latest.toFixed(1)}${unit}` : '—'} latest
          {metric.trend ? (
            <span className="ml-2">
              {metric.trend.direction === 'up' ? '↑' : metric.trend.direction === 'down' ? '↓' : '→'}{' '}
              {metric.trend.percent_change != null ? `${metric.trend.percent_change.toFixed(1)}%` : `${metric.trend.change.toFixed(1)}`}
            </span>
          ) : null}
        </span>
      </div>
      <div ref={svgWrapRef} className="relative">
        {hovered ? (
          <div
            className="pointer-events-none absolute -top-9 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg border border-lime/30 bg-night/95 px-2.5 py-1.5 text-[11px] font-semibold text-chalk shadow-lg"
            style={{ left: `${tooltipLeftPct}%` }}
          >
            {formatPointDate(hovered.date, multiYear)} · {hovered.value.toFixed(1)}{unit}
          </div>
        ) : null}
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-20 w-full cursor-crosshair touch-none rounded-xl border border-white/8 bg-white/[0.03]"
          onPointerMove={(e) => updateHoverFromClientX(e.clientX)}
          onPointerDown={(e) => updateHoverFromClientX(e.clientX)}
          onPointerLeave={() => setHoverIndex(null)}
        >
          <path d={line} fill="none" stroke="#b6f24a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {hoverIndex != null ? (
            <line
              x1={xs[hoverIndex]}
              x2={xs[hoverIndex]}
              y1={padY}
              y2={height - padY}
              stroke="#b6f24a"
              strokeOpacity="0.35"
              strokeWidth="1"
            />
          ) : null}
          {ys.map((y, i) => (
            <circle
              key={i}
              cx={xs[i]}
              cy={y}
              r={i === hoverIndex ? 5 : 3}
              fill="#b6f24a"
              stroke={i === hoverIndex ? '#0b1a12' : 'none'}
              strokeWidth={i === hoverIndex ? 1.5 : 0}
            />
          ))}
        </svg>
      </div>
      <div className="flex items-center justify-between text-xs text-chalk/45">
        <span>{metric.mean != null ? `avg ${metric.mean.toFixed(1)}${unit}` : ''}</span>
        <span>{metric.best != null ? `best ${metric.best.toFixed(1)}${unit}` : ''}</span>
      </div>
    </div>
  )
}

function PlanGeneratingOverlay({
  elapsed,
  message,
  hasPrevious,
  onViewPrevious,
}: {
  elapsed: number
  message: string
  hasPrevious: boolean
  onViewPrevious: () => void
}) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 rounded-[inherit] bg-black/80 p-5 text-center backdrop-blur-sm">
      <div className="relative">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-lime/20 border-t-lime" />
      </div>
      <div className="max-w-xs space-y-1">
        <p className="font-display text-base font-bold text-chalk">AI is working on your plan</p>
        <p className="animate-rise text-sm text-chalk/70" key={message}>
          {message}
        </p>
        <p className="text-xs font-medium text-chalk/45">Working on it — {elapsed}s</p>
      </div>
      {hasPrevious ? (
        <Button variant="secondary" size="sm" onClick={onViewPrevious}>
          View previous plan while this updates
        </Button>
      ) : null}
    </div>
  )
}

function GeneratedAtLabel({ generatedAt, cached }: { generatedAt?: string; cached?: boolean }) {
  if (!generatedAt) return null
  return (
    <span className="text-xs text-chalk/45">
      {cached ? 'cached' : 'new'} {new Date(generatedAt).toLocaleString()}
    </span>
  )
}

export function TrainingPage() {
  const [profile, setProfile] = useState<TrainingProfile | null>(null)
  const [plan, setPlan] = useState<TrainingPlan | null>(null)
  const [generationStatus, setGenerationStatus] = useState<'generating' | 'ready' | 'failed' | null>(null)
  const [generatedAt, setGeneratedAt] = useState<string | undefined>()
  const [cached, setCached] = useState(false)
  const [needsRefresh, setNeedsRefresh] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showOverlay, setShowOverlay] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [statusIndex, setStatusIndex] = useState(0)

  const generationStartRef = useRef<number | null>(null)

  const loadProfile = useCallback(async () => {
    try {
      const data = await training.profile()
      setProfile(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load training profile')
    } finally {
      setPageLoading(false)
    }
  }, [])

  const loadPlan = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true)
    try {
      const data = await training.plan({ refresh })
      setPlan(data.plan)
      setGenerationStatus(data.generation_status)
      setGeneratedAt(data.generated_at)
      setCached(data.cached)
      setNeedsRefresh(data.needs_refresh)
      setError(null)

      if (data.generation_status === 'generating') {
        if (generationStartRef.current == null) {
          generationStartRef.current = Date.now()
          setElapsed(0)
        }
        // Show the overlay automatically when there is nothing to fall back to,
        // or when the user explicitly asked for a refresh.
        if (!data.plan || refresh) {
          setShowOverlay(true)
        }
      } else {
        generationStartRef.current = null
        setElapsed(0)
        if (data.generation_status === 'ready') {
          setShowOverlay(false)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load training plan')
      setGenerationStatus('failed')
    } finally {
      if (refresh) setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadProfile()
    loadPlan()
  }, [loadProfile, loadPlan])

  // Poll the plan endpoint while the backend is generating.
  useEffect(() => {
    if (generationStatus !== 'generating') return
    const timer = setInterval(() => loadPlan(false), POLL_MS)
    return () => clearInterval(timer)
  }, [generationStatus, loadPlan])

  // Tick the elapsed-time counter while generating.
  useEffect(() => {
    if (generationStatus !== 'generating') {
      setElapsed(0)
      return
    }
    if (generationStartRef.current == null) {
      generationStartRef.current = Date.now()
    }
    const tick = () => {
      const start = generationStartRef.current ?? Date.now()
      setElapsed(Math.floor((Date.now() - start) / 1000))
    }
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [generationStatus])

  // Rotate the status copy while generating.
  useEffect(() => {
    if (generationStatus !== 'generating') return
    const timer = setInterval(() => setStatusIndex((i) => (i + 1) % GENERATING_MESSAGES.length), STATUS_ROTATE_MS)
    return () => clearInterval(timer)
  }, [generationStatus])

  const handleRefresh = useCallback(() => {
    setShowOverlay(true)
    loadPlan(true)
  }, [loadPlan])

  const handleDismissOverlay = useCallback(() => setShowOverlay(false), [])

  const enoughData = useMemo(() => (profile?.sample_size ?? 0) >= MIN_SAMPLE, [profile])

  const metricCards = useMemo(() => {
    if (!profile) return []
    const defs: { key: keyof TrainingProfile['metrics']; label: string; unit: string }[] = [
      { key: 'ball_speed_kmh', label: 'Ball speed', unit: ' km/h' },
      { key: 'arm_speed_kmh', label: 'Arm speed', unit: ' km/h' },
      { key: 'release_height_m', label: 'Release height', unit: ' m' },
      { key: 'release_time_ms', label: 'Release time', unit: ' ms' },
    ]
    return defs
      .map((d) => ({ ...d, metric: profile.metrics?.[d.key] }))
      .filter((d) => d.metric && d.metric.series.length > 0)
  }, [profile])

  const focusAreas: FocusArea[] = useMemo(() => profile?.focus_areas || [], [profile])

  const isGenerating = generationStatus === 'generating'
  const hasPreviousPlan = Boolean(
    plan &&
      (plan.summary ||
        plan.strengths ||
        plan.improvements ||
        plan.suggestions ||
        plan.recommendations?.length),
  )

  return (
    <div className="space-y-4">
      <Reveal className="on-night relative overflow-hidden rounded-[var(--radius-card)] border border-white/10 px-5 py-5 sm:px-7 sm:py-6">
        <Backdrop plate="stadium" scrim="dark" parallax={0.07} />
        <div className="pointer-events-none absolute -right-16 -top-14 h-52 w-52 animate-glow-breathe rounded-full bg-lime/10 blur-[90px]" aria-hidden />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <Chip tone="lime">Training</Chip>
            <h1 className="font-display mt-2 text-2xl font-extrabold leading-tight text-chalk sm:text-3xl">
              Your bowling <span className="text-gradient-lime">trends</span>
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-chalk/60">
              Patterns from your Action analyses, surfaced as stats, then turned into a coach's notes and drills.
            </p>
          </div>
          <div className="shrink-0 self-start sm:self-auto">
            <RefreshPlanButton
              onClick={handleRefresh}
              isGenerating={isGenerating}
              refreshing={refreshing}
              pageLoading={pageLoading}
              planStatus={plan?.status}
              needsRefresh={needsRefresh}
            />
          </div>
        </div>
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

      {pageLoading ? (
        <Card interactive={false} className="p-6 text-center">
          <p className="text-sm text-chalk/55">Loading your training profile…</p>
        </Card>
      ) : !enoughData ? (
        <Reveal>
          <Card interactive={false} className="ring-glow relative overflow-hidden p-6 text-center sm:p-8">
            <div className="pointer-events-none absolute inset-0 bg-grid-tech opacity-[0.35]" aria-hidden />
            <div className="relative mx-auto flex max-w-md flex-col items-center gap-4">
              <div className="font-display text-4xl">🎳</div>
              <div>
                <h2 className="font-display text-lg font-bold text-chalk">Need more deliveries</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-chalk/60">
                  Analyze at least {MIN_SAMPLE} Action clips to unlock your trend charts and personalized training plan.
                  Every new delivery sharpens the picture.
                </p>
              </div>
            </div>
          </Card>
        </Reveal>
      ) : (
        <>
          <Reveal>
            <Card interactive={false} className="space-y-3 p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base font-bold text-chalk">Performance trends</h2>
                <span className="text-xs text-chalk/45">{profile?.sample_size} deliveries</span>
              </div>
              {metricCards.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {metricCards.map(({ key, label, unit, metric }) => (
                    <TrendChart key={key} metric={metric!} label={label} unit={unit} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-chalk/55">No measurable trend data yet.</p>
              )}
            </Card>
          </Reveal>

          <Reveal>
            <Card interactive={false} className="relative space-y-3 p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <h2 className="font-display text-base font-bold text-chalk">AI coaching plan</h2>
                  {focusAreas.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-chalk/40">Focus:</span>
                      {focusAreas.map((f) => (
                        <Chip key={f.tag} tone="warn">
                          <span className="capitalize">{formatTag(f.tag)}</span>
                          <span className="ml-1 opacity-70">({f.count})</span>
                        </Chip>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-chalk/50">No recurring weaknesses flagged yet.</p>
                  )}
                </div>
                {isGenerating ? (
                  <button
                    type="button"
                    onClick={() => setShowOverlay(true)}
                    className="appearance-none border-0 bg-transparent p-0"
                    aria-label="Show plan progress"
                  >
                    <Chip tone="lime" className="cursor-pointer">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
                      Updating your plan…
                    </Chip>
                  </button>
                ) : generatedAt ? (
                  <GeneratedAtLabel generatedAt={generatedAt} cached={cached} />
                ) : null}
              </div>

              {generationStatus === 'failed' ? (
                <div className="rounded-lg border border-bad/20 bg-bad/10 px-3 py-2.5 text-sm text-bad">
                  Could not update your coaching plan right now.{plan ? ' Your previous plan is still shown below.' : ''}
                </div>
              ) : null}

              {needsRefresh && !isGenerating ? (
                <div className="flex flex-col gap-2 rounded-lg border border-lime/20 bg-lime/10 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-chalk/85">
                    Your latest Action stats are not reflected in this plan yet. Refresh it to update your coaching notes.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={refreshing}
                  >
                    {refreshing ? 'Refreshing…' : 'Refresh plan'}
                  </Button>
                </div>
              ) : null}

              {!plan && generationStatus !== 'failed' && !needsRefresh ? (
                <p className="text-sm text-chalk/55">
                  Your personalized coaching plan will appear here once the AI has finished.
                </p>
              ) : null}

              {plan?.status === 'llm_unavailable' ? (
                <div className="rounded-lg border border-warn/20 bg-warn/10 px-3 py-2.5 text-sm text-warn">
                  {plan.summary || 'AI coaching suggestions are unavailable right now.'} The trends above are still up to date.
                </div>
              ) : plan ? (
                <div className="space-y-3 rounded-lg border border-white/8 bg-white/[0.02] p-3">
                  {plan.summary ? (
                    <p className="text-sm leading-relaxed text-chalk/85">{plan.summary}</p>
                  ) : null}
                  <div className="grid gap-3 sm:grid-cols-2">
                    {plan.strengths ? (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-ok/70">
                          Strengths
                        </p>
                        <p className="mt-1 text-sm leading-relaxed text-chalk/75">{plan.strengths}</p>
                      </div>
                    ) : null}
                    {plan.improvements ? (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-warn/70">
                          Improvements
                        </p>
                        <p className="mt-1 text-sm leading-relaxed text-chalk/75">{plan.improvements}</p>
                      </div>
                    ) : null}
                  </div>
                  {plan.focus_areas ? (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-chalk/40">
                        Focus areas
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-chalk/75">{plan.focus_areas}</p>
                    </div>
                  ) : null}
                  {plan.suggestions ? (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-chalk/40">
                        Suggestions
                      </p>
                      <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-chalk/75">
                        {plan.suggestions}
                      </p>
                    </div>
                  ) : null}
                </div>
              ) : null}

              <DrillShelf
                drills={plan?.recommendations || []}
                heading="Drills for you"
                empty="No specific drills recommended yet — keep analyzing deliveries to unlock personalized suggestions."
              />

              {isGenerating && showOverlay ? (
                <PlanGeneratingOverlay
          elapsed={elapsed}
          message={GENERATING_MESSAGES[statusIndex]}
          hasPrevious={hasPreviousPlan}
          onViewPrevious={handleDismissOverlay}
        />
              ) : null}
            </Card>
          </Reveal>
        </>
      )}
    </div>
  )
}

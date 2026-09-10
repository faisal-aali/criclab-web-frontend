import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { cancelBalltrackJob, getBalltrackJob, type Job } from '../api/client'
import { Button, Card, Chip, Reveal } from '../components/site/ui'
import { SeamBall } from '../components/site/visuals'
import { formatEta, formatExpectedAt, isWaitingToStart } from '../lib/eta'
import { formatStageDetail, stageFraction } from '../components/app/ClipUploadOverlay'
import { useProcessingJobs } from '../components/app/ProcessingJobs'

/** Plain-language names for what the viewer is waiting on. */
const STAGES = [
  { key: 'queued', label: 'In the queue' },
  { key: 'ingest', label: 'Fetching your clip' },
  { key: 'calibrate', label: 'Measuring the pitch' },
  { key: 'detect', label: 'Finding the ball' },
  { key: 'track', label: 'Following each delivery' },
  { key: 'metrics', label: 'Measuring speed, line and length' },
  { key: 'render', label: 'Drawing the path onto your clip' },
  { key: 'agent', label: 'Matching drills to what we saw' },
]

export function BallFlightProcessingPage() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const { untrackJob } = useProcessingJobs()
  const [job, setJob] = useState<Job | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    if (!jobId) return
    let alive = true
    let timer = 0

    const tick = async () => {
      try {
        const data = await getBalltrackJob(jobId)
        if (!alive) return
        setJob(data)
        if (data.status === 'completed' && data.session_id) {
          window.clearInterval(timer)
          navigate(`/app/ball-flight/results/${data.session_id}`, { replace: true })
          return
        }
        if (data.status === 'cancelled') {
          window.clearInterval(timer)
          untrackJob(data.id)
          navigate('/app/ball-flight', { replace: true })
          return
        }
        if (data.status === 'failed') {
          window.clearInterval(timer)
          untrackJob(data.id)
          setError(data.message || data.error || 'Ball tracking failed')
        }
      } catch (err) {
        if (!alive) return
        setError(err instanceof Error ? err.message : 'Could not load job')
      }
    }

    tick()
    timer = window.setInterval(tick, 400)
    return () => {
      alive = false
      window.clearInterval(timer)
    }
  }, [jobId, navigate, untrackJob])

  const progress = job?.progress ?? 0
  const stageKey =
    job?.stage === 'done' ? 'agent' : job?.stage === 'claimed' ? 'queued' : job?.stage || 'queued'
  const currentIdx = Math.max(0, STAGES.findIndex((s) => s.key === stageKey))
  const failed = job?.status === 'failed'
  const waiting = !failed && isWaitingToStart(job?.status)
  const pct = Math.max(0, Math.min(100, progress))
  const expectedLabel = waiting ? formatExpectedAt(job?.expected_start_at) : null
  const etaLabel = failed || waiting ? null : formatEta(job?.eta_seconds)

  async function onCancel() {
    if (!jobId || cancelling) return
    setCancelling(true)
    try {
      await cancelBalltrackJob(jobId)
      untrackJob(jobId)
      navigate('/app/ball-flight', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove this clip from the queue')
      setCancelling(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5">
      <Reveal>
        <Card interactive={false} className="p-6 sm:p-9">
          <div className="flex flex-col items-center text-center">
            <SeamBall size={72} spin={!failed} className="animate-float-slow" />
            <div className="mt-4">
              <Chip tone={failed ? 'bad' : 'lime'}>
              {failed ? 'Stopped' : waiting ? 'In the queue' : `Ball flight — ${Math.round(pct)}%`}
            </Chip>
            </div>
            <h1 className="font-display mt-3 text-2xl font-extrabold text-chalk sm:text-3xl">
              {failed ? 'We could not finish this one' : waiting ? 'Waiting to start' : 'Tracking the ball'}
            </h1>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-chalk/60">
              {job?.message || 'Getting your clip ready…'}
            </p>
            {!failed ? (
              <div className="mt-2.5 inline-flex items-center gap-2 rounded-lg border border-lime/20 bg-lime/[0.06] px-3 py-1.5">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-3.5 w-3.5 shrink-0 text-lime"
                  aria-hidden
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-xs font-semibold text-chalk/80">
                  {waiting && expectedLabel ? (
                    <>We'll start this clip around {expectedLabel}</>
                  ) : etaLabel ? (
                    <>Estimated time remaining: {etaLabel.toLowerCase()}</>
                  ) : waiting ? (
                    'Working out when this clip will start…'
                  ) : (
                    'Estimating time remaining…'
                  )}
                </span>
              </div>
            ) : null}
            {['queued', 'claimed', 'processing', 'analyzing'].includes(job?.status || '') ? (
              <div className="mt-4">
                <Button variant="secondary" size="sm" onClick={onCancel} disabled={cancelling}>
                  {cancelling
                    ? 'Removing…'
                    : job?.status === 'queued'
                      ? 'Remove from queue'
                      : 'Stop this analysis'}
                </Button>
              </div>
            ) : null}
          </div>

          {/* Progress */}
          <div className="mt-7">
            <div className="flex items-baseline justify-between pb-2">
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-chalk/40">
                Progress
              </span>
              <span className="font-display text-sm font-extrabold text-lime">{pct}%</span>
            </div>
            <div
              className="h-2.5 overflow-hidden rounded-full bg-white/8"
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className={`h-full rounded-full bg-gradient-to-r from-pitch-soft via-lime-deep to-lime transition-all duration-500 ${
                  failed ? '' : 'animate-pulse-bar'
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* Stages */}
          <ol className="mt-6 flex flex-col gap-1">
            {STAGES.map((s, i) => {
              const done = !failed && (currentIdx > i || job?.status === 'completed')
              const current = !failed && currentIdx === i && job?.status !== 'completed'
              const stopped = failed && currentIdx === i
              const detail = current ? formatStageDetail(job?.stage_detail) : null
              const frac = current ? stageFraction(job?.stage_detail) : null
              return (
                <li
                  key={s.key}
                  className={`rounded-xl px-3 py-2.5 text-sm transition ${
                    current ? 'bg-lime/10' : stopped ? 'bg-bad/10' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                  <span
                    className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[11px] font-bold ${
                      stopped
                        ? 'border-bad/40 bg-bad/15 text-bad'
                        : done
                          ? 'border-lime/45 bg-lime/15 text-lime'
                          : current
                            ? 'border-lime bg-lime text-night'
                            : 'border-white/12 bg-white/5 text-chalk/35'
                    }`}
                    aria-hidden
                  >
                    {stopped ? '!' : done ? '✓' : i + 1}
                  </span>
                  <span
                    className={`min-w-0 flex-1 ${
                      stopped
                        ? 'font-medium text-bad'
                        : done || current
                          ? 'font-medium text-chalk'
                          : 'text-chalk/40'
                    }`}
                  >
                    {s.label}
                    {detail ? (
                      <span className="mt-0.5 block font-mono text-[11px] font-medium tracking-tight text-lime/90">
                        {detail}
                      </span>
                    ) : null}
                  </span>
                  {current ? (
                    <span className="ml-auto h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-lime/30 border-t-lime" />
                  ) : null}
                  </div>
                  {current && frac != null ? (
                    <div className="ml-9 mt-1.5 h-1 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-lime transition-[width] duration-200"
                        style={{ width: `${Math.round(frac * 100)}%` }}
                      />
                    </div>
                  ) : null}
                </li>
              )
            })}
          </ol>
        </Card>
      </Reveal>

      {error ? (
        <Reveal>
          <div
            role="alert"
            className="rounded-[var(--radius-card)] border border-bad/30 bg-bad/10 p-5 text-center sm:p-6"
          >
            <p className="text-sm leading-relaxed break-words text-bad">{error}</p>
            <div className="mt-4 flex justify-center">
              <Button to="/app/ball-flight" variant="secondary" size="sm">
                Adjust the stump boxes and try again
              </Button>
            </div>
          </div>
        </Reveal>
      ) : (
        <Reveal delay={80}>
          <Card interactive={false} className="p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-chalk/40">
              While you wait
            </p>
            <p className="mt-2 text-sm leading-relaxed text-chalk/60">
              Every number is checked before it is shown. You can leave this page — we keep
              working, and the header ring shows where this clip is.
            </p>
          </Card>
        </Reveal>
      )}
    </div>
  )
}

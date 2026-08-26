import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getJob, type Job } from '../api/client'
import { Button, Card, Chip, Reveal } from '../components/site/ui'
import { BowlerSkeleton, SeamBall, TrajectoryArc } from '../components/site/visuals'

/**
 * Stage keys are the contract with the job feed; the labels are what the
 * bowler reads while they wait, so they are written in cricket terms rather
 * than in the language of the machinery behind them.
 */
const STAGES = [
  { key: 'extract', label: 'Reading your clip' },
  { key: 'pose', label: 'Mapping the bowler' },
  { key: 'action', label: 'Finding the release' },
  { key: 'ball', label: 'Following the ball' },
  { key: 'metrics', label: 'Measuring the delivery' },
  { key: 'render', label: 'Marking up the slow-motion clip' },
  { key: 'upload', label: 'Saving your clip' },
  { key: 'agent', label: 'Writing your coaching notes' },
  { key: 'pdf', label: 'Building your report' },
]

/** Rotates while the clip is read, so the wait teaches something. */
const TIPS = [
  {
    tag: 'Filming tip',
    body: 'Film side-on to the bowler, whole body in frame, from four or five metres back.',
  },
  {
    tag: 'Filming tip',
    body: 'Rest the phone on something solid. A steady frame reads far better than a handheld one.',
  },
  {
    tag: 'Filming tip',
    body: 'One delivery per clip. Leave a second of run-up before it and the follow-through after.',
  },
  {
    tag: 'Did you know',
    body: 'Release height and stride are reported against the bowler’s own height — which is why we ask for it on upload.',
  },
  {
    tag: 'Did you know',
    body: 'A higher frame rate catches the moment of release more precisely, so the timings come back tighter.',
  },
  {
    tag: 'Filming tip',
    body: 'Bright, even light gives the cleanest read. Filming into the sun rarely does.',
  },
  {
    tag: 'Did you know',
    body: 'Every number arrives with a confidence. If the clip cannot support a reading, you will be told instead of shown a guess.',
  },
]

const RING = 2 * Math.PI * 86

export function ProcessingPage() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState<Job | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [tip, setTip] = useState(0)

  useEffect(() => {
    if (!jobId) return
    let alive = true
    let timer = 0

    const tick = async () => {
      try {
        const data = await getJob(jobId)
        if (!alive) return
        setJob(data)
        if (data.status === 'completed' && data.delivery_id) {
          window.clearInterval(timer)
          navigate(`/app/results/${data.delivery_id}`, { replace: true })
          return
        }
        if (data.status === 'failed') {
          window.clearInterval(timer)
          setError(shortError(data.message || data.error || 'Analysis failed'))
        }
      } catch (err) {
        if (!alive) return
        setError(err instanceof Error ? err.message : 'Could not load job')
      }
    }

    tick()
    timer = window.setInterval(tick, 1500)
    return () => {
      alive = false
      window.clearInterval(timer)
    }
  }, [jobId, navigate])

  // Presentation only: cycles the tip card while the bowler waits.
  useEffect(() => {
    const rotate = window.setInterval(() => setTip((t) => (t + 1) % TIPS.length), 6500)
    return () => window.clearInterval(rotate)
  }, [])

  const progress = job?.progress ?? 0
  const stageKey = job?.stage === 'done' || job?.stage === 'queued' ? 'extract' : job?.stage
  const currentIdx = Math.max(0, STAGES.findIndex((s) => s.key === stageKey))
  const failed = job?.status === 'failed'

  const pct = Math.max(0, Math.min(100, progress))
  const current = TIPS[tip]

  return (
    <div className="min-w-0 space-y-6">
      <Reveal className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-lime">
            Working on it
          </p>
          <h1 className="font-display mt-1 text-3xl font-extrabold leading-tight text-chalk sm:text-4xl">
            Reading the delivery
          </h1>
        </div>
        <Chip tone={failed ? 'bad' : 'lime'}>
          <span
            className={`h-1.5 w-1.5 rounded-full bg-current ${failed ? '' : 'animate-pulse-bar'}`}
          />
          {failed ? 'Stopped' : 'In progress'}
        </Chip>
      </Reveal>

      <div className="grid min-w-0 gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        {/* -------- Progress dial + stage list -------- */}
        <Card interactive={false} className="min-w-0 p-6 sm:p-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
            <div className="relative h-44 w-44 shrink-0 sm:h-48 sm:w-48">
              <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90" aria-hidden>
                <defs>
                  <linearGradient id="progressArc" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#b6f24a" />
                    <stop offset="60%" stopColor="#8fd12b" />
                    <stop offset="100%" stopColor="#d9743c" />
                  </linearGradient>
                </defs>
                <circle
                  cx="100"
                  cy="100"
                  r="86"
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="10"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="86"
                  fill="none"
                  stroke={failed ? '#f87171' : 'url(#progressArc)'}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={RING}
                  strokeDashoffset={RING * (1 - pct / 100)}
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <div className="font-display text-4xl font-extrabold leading-none text-gradient-lime sm:text-5xl">
                    {Math.round(pct)}
                    <span className="text-xl">%</span>
                  </div>
                  <div className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-chalk/40">
                    Complete
                  </div>
                </div>
              </div>
              {!failed ? (
                <SeamBall
                  size={28}
                  className="absolute -right-1 bottom-3 drop-shadow-[0_6px_14px_rgba(0,0,0,0.5)]"
                />
              ) : null}
            </div>

            <div className="min-w-0 flex-1 text-center sm:text-left">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-chalk/40">
                Right now
              </p>
              <p className="font-display mt-1.5 break-words text-lg font-bold text-chalk">
                {job?.message || 'Getting your clip ready…'}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-chalk/55">
                A long clip filmed at a high frame rate can take a few minutes. Keep this
                tab open — you will be taken to the report the moment it is ready.
              </p>
            </div>
          </div>

          <ol className="mt-7 space-y-1 border-t border-white/10 pt-5">
            {STAGES.map((s, i) => {
              const done = !failed && (currentIdx > i || job?.status === 'completed')
              const active = !failed && currentIdx === i && job?.status !== 'completed'
              const broken = failed && currentIdx === i
              return (
                <li
                  key={s.key}
                  className={`flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm transition ${
                    active ? 'bg-lime/10' : broken ? 'bg-bad/10' : ''
                  }`}
                >
                  <span
                    className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[11px] font-bold ${
                      broken
                        ? 'border-bad/40 bg-bad/15 text-bad'
                        : done
                          ? 'border-ok/40 bg-ok/15 text-ok'
                          : active
                            ? 'border-lime/50 bg-lime/15 text-lime'
                            : 'border-white/10 bg-white/5 text-chalk/35'
                    }`}
                  >
                    {done ? '✓' : i + 1}
                  </span>
                  <span
                    className={`min-w-0 break-words ${
                      broken
                        ? 'font-semibold text-bad'
                        : active
                          ? 'font-semibold text-chalk'
                          : done
                            ? 'text-chalk/70'
                            : 'text-chalk/35'
                    }`}
                  >
                    {s.label}
                  </span>
                  {active ? (
                    <span className="ml-auto h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-lime/25 border-t-lime" />
                  ) : null}
                </li>
              )
            })}
          </ol>
        </Card>

        {/* -------- Preview + rotating tip -------- */}
        <div className="min-w-0 space-y-5">
          <Card interactive={false} className="min-w-0 overflow-hidden p-0">
            <div className="relative bg-pitch-gradient">
              <div className="absolute inset-0 bg-grid-tech opacity-50" aria-hidden />
              <div className="relative grid grid-cols-2 gap-2 p-5">
                <div className="h-40 opacity-80 sm:h-48">
                  <BowlerSkeleton />
                </div>
                <div className="h-40 self-center opacity-80 sm:h-48">
                  <TrajectoryArc />
                </div>
              </div>
              <div className="relative flex flex-wrap items-center gap-2 border-t border-white/10 px-5 py-3.5">
                <Chip tone="neutral">Body mapped</Chip>
                <Chip tone="neutral">Ball followed</Chip>
                <Chip tone="neutral">Clip marked up</Chip>
              </div>
            </div>
          </Card>

          <Card interactive={false} className="min-w-0 p-5 sm:p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-lime">
              {current.tag}
            </p>
            <p key={tip} className="animate-rise mt-2.5 text-sm leading-relaxed text-chalk/70">
              {current.body}
            </p>
            <div className="mt-4 flex gap-1.5" aria-hidden>
              {TIPS.map((t, i) => (
                <span
                  key={t.body}
                  className={`h-1 flex-1 rounded-full transition-colors duration-500 ${
                    i === tip ? 'bg-lime' : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
          </Card>
        </div>
      </div>

      {error ? (
        <div className="animate-rise rounded-[var(--radius-card)] border border-bad/30 bg-bad/10 p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-bad">
            We could not finish this one
          </p>
          <p className="mt-2 break-words text-sm leading-relaxed text-chalk/80">{error}</p>
          <div className="mt-4">
            <Button to="/app" variant="secondary" size="sm">
              Back to upload
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function shortError(message: string) {
  const first = message.split('\n')[0]?.trim() || message
  return first.length > 280 ? `${first.slice(0, 277)}…` : first
}

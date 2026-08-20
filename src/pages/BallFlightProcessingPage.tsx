import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getBalltrackJob, type Job } from '../api/client'

const STAGES = [
  { key: 'calibrate', label: 'Building pitch homography' },
  { key: 'detect', label: 'Finding the ball' },
  { key: 'track', label: 'Fitting trajectories' },
  { key: 'metrics', label: 'Checking speed, line, length' },
  { key: 'render', label: 'Rendering overlay and pitch map' },
  { key: 'agent', label: 'Coaching drills from the catalog' },
]

export function BallFlightProcessingPage() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState<Job | null>(null)
  const [error, setError] = useState<string | null>(null)

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
          navigate(`/ball-flight/results/${data.session_id}`, { replace: true })
          return
        }
        if (data.status === 'failed') {
          window.clearInterval(timer)
          setError(data.message || data.error || 'Ball tracking failed')
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

  const progress = job?.progress ?? 0
  const stageKey = job?.stage === 'done' || job?.stage === 'queued' ? 'calibrate' : job?.stage
  const currentIdx = Math.max(0, STAGES.findIndex((s) => s.key === stageKey))
  const failed = job?.status === 'failed'

  return (
    <section className="mx-auto max-w-xl animate-rise rounded-3xl border border-pitch/10 bg-white/80 p-8 shadow-lg backdrop-blur">
      <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-seam">Ball flight</p>
      <h1 className="font-display mt-2 text-center text-3xl font-bold text-pitch">Tracking the ball</h1>
      <p className="mt-3 text-center text-sm text-pitch/65">{job?.message || 'Queued…'}</p>

      <div className="mt-8 h-3 overflow-hidden rounded-full bg-pitch/10">
        <div
          className="animate-pulse-bar h-full rounded-full bg-gradient-to-r from-pitch to-seam transition-all duration-500"
          style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
        />
      </div>
      <div className="mt-2 text-center text-sm font-medium text-pitch">{progress}%</div>

      <ol className="mt-6 space-y-2">
        {STAGES.map((s, i) => {
          const done = !failed && (currentIdx > i || job?.status === 'completed')
          const current = !failed && currentIdx === i
          return (
            <li
              key={s.key}
              className={`rounded-xl px-3 py-2 text-sm ${
                done ? 'bg-emerald-50 text-emerald-800' : current ? 'bg-amber-50 text-amber-900' : 'text-pitch/45'
              }`}
            >
              {s.label}
            </li>
          )
        })}
      </ol>

      {error ? (
        <div className="mt-6 space-y-3 text-center">
          <p className="text-sm text-ball">{error}</p>
          <Link to="/ball-flight" className="text-sm font-semibold text-pitch underline">
            Adjust stump boxes and try again
          </Link>
        </div>
      ) : null}
    </section>
  )
}

import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getJob, type Job } from '../api/client'

const STAGES = [
  { key: 'extract', label: 'Reading video' },
  { key: 'pose', label: 'Estimating bowler pose' },
  { key: 'action', label: 'Detecting release & phases' },
  { key: 'ball', label: 'Tracking ball flight' },
  { key: 'metrics', label: 'Calculating metrics' },
  { key: 'render', label: 'Rendering slow-motion overlay' },
  { key: 'upload', label: 'Saving processed video' },
  { key: 'agent', label: 'AI coaching analysis' },
  { key: 'pdf', label: 'Building PDF report' },
]

export function ProcessingPage() {
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
        const data = await getJob(jobId)
        if (!alive) return
        setJob(data)
        if (data.status === 'completed' && data.delivery_id) {
          window.clearInterval(timer)
          navigate(`/results/${data.delivery_id}`, { replace: true })
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

  const progress = job?.progress ?? 0
  const stageKey = job?.stage === 'done' || job?.stage === 'queued' ? 'extract' : job?.stage
  const currentIdx = Math.max(0, STAGES.findIndex((s) => s.key === stageKey))
  const failed = job?.status === 'failed'

  return (
    <section className="mx-auto max-w-xl animate-rise rounded-3xl border border-pitch/10 bg-white/80 p-8 shadow-lg backdrop-blur">
      <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-seam">Processing</p>
      <h1 className="font-display mt-2 text-center text-3xl font-bold text-pitch">Reading the delivery</h1>
      <p className="mt-3 text-center text-sm text-pitch/65">{job?.message || 'Starting pipeline…'}</p>
      <p className="mt-1 text-center text-xs text-pitch/45">
        Pose on a long, high-fps clip can take several minutes. Keep this tab open.
      </p>

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
          const active = !failed && currentIdx === i && job?.status !== 'completed'
          return (
            <li key={s.key} className="flex items-center gap-3 text-sm">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  failed && currentIdx === i
                    ? 'bg-ball text-white'
                    : done
                      ? 'bg-emerald-500 text-white'
                      : active
                        ? 'bg-seam text-white'
                        : 'bg-pitch/10 text-pitch/40'
                }`}
              >
                {done ? '✓' : i + 1}
              </span>
              <span className={done || active ? 'font-medium text-pitch' : 'text-pitch/45'}>{s.label}</span>
              {active ? <span className="ml-auto h-3 w-3 animate-spin rounded-full border-2 border-seam/40 border-t-seam" /> : null}
            </li>
          )
        })}
      </ol>

      {error ? (
        <div className="mt-6 rounded-xl bg-red-50 p-4 text-left text-sm text-ball">
          <p>{error}</p>
          <Link to="/" className="mt-3 inline-block font-semibold underline">
            Back to upload
          </Link>
        </div>
      ) : null}
    </section>
  )
}

function shortError(message: string) {
  const first = message.split('\n')[0]?.trim() || message
  return first.length > 280 ? `${first.slice(0, 277)}…` : first
}

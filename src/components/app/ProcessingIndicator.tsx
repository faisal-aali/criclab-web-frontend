import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatEta, formatExpectedAt, isWaitingToStart } from '../../lib/eta'
import { jobHref, useProcessingJobs } from './ProcessingJobs'

const RING = 2 * Math.PI * 10

export function ProcessingIndicator() {
  const { jobs } = useProcessingJobs()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (jobs.length === 0) return null

  const primary = jobs[0]
  const pct = Math.max(0, Math.min(100, Math.round(primary.progress || 0)))
  const dash = RING * (1 - pct / 100)

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`${jobs.length} clip${jobs.length === 1 ? '' : 's'} processing, ${pct}%`}
        aria-expanded={open}
        title="Video processing"
        className="relative grid h-10 w-10 place-items-center rounded-xl border border-lime/35 bg-lime/10 text-lime transition hover:border-lime/60"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6 -rotate-90" aria-hidden>
          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2.4" />
          <circle
            cx="12"
            cy="12"
            r="10"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeDasharray={RING}
            strokeDashoffset={dash}
          />
        </svg>
        <span className="absolute inset-0 grid place-items-center text-[9px] font-extrabold text-lime">
          {pct}
        </span>
        {jobs.length > 1 ? (
          <span className="absolute -right-1 -top-1 grid min-w-[16px] place-items-center rounded-full bg-lime px-1 text-[9px] font-extrabold text-night">
            {jobs.length}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-12 z-50 w-[min(92vw,20rem)] overflow-hidden rounded-2xl border border-white/12 bg-charcoal shadow-2xl shadow-black/50">
          <div className="border-b border-white/8 px-4 py-3">
            <p className="text-sm font-bold text-chalk">Processing</p>
            <p className="mt-0.5 text-[11px] text-chalk/45">Runs in the background. You can leave this page.</p>
          </div>
          <div className="scroll-slim max-h-[60vh] overflow-y-auto">
            {jobs.map((job) => {
              const p = Math.max(0, Math.min(100, Math.round(job.progress || 0)))
              const waiting = isWaitingToStart(job.status)
              const expected = waiting ? formatExpectedAt(job.expected_start_at) : null
              const eta = waiting ? null : formatEta(job.eta_seconds)
              const when = expected ? `Starts ${expected}` : eta
              return (
                <button
                  key={job.id}
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    navigate(jobHref(job))
                  }}
                  className="flex w-full flex-col gap-1.5 border-b border-white/6 px-4 py-3.5 text-left transition hover:bg-white/[0.04]"
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-chalk">
                      {job.kind === 'ballflight' ? 'Ball flight' : 'Action'}
                    </span>
                    <span className="text-[11px] font-bold text-lime">
                      {waiting ? 'Queued' : `${p}%`}
                    </span>
                  </span>
                  <span className="h-1 overflow-hidden rounded-full bg-white/10">
                    <span className="block h-full rounded-full bg-lime" style={{ width: `${waiting ? 4 : p}%` }} />
                  </span>
                  <span className="text-xs text-chalk/50">
                    {job.message || 'Working…'}
                    {when ? ` · ${when}` : ''}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}

/**
 * Tracks in-flight video jobs for the whole workspace.
 *
 * Processing runs on criclab-video-service workers, not in the tab. This
 * provider only polls status so the header ring stays live if the user
 * leaves the processing page. The poll pauses while the tab is hidden and
 * refreshes the moment it is shown again — a background tab has nothing to
 * paint, and every hidden tab was otherwise a request every two seconds.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { listActiveJobs, type Job } from '../../api/client'
import { useAuth } from '../../auth/AuthProvider'

const POLL_MS = 2000

type Ctx = {
  jobs: Job[]
  trackJob: (job: Pick<Job, 'id' | 'kind'>) => void
  untrackJob: (jobId: string) => void
}

const ProcessingJobsContext = createContext<Ctx | null>(null)

export function ProcessingJobsProvider({ children }: { children: ReactNode }) {
  const { status } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const jobsRef = useRef(jobs)
  jobsRef.current = jobs

  const refresh = useCallback(async () => {
    if (status !== 'authenticated') {
      setJobs([])
      return
    }
    try {
      const { items } = await listActiveJobs()
      setJobs(items.filter((j) => j.status !== 'cancelled' && j.status !== 'failed'))
    } catch {
      /* a dropped poll must not blank the header */
    }
  }, [status])

  useEffect(() => {
    if (status !== 'authenticated') {
      setJobs([])
      return
    }
    void refresh()
    const id = window.setInterval(() => {
      if (!document.hidden) void refresh()
    }, POLL_MS)
    const onVisible = () => {
      if (!document.hidden) void refresh()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [status, refresh])

  const trackJob = useCallback((job: Pick<Job, 'id' | 'kind'>) => {
    setJobs((prev) => {
      if (prev.some((j) => j.id === job.id)) return prev
      return [
        {
          id: job.id,
          kind: job.kind,
          status: 'queued',
          progress: 0,
          stage: 'queued',
          message: 'Queued for analysis',
        },
        ...prev,
      ]
    })
  }, [])

  const untrackJob = useCallback((jobId: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== jobId))
  }, [])

  const value = useMemo(() => ({ jobs, trackJob, untrackJob }), [jobs, trackJob, untrackJob])
  return <ProcessingJobsContext.Provider value={value}>{children}</ProcessingJobsContext.Provider>
}

export function useProcessingJobs(): Ctx {
  const ctx = useContext(ProcessingJobsContext)
  if (!ctx) throw new Error('useProcessingJobs must be used within ProcessingJobsProvider')
  return ctx
}

export function jobHref(job: Job): string {
  if (job.kind === 'ballflight') {
    if (job.status === 'completed' && job.session_id) return `/app/ball-flight/results/${job.session_id}`
    return `/app/ball-flight/processing/${job.id}`
  }
  if (job.status === 'completed' && job.delivery_id) return `/app/results/${job.delivery_id}`
  return `/app/processing/${job.id}`
}

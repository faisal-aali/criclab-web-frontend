import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createBalltrackSession, detectStumps, type ClipUploadProgress, type StumpBox } from '../api/client'
import { ClipUploadOverlay } from '../components/app/ClipUploadOverlay'
import { useProcessingJobs } from '../components/app/ProcessingJobs'
import { Button, Card, Chip, Reveal } from '../components/site/ui'
import { TrajectoryArc } from '../components/site/visuals'

const DEFAULT_BOWLER: StumpBox = { x: 0.22, y: 0.62, w: 0.56, h: 0.3 }
const DEFAULT_BATTER: StumpBox = { x: 0.36, y: 0.05, w: 0.28, h: 0.22 }

/** Box outline colours — seam for the near wicket, lime for the far one. */
const BOWLER_COLOR = '#d9743c'
const BATTER_COLOR = '#b6f24a'

function clampBox(b: StumpBox): StumpBox {
  const w = Math.min(0.9, Math.max(0.04, b.w))
  const h = Math.min(0.7, Math.max(0.04, b.h))
  const x = Math.min(1 - w, Math.max(0, b.x))
  const y = Math.min(1 - h, Math.max(0, b.y))
  return { x, y, w, h }
}

function grabFirstFrame(file: File): Promise<{ blob: Blob; url: string }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const video = document.createElement('video')
    video.muted = true
    video.playsInline = true
    video.preload = 'auto'
    video.src = url
    const fail = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read the first frame'))
    }
    video.onerror = fail
    video.onloadeddata = () => {
      video.currentTime = Math.min(0.05, (video.duration || 1) * 0.01)
    }
    video.onseeked = () => {
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth || 1280
      canvas.height = video.videoHeight || 720
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        fail()
        return
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url)
          if (!blob) {
            reject(new Error('Could not encode the still'))
            return
          }
          resolve({ blob, url: URL.createObjectURL(blob) })
        },
        'image/jpeg',
        0.86,
      )
    }
  })
}

/** Numbered marker for the guided steps. */
function StepBadge({ n, state }: { n: number; state: 'done' | 'active' | 'idle' }) {
  const tone =
    state === 'done'
      ? 'border-lime/50 bg-lime/15 text-lime'
      : state === 'active'
        ? 'border-lime bg-lime text-night'
        : 'border-white/15 bg-white/5 text-chalk/45'
  return (
    <span
      className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border text-[12px] font-extrabold ${tone}`}
      aria-hidden
    >
      {state === 'done' ? '✓' : n}
    </span>
  )
}

function BoxHandle({
  box,
  label,
  color,
  onChange,
}: {
  box: StumpBox
  label: string
  color: string
  onChange: (next: StumpBox) => void
}) {
  const mode = useRef<'move' | 'resize' | null>(null)
  const origin = useRef({ px: 0, py: 0, box })

  const onDown = (kind: 'move' | 'resize') => (e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const frame = (e.currentTarget.closest('[data-stump-frame]') as HTMLElement | null)?.getBoundingClientRect()
    if (!frame) return
    mode.current = kind
    origin.current = { px: e.clientX, py: e.clientY, box: { ...box } }
    const move = (ev: PointerEvent) => {
      const dx = (ev.clientX - origin.current.px) / frame.width
      const dy = (ev.clientY - origin.current.py) / frame.height
      if (mode.current === 'move') {
        onChange(clampBox({ ...origin.current.box, x: origin.current.box.x + dx, y: origin.current.box.y + dy }))
      } else {
        onChange(
          clampBox({
            ...origin.current.box,
            w: origin.current.box.w + dx,
            h: origin.current.box.h + dy,
          }),
        )
      }
    }
    const up = () => {
      mode.current = null
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  return (
    <div
      className="absolute touch-none cursor-move rounded-md border-2 shadow-[0_0_0_1px_rgba(0,0,0,0.35)]"
      style={{
        left: `${box.x * 100}%`,
        top: `${box.y * 100}%`,
        width: `${box.w * 100}%`,
        height: `${box.h * 100}%`,
        borderColor: color,
        background: `${color}1f`,
      }}
      onPointerDown={onDown('move')}
    >
      <span
        className="on-night absolute left-1.5 top-1.5 inline-flex items-center gap-1.5 rounded-full border bg-night/85 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-chalk backdrop-blur"
        style={{ borderColor: color }}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
        {label}
      </span>
      <div
        className="absolute -bottom-1.5 -right-1.5 h-5 w-5 touch-none cursor-nwse-resize rounded-full bg-chalk shadow-md"
        style={{ border: `2px solid ${color}` }}
        onPointerDown={onDown('resize')}
      />
    </div>
  )
}

export function BallFlightPage() {
  const navigate = useNavigate()
  const { trackJob } = useProcessingJobs()
  const fileRef = useRef<File | null>(null)
  const [hasFile, setHasFile] = useState(false)
  const [fileName, setFileName] = useState('')
  const [stillUrl, setStillUrl] = useState('')
  const [bowler, setBowler] = useState<StumpBox>(DEFAULT_BOWLER)
  const [batter, setBatter] = useState<StumpBox>(DEFAULT_BATTER)
  const [title, setTitle] = useState('Nets session')
  const [busy, setBusy] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<ClipUploadProgress | null>(null)
  const [detecting, setDetecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (stillUrl) URL.revokeObjectURL(stillUrl)
    }
  }, [stillUrl])

  const onFile = useCallback(async (file: File) => {
    fileRef.current = file
    setHasFile(true)
    setFileName(file.name)
    setError(null)
    setDetecting(true)
    try {
      const frame = await grabFirstFrame(file)
      setStillUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return frame.url
      })
      try {
        const detected = await detectStumps(frame.blob)
        setBowler(clampBox(detected.bowler))
        setBatter(clampBox(detected.batter))
      } catch (err) {
        setBowler(DEFAULT_BOWLER)
        setBatter(DEFAULT_BATTER)
        setError(
          err instanceof Error
            ? `${err.message} Drag the boxes onto both stump sets.`
            : 'The stumps could not be placed for you. Drag the boxes onto both wickets.',
        )
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not read that video')
    } finally {
      setDetecting(false)
    }
  }, [])

  async function onSubmit() {
    const file = fileRef.current
    if (!file) {
      setError('Choose a behind-the-bowler clip first.')
      return
    }
    setBusy(true)
    setError(null)
    setUploadProgress({ phase: 'upload', loaded: 0, total: file.size || 1 })
    try {
      const res = await createBalltrackSession(
        {
          file,
          title,
          calibration: { bowler, batter, pitch_length_m: 20.12 },
        },
        setUploadProgress,
      )
      trackJob({ id: res.job_id, kind: 'ballflight' })
      navigate(`/app/ball-flight/processing/${res.job_id}`, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setBusy(false)
      setUploadProgress(null)
    }
  }

  return (
    <div className="space-y-7">
      {/* ---------------- Header ---------------- */}
      <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <Chip tone="lime">Ball flight</Chip>
          <h1 className="font-display mt-3 text-3xl font-extrabold leading-[1.08] text-chalk sm:text-4xl">
            Speed, line <span className="text-gradient-lime">and length</span>
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-chalk/60 sm:text-base">
            Measured off the pitch itself, using both sets of stumps as the reference. If the boxes
            are off or the ball is hidden, you get no number rather than a wrong one.
          </p>
        </div>
        <Button to="/record" variant="secondary" size="sm" className="self-start sm:self-auto">
          Filming guide
          <span aria-hidden>→</span>
        </Button>
      </Reveal>

      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit()
        }}
      >
        <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          {/* ---------------- Steps 1 + 2 ---------------- */}
          <Reveal>
            <Card interactive={false} className="h-full p-5 sm:p-6">
              <div className="flex flex-col gap-6">
                <div className="flex gap-3.5">
                  <StepBadge n={1} state={title.trim() ? 'done' : 'active'} />
                  <label className="block min-w-0 flex-1">
                    <span className="text-sm font-semibold text-chalk">Name this session</span>
                    <span className="mt-0.5 block text-xs text-chalk/50">
                      Something you will recognise in your history later.
                    </span>
                    <input
                      className="field field-dark mt-2.5"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </label>
                </div>

                <div className="flex gap-3.5">
                  <StepBadge n={2} state={hasFile ? 'done' : 'active'} />
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-semibold text-chalk">Choose your clip</span>
                    <span className="mt-0.5 block text-xs text-chalk/50">
                      Filmed from behind the bowler, with both wickets in shot.
                    </span>
                    <label
                      className={`mt-2.5 flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed px-4 py-7 text-center transition ${
                        hasFile
                          ? 'border-lime/45 bg-lime/[0.06]'
                          : 'border-white/15 bg-white/[0.03] hover:border-lime/45 hover:bg-white/[0.05]'
                      }`}
                    >
                      <span className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/5 text-lime">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4.5 w-4.5">
                          <path d="M12 16V4m0 0L8 8m4-4 4 4M4 17v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <span className="w-full break-words px-2 text-sm font-semibold text-chalk">
                        {fileName || 'Tap to choose a behind-the-bowler clip'}
                      </span>
                      <span className="text-[11px] uppercase tracking-[0.14em] text-chalk/40">
                        mp4 · mov · webm
                      </span>
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0]
                          if (f) onFile(f)
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </Card>
          </Reveal>

          {/* ---------------- Filming guidance ---------------- */}
          <Reveal delay={80}>
            <Card interactive={false} className="h-full p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-base font-bold text-chalk">Film it this way</h2>
                <Chip>Two minutes</Chip>
              </div>
              <ul className="mt-4 flex flex-col gap-3">
                {[
                  'Tripod about 4 m behind the non-striker',
                  'Both wickets in frame for the whole delivery',
                  'Do not stand in the way of the ball',
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-sm leading-relaxed text-chalk/70">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-lime/15 text-[11px] font-bold text-lime">
                      ✓
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
              <div className="mt-5 h-28 rounded-2xl border border-white/10 bg-night/40 p-2">
                <TrajectoryArc />
              </div>
              <p className="mt-4 text-xs leading-relaxed text-chalk/45">
                A steadier clip gives a cleaner read.{' '}
                <Link to="/record" className="font-semibold text-lime hover:text-chalk">
                  Read the full filming guide →
                </Link>
              </p>
            </Card>
          </Reveal>
        </div>

        {/* ---------------- Step 3: calibration ---------------- */}
        <Reveal delay={120}>
          <Card interactive={false} className="p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 gap-3.5">
                <StepBadge n={3} state={stillUrl ? 'active' : 'idle'} />
                <div className="min-w-0">
                  <h2 className="font-display text-base font-bold text-chalk">Mark the two wickets</h2>
                  <p className="mt-0.5 text-xs leading-relaxed text-chalk/50">
                    The gap between the stumps is the ruler for every measurement, so the boxes
                    matter more than anything else on this page.
                  </p>
                </div>
              </div>
              {stillUrl ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-chalk/70">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: BOWLER_COLOR }} />
                    Bowler stumps · near
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-chalk/70">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: BATTER_COLOR }} />
                    Batter stumps · far
                  </span>
                </div>
              ) : null}
            </div>

            {detecting ? (
              <p className="mt-4 flex items-center gap-2.5 text-sm text-chalk/60">
                <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-lime/30 border-t-lime" />
                Opening your clip and looking for the stumps…
              </p>
            ) : null}

            {stillUrl ? (
              <div className="mt-4 space-y-2.5">
                <div
                  className="relative overflow-hidden rounded-2xl border border-white/10 bg-night"
                  data-stump-frame
                >
                  <img src={stillUrl} alt="First frame of your clip" className="block w-full select-none" />
                  <BoxHandle box={bowler} label="Bowler stumps" color={BOWLER_COLOR} onChange={setBowler} />
                  <BoxHandle box={batter} label="Batter stumps" color={BATTER_COLOR} onChange={setBatter} />
                </div>
                <p className="text-xs leading-relaxed text-chalk/45">
                  Drag a box to move it, drag its corner to resize. Each box should sit snugly
                  around one full set of stumps.
                </p>
              </div>
            ) : detecting ? null : (
              <div className="mt-4 grid gap-5 rounded-2xl border border-dashed border-white/12 bg-white/[0.02] p-5 text-center sm:p-8">
                {/* Preview of the calibration step, so the ask is obvious before any clip exists */}
                <div
                  className="relative mx-auto aspect-video w-full max-w-md overflow-hidden rounded-xl border border-white/10 bg-night/60"
                  aria-hidden
                >
                  <div className="absolute inset-0 bg-grid-tech opacity-40" />
                  <div
                    className="absolute rounded-md border-2 border-dashed"
                    style={{
                      left: `${DEFAULT_BATTER.x * 100}%`,
                      top: `${DEFAULT_BATTER.y * 100}%`,
                      width: `${DEFAULT_BATTER.w * 100}%`,
                      height: `${DEFAULT_BATTER.h * 100}%`,
                      borderColor: `${BATTER_COLOR}80`,
                    }}
                  />
                  <div
                    className="absolute rounded-md border-2 border-dashed"
                    style={{
                      left: `${DEFAULT_BOWLER.x * 100}%`,
                      top: `${DEFAULT_BOWLER.y * 100}%`,
                      width: `${DEFAULT_BOWLER.w * 100}%`,
                      height: `${DEFAULT_BOWLER.h * 100}%`,
                      borderColor: `${BOWLER_COLOR}80`,
                    }}
                  />
                  <span className="absolute inset-x-0 bottom-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-chalk/35">
                    Two boxes, one per wicket
                  </span>
                </div>
                <div className="mx-auto max-w-md">
                  <p className="text-sm font-semibold text-chalk">Choose a clip to start</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-chalk/50">
                    Once a clip is in, we take its opening frame and put a box on each set of
                    stumps for you. You nudge them into place, then track the delivery.
                  </p>
                </div>
              </div>
            )}
          </Card>
        </Reveal>

        {/* ---------------- Errors + submit ---------------- */}
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

        <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-relaxed text-chalk/45 sm:max-w-md">
            A number only appears when the delivery passes our checks. Anything we cannot see
            clearly is reported as unavailable.
          </p>
          <Button type="submit" size="lg" disabled={busy || !hasFile} className="w-full sm:w-auto">
            {busy
              ? uploadProgress?.phase === 'upload'
                ? 'Uploading clip…'
                : 'Starting analysis…'
              : 'Track ball flight'}
            <span aria-hidden>→</span>
          </Button>
        </div>
      </form>
      <ClipUploadOverlay progress={uploadProgress} label="Ball flight clip" />
    </div>
  )
}

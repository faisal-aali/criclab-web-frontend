import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { createBalltrackSession, detectStumps, type StumpBox } from '../api/client'

const DEFAULT_BOWLER: StumpBox = { x: 0.22, y: 0.62, w: 0.56, h: 0.3 }
const DEFAULT_BATTER: StumpBox = { x: 0.36, y: 0.05, w: 0.28, h: 0.22 }

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
      className="absolute cursor-move border-2"
      style={{
        left: `${box.x * 100}%`,
        top: `${box.y * 100}%`,
        width: `${box.w * 100}%`,
        height: `${box.h * 100}%`,
        borderColor: color,
        background: `${color}22`,
      }}
      onPointerDown={onDown('move')}
    >
      <span
        className="absolute left-1 top-1 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
        style={{ background: color }}
      >
        {label}
      </span>
      <div
        className="absolute bottom-0 right-0 h-4 w-4 cursor-nwse-resize bg-white"
        style={{ border: `2px solid ${color}` }}
        onPointerDown={onDown('resize')}
      />
    </div>
  )
}

export function BallFlightPage() {
  const navigate = useNavigate()
  const fileRef = useRef<File | null>(null)
  const [hasFile, setHasFile] = useState(false)
  const [fileName, setFileName] = useState('')
  const [stillUrl, setStillUrl] = useState('')
  const [bowler, setBowler] = useState<StumpBox>(DEFAULT_BOWLER)
  const [batter, setBatter] = useState<StumpBox>(DEFAULT_BATTER)
  const [title, setTitle] = useState('Nets session')
  const [busy, setBusy] = useState(false)
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
            : 'Could not auto-detect stumps. Drag the boxes onto both wickets.',
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
    try {
      const res = await createBalltrackSession({
        file,
        title,
        calibration: { bowler, batter, pitch_length_m: 20.12 },
      })
      navigate(`/ball-flight/processing/${res.job_id}`, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
      <div className="animate-rise">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-seam">Ball flight · ICC path</p>
        <h1 className="font-display mt-3 text-5xl font-bold leading-[1.12] tracking-normal sm:text-6xl">
          <span className="text-pitch">Speed, line</span>{' '}
          <span className="bg-gradient-to-r from-seam to-ball bg-clip-text pr-1 text-transparent">and length</span>
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-pitch/75">
          Pitch-plane metrics from both stump sets — not a radar gun, and not the Action pose job. Bad boxes or a
          blocked ball yield no number rather than a fake one.
        </p>
        <div className="mt-6 rounded-2xl border border-pitch/10 bg-white/70 p-4 text-sm text-pitch/75">
          <p className="font-semibold text-pitch">Film it this way</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Tripod about 4 m behind the non-striker</li>
            <li>Both wickets in frame for the whole delivery</li>
            <li>Do not stand in the way of the ball</li>
          </ul>
        </div>
      </div>

      <form
        className="animate-rise space-y-4 rounded-3xl border border-pitch/10 bg-white/80 p-6 shadow-lg"
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit()
        }}
      >
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-pitch/55">Session title</span>
          <input
            className="mt-1 w-full rounded-xl border border-pitch/15 px-3 py-2 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-pitch/25 bg-mist px-4 py-8 text-center">
          <span className="font-semibold text-pitch">{fileName || 'Choose a behind-bowler clip'}</span>
          <span className="mt-1 text-xs text-pitch/55">mp4, mov, webm</span>
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

        {detecting ? <p className="text-sm text-pitch/60">Reading first frame and looking for stumps…</p> : null}

        {stillUrl ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-pitch/55">
              Drag boxes onto bowler stumps (near) and batter stumps (far)
            </p>
            <div className="relative overflow-hidden rounded-2xl border border-pitch/10 bg-black" data-stump-frame>
              <img src={stillUrl} alt="First frame" className="block w-full" />
              <BoxHandle box={bowler} label="Bowler stumps" color="#C45C26" onChange={setBowler} />
              <BoxHandle box={batter} label="Batter stumps" color="#2F6FED" onChange={setBatter} />
            </div>
          </div>
        ) : null}

        {error ? <p className="text-sm text-ball">{error}</p> : null}

        <button
          type="submit"
          disabled={busy || !hasFile}
          className="w-full rounded-xl bg-gradient-to-r from-seam to-ball px-4 py-3 text-sm font-semibold text-white shadow-md disabled:opacity-50"
        >
          {busy ? 'Uploading…' : 'Track ball flight'}
        </button>
      </form>
    </section>
  )
}

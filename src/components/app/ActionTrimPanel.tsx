import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { formatBytes } from './ClipUploadOverlay'
import { MAX_BYTES, MAX_DURATION_S } from '../../lib/clipSpec'
import {
  clampTrimRange,
  estimateTrimBytes,
  MSG_TRIM_4K,
  MSG_TRIM_KEYFRAME,
  MSG_TRIM_LOSSLESS,
  trimFitsSize,
} from '../../lib/trimClip'
import { Button } from '../site/ui'
import { VideoTrimTimeline } from './VideoTrimTimeline'

function formatSeconds(value: number): string {
  if (!(value >= 0) || !Number.isFinite(value)) return '0.0 s'
  return `${value.toFixed(1)} s`
}

function extractFilmstripFrames(src: string, durationS: number): Promise<string[]> {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    video.preload = 'auto'
    video.playsInline = true
    video.muted = true
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      resolve([])
      return
    }
    const frameCount = Math.max(4, Math.min(14, Math.round(durationS * 1.5)))
    const times: number[] = []
    for (let i = 0; i < frameCount; i++) {
      times.push((durationS * (i + 0.5)) / frameCount)
    }
    const frames: string[] = []
    let index = 0
    let settled = false
    const finish = (result: string[]) => {
      if (settled) return
      settled = true
      window.clearTimeout(timer)
      resolve(result)
    }
    const timer = window.setTimeout(() => finish([]), 20_000)
    video.onloadedmetadata = () => {
      const thumbW = 160
      const thumbH = Math.round((video.videoHeight || 0) * (thumbW / (video.videoWidth || 1)))
      canvas.width = thumbW
      canvas.height = Math.max(1, thumbH || 90)
      seek()
    }
    video.onerror = () => finish([])
    function seek() {
      if (index >= times.length) {
        finish(frames)
        return
      }
      video.currentTime = times[index]
    }
    video.onseeked = () => {
      if (settled) return
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        (blob) => {
          frames.push(blob ? URL.createObjectURL(blob) : '')
          index++
          seek()
        },
        'image/jpeg',
        0.75,
      )
    }
    video.src = src
    void video.play().then(
      () => video.pause(),
      () => video.load(),
    )
  })
}

export function ActionTrimPanel({
  previewUrl,
  durationS,
  sourceBytes,
  sourceKey,
  busy,
  required,
  applied,
  error,
  onApply,
}: {
  previewUrl: string
  durationS: number
  sourceBytes: number
  sourceKey: string
  busy: boolean
  required?: boolean
  applied?: { startS: number; endS: number } | null
  error: string | null
  onApply: (startS: number, endS: number) => void
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const videoId = useId()
  const frameUrlsRef = useRef<string[]>([])
  const defaults = useMemo(
    () => clampTrimRange(0, Math.min(MAX_DURATION_S, durationS), durationS),
    [durationS],
  )
  const [startS, setStartS] = useState(defaults.startS)
  const [endS, setEndS] = useState(defaults.endS)
  const [playheadS, setPlayheadS] = useState(defaults.startS)
  const [playing, setPlaying] = useState(false)
  const [filmstripFrames, setFilmstripFrames] = useState<string[]>([])

  useEffect(() => {
    setStartS(defaults.startS)
    setEndS(defaults.endS)
    setPlayheadS(defaults.startS)
    const el = videoRef.current
    if (el && Number.isFinite(defaults.startS)) {
      el.currentTime = defaults.startS
    }
  }, [defaults.startS, defaults.endS, sourceKey])

  useEffect(() => {
    let active = true
    if (!previewUrl || !(durationS > 0)) {
      frameUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
      frameUrlsRef.current = []
      setFilmstripFrames([])
      return
    }
    extractFilmstripFrames(previewUrl, durationS).then((urls) => {
      if (!active) {
        urls.forEach((url) => URL.revokeObjectURL(url))
        return
      }
      frameUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
      frameUrlsRef.current = urls
      setFilmstripFrames(urls)
    })
    return () => {
      active = false
    }
  }, [previewUrl, durationS])

  useEffect(
    () => () => {
      frameUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
      frameUrlsRef.current = []
    },
    [],
  )

  const range = clampTrimRange(startS, endS, durationS)
  const estimated = estimateTrimBytes(sourceBytes, durationS, range.windowS)
  const fits = trimFitsSize(sourceBytes, durationS, range.windowS)
  const canApply = !busy && range.windowS > 0 && fits

  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onTime = () => {
      if (el.currentTime > range.endS) {
        el.currentTime = range.endS
        el.pause()
      } else if (el.currentTime < range.startS) {
        el.currentTime = range.startS
      }
      setPlayheadS(Math.min(Math.max(el.currentTime, range.startS), range.endS))
    }
    el.addEventListener('play', onPlay)
    el.addEventListener('pause', onPause)
    el.addEventListener('timeupdate', onTime)
    return () => {
      el.removeEventListener('play', onPlay)
      el.removeEventListener('pause', onPause)
      el.removeEventListener('timeupdate', onTime)
    }
  }, [range.startS, range.endS, previewUrl])

  function togglePlay() {
    const el = videoRef.current
    if (!el) return
    if (!el.paused) {
      el.pause()
      return
    }
    let t = el.currentTime
    if (!Number.isFinite(t) || t >= range.endS - 0.05 || t < range.startS) {
      t = range.startS
      el.currentTime = t
    }
    setPlayheadS(Math.min(Math.max(t, range.startS), range.endS))
    void el.play()
  }

  function seekVideoTo(t: number) {
    const el = videoRef.current
    if (!el) return
    el.pause()
    el.currentTime = t
  }

  function setStart(next: number) {
    const start = Math.min(Math.max(next, 0), endS - 0.2)
    const clamped = clampTrimRange(start, endS, durationS)
    setStartS(clamped.startS)
    setEndS(clamped.endS)
    setPlayheadS(clamped.startS)
    seekVideoTo(clamped.startS)
  }

  function setEnd(next: number) {
    const end = Math.max(Math.min(next, durationS), startS + 0.2)
    const clamped = clampTrimRange(startS, end, durationS)
    setStartS(clamped.startS)
    setEndS(clamped.endS)
    setPlayheadS(clamped.endS)
    seekVideoTo(clamped.endS)
  }

  function setPlayhead(next: number) {
    const t = Math.min(Math.max(next, range.startS), range.endS)
    setPlayheadS(t)
    seekVideoTo(t)
  }

  return (
    <div className="mt-4 rounded-2xl border border-lime/25 bg-lime/[0.04] p-3.5">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-lime">
        {required ? 'Trim this clip' : 'Trim (optional)'}
      </p>
      <p className="mt-1.5 text-sm font-semibold leading-relaxed text-chalk">{MSG_TRIM_LOSSLESS}</p>
      <p className="mt-1 text-xs leading-relaxed text-chalk/55">{MSG_TRIM_KEYFRAME}</p>
      {applied && applied.endS > applied.startS ? (
        <p className="mt-1.5 text-xs font-medium leading-snug text-ok">
          Applied {formatSeconds(applied.startS)}–{formatSeconds(applied.endS)}. Analyze uploads that
          cut. Adjust the handles and Apply again to change it.
        </p>
      ) : null}

      {previewUrl ? (
        <div className="relative mt-3 overflow-hidden rounded-xl border border-white/10 bg-night">
          <video
            id={videoId}
            ref={videoRef}
            className="aspect-video w-full object-contain"
            src={previewUrl}
            playsInline
            muted
            preload="metadata"
            onClick={togglePlay}
          />

          <button
            type="button"
            aria-label={playing ? 'Pause' : 'Play'}
            className="pointer-events-auto absolute left-1/2 top-1/2 z-10 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-night/40 text-chalk backdrop-blur-sm transition hover:bg-night/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime"
            onClick={togglePlay}
          >
            {playing ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                <rect x="6" y="5" width="4" height="14" rx="1" />
                <rect x="14" y="5" width="4" height="14" rx="1" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <div className="pointer-events-auto absolute bottom-2 left-2 right-2 z-20 rounded-xl border border-white/10 bg-night/70 p-1.5 backdrop-blur-md">
            <VideoTrimTimeline
              durationS={durationS}
              startS={range.startS}
              endS={range.endS}
              playheadS={playheadS}
              disabled={busy}
              filmstripFrames={filmstripFrames}
              onStartChange={setStart}
              onEndChange={setEnd}
              onPlayheadChange={setPlayhead}
              aria-controls={videoId}
            />
            <div className="mt-1 flex justify-between text-[9px] font-bold uppercase tracking-[0.12em] text-chalk/60">
              <span>
                Start <span className="font-mono text-chalk/80">{formatSeconds(range.startS)}</span>
              </span>
              <span>
                Playhead{' '}
                <span className="font-mono text-chalk/80">{formatSeconds(playheadS)}</span>
              </span>
              <span>
                End <span className="font-mono text-chalk/80">{formatSeconds(range.endS)}</span>
              </span>
            </div>
          </div>

          {busy ? (
            <div className="absolute inset-0 z-30 grid place-items-center bg-night/60 backdrop-blur-sm">
              <p className="text-sm font-semibold text-chalk">Trimming…</p>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-chalk/70">
        <span>Window {formatSeconds(range.windowS)} (max {MAX_DURATION_S} s)</span>
        <span className={fits ? 'text-ok' : 'text-bad'}>
          ~{formatBytes(estimated)} of {formatBytes(MAX_BYTES)}
        </span>
      </div>

      {!fits ? (
        <p className="mt-2 text-xs font-medium leading-relaxed text-bad">{MSG_TRIM_4K}</p>
      ) : null}

      {error ? (
        <p className="mt-2 rounded-xl border border-bad/25 bg-bad/10 px-3 py-2 text-xs font-medium leading-relaxed text-bad">
          {error}
        </p>
      ) : null}

      <Button
        type="button"
        size="sm"
        disabled={!canApply}
        className="mt-3 w-full"
        onClick={() => onApply(range.startS, range.endS)}
      >
        {busy ? 'Trimming…' : 'Apply trim'}
      </Button>
    </div>
  )
}

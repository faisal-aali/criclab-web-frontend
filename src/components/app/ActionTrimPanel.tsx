import { useEffect, useMemo, useRef, useState } from 'react'
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

function formatSeconds(value: number): string {
  if (!(value >= 0) || !Number.isFinite(value)) return '0.0 s'
  return `${value.toFixed(1)} s`
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
  const defaults = useMemo(
    () => clampTrimRange(0, Math.min(MAX_DURATION_S, durationS), durationS),
    [durationS],
  )
  const [startS, setStartS] = useState(defaults.startS)
  const [endS, setEndS] = useState(defaults.endS)

  useEffect(() => {
    setStartS(defaults.startS)
    setEndS(defaults.endS)
  }, [defaults.startS, defaults.endS, sourceKey])

  const range = clampTrimRange(startS, endS, durationS)
  const estimated = estimateTrimBytes(sourceBytes, durationS, range.windowS)
  const fits = trimFitsSize(sourceBytes, durationS, range.windowS)
  const canApply = !busy && range.windowS > 0 && fits

  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    if (Math.abs(el.currentTime - range.startS) > 0.12) {
      el.currentTime = range.startS
    }
  }, [range.startS, previewUrl])

  function moveStart(next: number) {
    const clamped = clampTrimRange(next, Math.max(next + 0.2, endS), durationS)
    setStartS(clamped.startS)
    setEndS(clamped.endS)
  }

  function moveEnd(next: number) {
    const clamped = clampTrimRange(startS, next, durationS)
    setStartS(clamped.startS)
    setEndS(clamped.endS)
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
        <div className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-night">
          <video
            ref={videoRef}
            className="aspect-video w-full object-contain"
            src={previewUrl}
            controls
            playsInline
            muted
          />
        </div>
      ) : null}

      <div className="mt-3 grid gap-3">
        <label className="block">
          <span className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.14em] text-chalk/50">
            Start
            <span className="font-mono text-chalk/70">{formatSeconds(range.startS)}</span>
          </span>
          <input
            type="range"
            min={0}
            max={Math.max(0, durationS)}
            step={0.05}
            value={range.startS}
            disabled={busy}
            className="mt-1.5 w-full accent-lime"
            aria-valuetext={formatSeconds(range.startS)}
            onChange={(e) => moveStart(Number(e.target.value))}
          />
        </label>
        <label className="block">
          <span className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.14em] text-chalk/50">
            End
            <span className="font-mono text-chalk/70">{formatSeconds(range.endS)}</span>
          </span>
          <input
            type="range"
            min={0}
            max={Math.max(0, durationS)}
            step={0.05}
            value={range.endS}
            disabled={busy}
            className="mt-1.5 w-full accent-lime"
            aria-valuetext={formatSeconds(range.endS)}
            onChange={(e) => moveEnd(Number(e.target.value))}
          />
        </label>
      </div>

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

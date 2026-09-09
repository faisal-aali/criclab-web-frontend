import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'

type Handle = 'start' | 'end' | 'playhead'

function formatSeconds(value: number): string {
  if (!(value >= 0) || !Number.isFinite(value)) return '0.0 s'
  return `${value.toFixed(1)} s`
}

export function VideoTrimTimeline({
  durationS,
  startS,
  endS,
  playheadS,
  disabled,
  filmstripFrames,
  onStartChange,
  onEndChange,
  onPlayheadChange,
  'aria-controls': ariaControls,
  className = '',
}: {
  durationS: number
  startS: number
  endS: number
  playheadS: number
  disabled?: boolean
  filmstripFrames?: string[]
  onStartChange: (startS: number) => void
  onEndChange: (endS: number) => void
  onPlayheadChange: (playheadS: number) => void
  'aria-controls'?: string
  className?: string
}) {
  const trackRef = useRef<HTMLDivElement | null>(null)
  const [dragging, setDragging] = useState<Handle | null>(null)

  function timeFromEvent(e: PointerEvent<HTMLDivElement>): number {
    const track = trackRef.current
    if (!track) return 0
    const rect = track.getBoundingClientRect()
    const x = e.clientX - rect.left
    const pct = Math.min(Math.max(x / rect.width, 0), 1)
    return pct * durationS
  }

  function handlePointerDown(handle: Handle, e: PointerEvent<HTMLDivElement>) {
    if (disabled) return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragging(handle)
    const t = timeFromEvent(e)
    if (handle === 'start') onStartChange(t)
    if (handle === 'end') onEndChange(t)
    if (handle === 'playhead') onPlayheadChange(t)
  }

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!dragging) return
    e.preventDefault()
    const t = timeFromEvent(e)
    if (dragging === 'start') onStartChange(t)
    if (dragging === 'end') onEndChange(t)
    if (dragging === 'playhead') onPlayheadChange(t)
  }

  function handlePointerUp(e: PointerEvent<HTMLDivElement>) {
    if (!dragging) return
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
    setDragging(null)
  }

  function nudge(handle: Handle, delta: number) {
    if (handle === 'start') onStartChange(startS + delta)
    if (handle === 'end') onEndChange(endS + delta)
    if (handle === 'playhead') onPlayheadChange(playheadS + delta)
  }

  function onKeyDown(handle: Handle, e: KeyboardEvent<HTMLDivElement>) {
    if (disabled) return
    const step = e.shiftKey ? 0.5 : 0.05
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      nudge(handle, -step)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      nudge(handle, step)
    } else if (e.key === 'Home') {
      e.preventDefault()
      if (handle === 'start') onStartChange(0)
      if (handle === 'end') onEndChange(startS + 0.2)
      if (handle === 'playhead') onPlayheadChange(startS)
    } else if (e.key === 'End') {
      e.preventDefault()
      if (handle === 'start') onStartChange(endS - 0.2)
      if (handle === 'end') onEndChange(durationS)
      if (handle === 'playhead') onPlayheadChange(endS)
    }
  }

  const duration = Math.max(0, durationS)
  const startPct = duration > 0 ? (startS / duration) * 100 : 0
  const endPct = duration > 0 ? (endS / duration) * 100 : 0
  const playheadPct = duration > 0 ? (playheadS / duration) * 100 : 0

  return (
    <div className={`relative w-full select-none touch-none ${className}`}>
      <div
        ref={trackRef}
        className="relative h-12 w-full overflow-hidden rounded-lg bg-night"
      >
        <div className="absolute inset-0 z-0 flex">
          {filmstripFrames && filmstripFrames.length > 0 ? (
            filmstripFrames.map((url, i) => (
              <div
                key={i}
                className="flex-1 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: url ? `url("${url}")` : undefined }}
                aria-hidden
              />
            ))
          ) : (
            <div className="h-full w-full bg-white/5" aria-hidden />
          )}
        </div>

        <div
          className="absolute inset-y-0 z-10 bg-night/50"
          style={{ left: 0, width: `${startPct}%` }}
          aria-hidden
        />
        <div
          className="absolute inset-y-0 z-10 bg-lime/30 ring-2 ring-lime ring-inset"
          style={{ left: `${startPct}%`, width: `${endPct - startPct}%` }}
          aria-hidden
        />
        <div
          className="absolute inset-y-0 z-10 bg-night/50"
          style={{ left: `${endPct}%`, width: `${100 - endPct}%` }}
          aria-hidden
        />

        <div
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-label="Trim start"
          aria-orientation="horizontal"
          aria-valuemin={0}
          aria-valuemax={durationS}
          aria-valuenow={startS}
          aria-valuetext={formatSeconds(startS)}
          aria-controls={ariaControls}
          aria-disabled={disabled || undefined}
          className={`absolute inset-y-0 z-30 flex w-4 -translate-x-1/2 cursor-ew-resize items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-lime focus-visible:ring-inset drop-shadow-[0_0_4px_rgba(182,242,74,0.6)] ${disabled ? 'pointer-events-none opacity-50' : ''}`}
          style={{ left: `${startPct}%` }}
          onPointerDown={(e) => handlePointerDown('start', e)}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onKeyDown={(e) => onKeyDown('start', e)}
        >
          <div className="h-full w-1 bg-lime" />
          <svg viewBox="0 0 24 24" className="absolute h-4 w-4 text-lime" aria-hidden>
            <path
              d="M15 6L9 12l6 6"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-label="Trim end"
          aria-orientation="horizontal"
          aria-valuemin={0}
          aria-valuemax={durationS}
          aria-valuenow={endS}
          aria-valuetext={formatSeconds(endS)}
          aria-controls={ariaControls}
          aria-disabled={disabled || undefined}
          className={`absolute inset-y-0 z-30 flex w-4 -translate-x-1/2 cursor-ew-resize items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-lime focus-visible:ring-inset drop-shadow-[0_0_4px_rgba(182,242,74,0.6)] ${disabled ? 'pointer-events-none opacity-50' : ''}`}
          style={{ left: `${endPct}%` }}
          onPointerDown={(e) => handlePointerDown('end', e)}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onKeyDown={(e) => onKeyDown('end', e)}
        >
          <div className="h-full w-1 bg-lime" />
          <svg viewBox="0 0 24 24" className="absolute h-4 w-4 text-lime" aria-hidden>
            <path
              d="M9 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-label="Playhead"
          aria-orientation="horizontal"
          aria-valuemin={startS}
          aria-valuemax={endS}
          aria-valuenow={playheadS}
          aria-valuetext={formatSeconds(playheadS)}
          aria-controls={ariaControls}
          aria-disabled={disabled || undefined}
          className={`absolute inset-y-0 z-40 flex w-6 -translate-x-1/2 cursor-grab items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-lime focus-visible:ring-inset drop-shadow-[0_0_4px_rgba(255,255,255,0.5)] ${dragging === 'playhead' ? 'cursor-grabbing' : ''} ${disabled ? 'pointer-events-none opacity-50' : ''}`}
          style={{ left: `${playheadPct}%` }}
          onPointerDown={(e) => handlePointerDown('playhead', e)}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onKeyDown={(e) => onKeyDown('playhead', e)}
        >
          <div className="h-full w-1 bg-chalk" />
          <div className="absolute top-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-chalk" />
        </div>
      </div>
    </div>
  )
}

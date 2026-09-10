/**
 * CricLab visual language.
 *
 * These are drawn rather than photographed on purpose: they scale to any
 * viewport, stay crisp on retina, cost nothing to load, and — unlike stock
 * photography — they can carry real cricket geometry (a seam, a delivery
 * stride, a trajectory arc) that matches what the product actually measures.
 *
 * Where a real photograph belongs, `PhotoFrame` provides the slot: drop a file
 * into /public and pass its src. It ships with a drawn fallback so no screen
 * ever renders an empty box.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react'

/** Floodlight bloom + drifting particles. Sits behind dark hero sections. */
export function StadiumAtmosphere({ className = '' }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <div className="absolute -left-24 -top-32 h-[34rem] w-[34rem] rounded-full bg-lime/10 blur-[120px]" />
      <div className="absolute -right-32 top-0 h-[30rem] w-[30rem] rounded-full bg-pitch-soft/40 blur-[120px]" />
      <div className="absolute bottom-[-18rem] left-1/2 h-[36rem] w-[52rem] -translate-x-1/2 rounded-full bg-pitch/40 blur-[140px]" />
      <div className="absolute inset-0 bg-grid-tech opacity-[0.55]" />
      {/* Floodlight shafts */}
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="shaft" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#b6f24a" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#b6f24a" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points="8,0 22,0 40,100 -6,100" fill="url(#shaft)" />
        <polygon points="72,0 86,0 108,100 60,100" fill="url(#shaft)" />
      </svg>
    </div>
  )
}

/** Cricket ball with seam. Rotates slowly; used as an accent mark. */
export function SeamBall({
  size = 120,
  className = '',
  spin = true,
}: {
  size?: number
  className?: string
  spin?: boolean
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={`${spin ? 'animate-seam-spin' : ''} ${className}`}
      aria-hidden
    >
      <defs>
        <radialGradient id="ballBody" cx="35%" cy="30%">
          <stop offset="0%" stopColor="#e0603f" />
          <stop offset="55%" stopColor="#a51f1f" />
          <stop offset="100%" stopColor="#5c0f0f" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="52" fill="url(#ballBody)" />
      <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="1.5" />
      {/* Seam: two arcs plus the stitch ticks */}
      <path d="M28 34 Q60 60 28 86" fill="none" stroke="#f6f2e6" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
      <path d="M92 34 Q60 60 92 86" fill="none" stroke="#f6f2e6" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
      {Array.from({ length: 7 }).map((_, i) => (
        <line
          key={i}
          x1={34 + i * 0.4}
          y1={40 + i * 6.6}
          x2={46 + i * 0.4}
          y2={40 + i * 6.6}
          stroke="#f6f2e6"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.75"
        />
      ))}
    </svg>
  )
}

/**
 * Ball-flight arc over a pitch. The path traces itself when scrolled into view
 * (see `.trace-path` in index.css), which mirrors what the product does —
 * follow a delivery from hand to pitch.
 */
export function TrajectoryArc({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 520 260" className={`h-full w-full ${className}`} aria-hidden>
      <defs>
        <linearGradient id="arcLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#b6f24a" />
          <stop offset="65%" stopColor="#8fd12b" />
          <stop offset="100%" stopColor="#d9743c" />
        </linearGradient>
        <linearGradient id="pitchFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#12513c" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#12513c" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Pitch in perspective */}
      <polygon points="150,250 370,250 300,120 220,120" fill="url(#pitchFade)" />
      <line x1="185" y1="185" x2="335" y2="185" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
      <line x1="215" y1="128" x2="305" y2="128" stroke="rgba(255,255,255,0.14)" strokeWidth="1.5" />

      {/* Stumps at the far end */}
      {[248, 258, 268].map((x) => (
        <line key={x} x1={x} y1="98" x2={x} y2="126" stroke="rgba(246,249,247,0.75)" strokeWidth="2.5" strokeLinecap="round" />
      ))}

      {/* Delivery arc + bounce */}
      <path
        className="trace-path"
        d="M60 96 C 140 34, 210 128, 262 176 C 292 204, 330 190, 372 150"
        fill="none"
        stroke="url(#arcLine)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Sample points, as the tracker records them */}
      {[
        [60, 96],
        [118, 68],
        [176, 108],
        [222, 148],
        [262, 176],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="4" fill="#b6f24a" opacity={0.55 + i * 0.09} />
      ))}
      <circle cx="262" cy="176" r="8" fill="none" stroke="#d9743c" strokeWidth="2" />
      <text x="272" y="200" fill="rgba(246,249,247,0.55)" fontSize="11" fontFamily="ui-sans-serif">
        pitch point
      </text>
      <text x="34" y="82" fill="rgba(246,249,247,0.55)" fontSize="11" fontFamily="ui-sans-serif">
        release
      </text>
    </svg>
  )
}

/**
 * Bowler in the delivery stride, drawn as a keypoint skeleton — the same
 * landmarks the analysis reports on, so the illustration is honest about what
 * the product looks at.
 */
export function BowlerSkeleton({ className = '' }: { className?: string }) {
  const joints: [number, number][] = [
    [96, 26], // head
    [92, 58], // shoulder (front)
    [120, 52], // shoulder (back)
    [66, 40], // bowling elbow
    [58, 14], // bowling wrist (high)
    [140, 78], // lead elbow
    [150, 108], // lead wrist
    [96, 104], // hip centre
    [78, 106], // hip front
    [114, 102], // hip back
    [58, 152], // front knee
    [40, 196], // front ankle
    [128, 150], // back knee
    [156, 192], // back ankle
  ]
  const bones: [number, number][] = [
    [0, 1],
    [1, 2],
    [1, 3],
    [3, 4],
    [2, 5],
    [5, 6],
    [1, 8],
    [2, 9],
    [8, 9],
    [8, 10],
    [10, 11],
    [9, 12],
    [12, 13],
  ]
  return (
    <svg viewBox="0 0 200 220" className={`h-full w-full ${className}`} aria-hidden>
      <defs>
        <linearGradient id="boneGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#b6f24a" />
          <stop offset="100%" stopColor="#2f9e6b" />
        </linearGradient>
      </defs>
      {bones.map(([a, b], i) => (
        <line
          key={i}
          x1={joints[a][0]}
          y1={joints[a][1]}
          x2={joints[b][0]}
          y2={joints[b][1]}
          stroke="url(#boneGrad)"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.9"
        />
      ))}
      {joints.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={i === 4 ? 5.5 : 3.6} fill={i === 4 ? '#d9743c' : '#f6f9f7'} />
      ))}
      {/* Ground line */}
      <line x1="16" y1="206" x2="184" y2="206" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
    </svg>
  )
}

/** Abstract data readout — bars that animate to their value on reveal. */
export function MetricBars({
  bars = [72, 88, 54, 93, 66, 79],
  className = '',
}: {
  bars?: number[]
  className?: string
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setOn(true)
      return
    }
    const io = new IntersectionObserver(
      (e) => e[0]?.isIntersecting && (setOn(true), io.disconnect()),
      // See Reveal in ui.tsx: a fractional threshold is unreachable for tall
      // elements on a short viewport.
      { threshold: 0, rootMargin: '0px 0px -40px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div ref={ref} className={`flex h-full items-end gap-2 ${className}`} aria-hidden>
      {bars.map((b, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-md bg-gradient-to-t from-pitch-soft to-lime transition-all duration-[900ms] ease-out"
          style={{ height: on ? `${b}%` : '4%', transitionDelay: `${i * 90}ms` }}
        />
      ))}
    </div>
  )
}

/**
 * Photograph slot with a drawn fallback.
 * `src` is optional so pages render fully before any photography exists.
 */
export function PhotoFrame({
  src,
  alt = '',
  className = '',
  overlay = true,
  fallback,
  position = 'relative',
  children,
}: {
  src?: string
  alt?: string
  className?: string
  overlay?: boolean
  fallback?: ReactNode
  /**
   * Positioning is a prop, not something to override through `className`.
   * Tailwind resolves competing position utilities by stylesheet order, not by
   * the order they appear in the attribute, so passing `absolute` alongside the
   * component's own `relative` silently loses — the frame stays in flow and
   * pushes the section's content down the page.
   */
  position?: 'relative' | 'absolute'
  children?: ReactNode
}) {
  const [failed, setFailed] = useState(false)
  const showPhoto = src && !failed
  return (
    <div className={`${position} overflow-hidden rounded-[var(--radius-card)] ${className}`}>
      {showPhoto ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-pitch-gradient">
          <div className="absolute inset-0 bg-grid-tech opacity-60" />
          {fallback ?? (
            <div className="absolute inset-0 grid place-items-center p-8 opacity-70">
              <BowlerSkeleton />
            </div>
          )}
        </div>
      )}
      {overlay ? (
        <div className="absolute inset-0 bg-gradient-to-t from-night/85 via-night/25 to-transparent" />
      ) : null}
      {children ? <div className="absolute inset-0">{children}</div> : null}
    </div>
  )
}

/** Decorative pitch-perspective floor used to close dark sections. */
export function PitchFloor({ className = '' }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-x-0 bottom-0 h-56 ${className}`} aria-hidden>
      <svg viewBox="0 0 1200 220" preserveAspectRatio="none" className="h-full w-full">
        <defs>
          <linearGradient id="floorFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0b3d2e" stopOpacity="0" />
            <stop offset="100%" stopColor="#0b3d2e" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        <polygon points="420,0 780,0 1200,220 0,220" fill="url(#floorFade)" />
        {Array.from({ length: 7 }).map((_, i) => (
          <line
            key={i}
            x1={420 + i * 60}
            y1="0"
            x2={i * 200 - 100}
            y2="220"
            stroke="rgba(182,242,74,0.10)"
            strokeWidth="1"
          />
        ))}
      </svg>
    </div>
  )
}

/** A bat, as a flat glyph — the fallback for the 3D model. */
export function BatGlyph({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 260" className={className} aria-hidden>
      <defs>
        <linearGradient id="batWillow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#d9b877" />
          <stop offset="55%" stopColor="#e9d09a" />
          <stop offset="100%" stopColor="#cfa964" />
        </linearGradient>
      </defs>
      <g transform="rotate(-14 60 130)">
        <rect x="52" y="8" width="16" height="70" rx="7" fill="#182620" />
        {[24, 40, 56].map((y) => (
          <rect key={y} x="50" y={y} width="20" height="3" rx="1.5" fill="#b6f24a" />
        ))}
        <path d="M40 78 L80 78 L84 96 L84 232 Q84 252 60 252 Q36 252 36 232 L36 96 Z" fill="url(#batWillow)" />
        <path d="M60 96 L60 236" stroke="rgba(0,0,0,0.12)" strokeWidth="1.5" />
        <rect x="44" y="120" width="32" height="26" rx="4" fill="#b6f24a" />
        <rect x="47" y="131" width="26" height="4" rx="2" fill="#05090a" />
      </g>
    </svg>
  )
}

/**
 * The CricLab mark and wordmark.
 *
 * The identity is unchanged — a dark ball on a lime plate, seam arcs either
 * side — but drawn as an inline SVG rather than a rasterised PNG, so it is
 * crisp at every size, follows `currentColor` for the wordmark, and carries
 * the small refinements (stitch ticks on the seam, a highlight on the
 * leather, a diagonal lime gradient on the plate) that the launcher icons
 * and favicon share. The PNG icons in /public are generated from the same
 * geometry by scripts/draw-icon.py.
 */
import { useId } from 'react'

const SEAM_L = 'M22 19.5 Q35 32 22 44.5'
const SEAM_R = 'M42 19.5 Q29 32 42 44.5'

/** Stitch ticks: short lines perpendicular to each seam arc. */
function ticks(mirror: boolean) {
  const out: [number, number, number, number][] = []
  const ts = [0.2, 0.4, 0.6, 0.8]
  for (const t of ts) {
    // Point + tangent on the quadratic Bézier (P0=(22,19.5) P1=(35,32) P2=(22,44.5)).
    const x = (1 - t) * (1 - t) * 22 + 2 * (1 - t) * t * 35 + t * t * 22
    const y = (1 - t) * (1 - t) * 19.5 + 2 * (1 - t) * t * 32 + t * t * 44.5
    const dx = 2 * (1 - t) * (35 - 22) + 2 * t * (22 - 35)
    const dy = 2 * (1 - t) * (32 - 19.5) + 2 * t * (44.5 - 32)
    const len = Math.hypot(dx, dy) || 1
    const nx = -dy / len
    const ny = dx / len
    const s = 1.9
    const px = mirror ? 64 - x : x
    const qx = mirror ? -nx : nx
    out.push([px - qx * s, y - ny * s, px + qx * s, y + ny * s])
  }
  return out
}

const TICKS_L = ticks(false)
const TICKS_R = ticks(true)

export function CricLabLogo({
  size = 36,
  className = '',
  plate = true,
  title,
}: {
  size?: number
  className?: string
  /** Draw the rounded lime plate behind the ball. */
  plate?: boolean
  title?: string
}) {
  const id = useId()
  const grad = `criclab-plate-${id}`
  const hi = `criclab-hi-${id}`
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <defs>
        <linearGradient id={grad} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#cfff6a" />
          <stop offset="55%" stopColor="#b6f24a" />
          <stop offset="100%" stopColor="#8fd12b" />
        </linearGradient>
        <radialGradient id={hi} cx="0.35" cy="0.3" r="0.6">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.16" />
          <stop offset="70%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      {plate ? <rect width="64" height="64" rx="15" fill={`url(#${grad})`} /> : null}
      <circle cx="32" cy="32" r="19" fill="#05090a" />
      <circle cx="32" cy="32" r="19" fill={`url(#${hi})`} />
      <path d={SEAM_L} fill="none" stroke="#b6f24a" strokeWidth="2.4" strokeLinecap="round" />
      <path d={SEAM_R} fill="none" stroke="#b6f24a" strokeWidth="2.4" strokeLinecap="round" />
      {[...TICKS_L, ...TICKS_R].map(([x1, y1, x2, y2], i) => (
        <line
          key={i}
          x1={x1.toFixed(2)}
          y1={y1.toFixed(2)}
          x2={x2.toFixed(2)}
          y2={y2.toFixed(2)}
          stroke="#b6f24a"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      ))}
    </svg>
  )
}

export function CricLabWordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`font-display text-lg font-extrabold tracking-tight ${className}`}>
      Cric<span className="text-lime">Lab</span>
    </span>
  )
}

/** Mark + wordmark, as used in every header. */
export function CricLabMark({ compact = false, size = 36 }: { compact?: boolean; size?: number }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <CricLabLogo
        size={size}
        className="rounded-[10px] shadow-[0_8px_22px_-8px_rgba(182,242,74,0.9)]"
        title="CricLab"
      />
      {!compact && <CricLabWordmark />}
    </span>
  )
}

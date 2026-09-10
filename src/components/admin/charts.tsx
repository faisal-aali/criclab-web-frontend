/**
 * Small, dependency-free charts for the admin dashboard.
 *
 * No charting library — the dashboard needs a line, a donut and a bar list,
 * each simple enough that hand-drawn SVG is less weight than a library
 * pulled in for three shapes. Colours follow the same brand tokens as the
 * rest of the workspace, not a separate "chart palette".
 */
import type { TrendPoint } from '../../api/admin'

const COLORS = ['#b6f24a', '#8fd12b', '#d9743c', '#4ade80', '#fbbf24', '#60a5fa']

export function TrendLine({ points, height = 120 }: { points: TrendPoint[]; height?: number }) {
  if (points.length === 0) {
    return (
      <div className="grid h-[120px] place-items-center text-xs text-chalk/35">
        Nothing in this range yet.
      </div>
    )
  }
  const width = 560
  const pad = 8
  const max = Math.max(1, ...points.map((p) => p.count))
  const step = points.length > 1 ? (width - pad * 2) / (points.length - 1) : 0
  const coords = points.map((p, i) => {
    const x = pad + i * step
    const y = pad + (1 - p.count / max) * (height - pad * 2)
    return [x, y] as const
  })
  const line = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const area = `${line} L${coords[coords.length - 1][0].toFixed(1)},${height - pad} L${coords[0][0].toFixed(1)},${height - pad} Z`

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-[120px] w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="admin-trend-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b6f24a" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#b6f24a" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#admin-trend-fill)" />
      <path d={line} fill="none" stroke="#b6f24a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {coords.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.5" fill="#b6f24a" />
      ))}
    </svg>
  )
}

export function Donut({
  segments,
  size = 128,
}: {
  segments: { label: string; value: number }[]
  size?: number
}) {
  const total = segments.reduce((s, x) => s + x.value, 0)
  const r = 42
  const circumference = 2 * Math.PI * r
  let offset = 0

  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 100 100" width={size} height={size} className="-rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="14" />
        {total > 0 &&
          segments.map((seg, i) => {
            const fraction = seg.value / total
            const dash = fraction * circumference
            const el = (
              <circle
                key={seg.label}
                cx="50"
                cy="50"
                r={r}
                fill="none"
                stroke={COLORS[i % COLORS.length]}
                strokeWidth="14"
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              />
            )
            offset += dash
            return el
          })}
      </svg>
      <ul className="flex flex-col gap-1.5">
        {segments.map((seg, i) => (
          <li key={seg.label} className="flex items-center gap-2 text-xs text-chalk/70">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
            <span className="text-chalk/50">{seg.label}</span>
            <span className="font-semibold text-chalk">{seg.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function BarList({ rows }: { rows: { label: string; value: number; tone?: string }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.value))
  return (
    <div className="flex flex-col gap-2.5">
      {rows.map((row) => (
        <div key={row.label} className="flex items-center gap-3">
          <span className="w-28 shrink-0 truncate text-xs text-chalk/55">{row.label}</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.max(3, (row.value / max) * 100)}%`,
                background: row.tone ?? '#b6f24a',
              }}
            />
          </div>
          <span className="w-8 shrink-0 text-right text-xs font-semibold text-chalk">{row.value}</span>
        </div>
      ))}
    </div>
  )
}

import { metricReady, type MetricValue } from '../api/client'

function confColor(conf: number, status?: string) {
  if (status === 'unavailable' || conf <= 0) return { dot: 'bg-pitch/30', text: 'text-pitch/45', label: 'N/A' }
  if (conf >= 0.6) return { dot: 'bg-emerald-500', text: 'text-emerald-700', label: 'High' }
  if (conf >= 0.35) return { dot: 'bg-amber-500', text: 'text-amber-700', label: 'Med' }
  return { dot: 'bg-rose-500', text: 'text-rose-700', label: 'Low' }
}

export function MetricCard({
  label,
  metric,
  icon,
}: {
  label: string
  metric?: MetricValue
  icon?: React.ReactNode
}) {
  const hasValue = metricReady(metric)
  const conf = metric?.confidence ?? 0
  const status = metric?.status
  const c = confColor(conf, hasValue ? status : 'unavailable')

  const value = hasValue
    ? `${typeof metric!.value === 'number' ? (metric!.value as number).toFixed(1) : metric!.value}`
    : '—'
  const unit = hasValue ? metric?.unit : ''

  return (
    <div className="group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-pitch/10 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-pitch/25 hover:shadow-md">
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-seam/70 via-seam/20 to-transparent opacity-0 transition group-hover:opacity-100" />
      <div className="flex min-w-0 items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5 text-[11px] font-semibold uppercase leading-tight tracking-[0.12em] text-pitch/55">
          {icon}
          <span className="min-w-0 break-words">{label}</span>
        </div>
        <span className={`flex shrink-0 items-center gap-1 text-[10px] font-bold ${c.text}`}>
          {metric?.estimated && hasValue ? (
            <span className="rounded bg-amber-50 px-1 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-800">
              Est.
            </span>
          ) : null}
          <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
          {c.label}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap items-baseline gap-x-1">
        <span className={`font-display text-[1.6rem] font-extrabold leading-none ${hasValue ? 'text-pitch' : 'text-pitch/30'}`}>
          {value}
        </span>
        {unit ? <span className="text-xs font-semibold text-pitch/45">{unit}</span> : null}
      </div>

      {hasValue ? (
        <div className="mt-3 flex items-center gap-2">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-pitch/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-seam to-ball transition-all"
              style={{ width: `${Math.round(conf * 100)}%` }}
            />
          </div>
          <span className="shrink-0 text-[10px] font-semibold text-pitch/50">{Math.round(conf * 100)}%</span>
        </div>
      ) : null}

      {metric?.note ? (
        <p className={`mt-2 break-words text-[11px] leading-snug ${hasValue ? 'text-pitch/45' : 'text-amber-800/80'}`}>
          {metric.note}
        </p>
      ) : null}
    </div>
  )
}

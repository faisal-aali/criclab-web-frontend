import { metricReady, type MetricValue } from '../api/client'
import { Card } from './site/ui'

/**
 * A single measured number on the dark workspace.
 *
 * The card never dresses up a value it does not have: when the metric is not
 * ready it shows an em dash in a muted tone, drops the confidence bar entirely,
 * and keeps the note that explains why.
 */
function confColor(conf: number, status?: string) {
  if (status === 'unavailable' || conf <= 0)
    return { dot: 'bg-white/25', text: 'text-chalk/35', bar: 'bg-white/15', label: 'N/A' }
  if (conf >= 0.6)
    return { dot: 'bg-ok', text: 'text-ok', bar: 'bg-gradient-to-r from-ok/50 to-ok', label: 'High' }
  if (conf >= 0.35)
    return { dot: 'bg-warn', text: 'text-warn', bar: 'bg-gradient-to-r from-warn/50 to-warn', label: 'Med' }
  return { dot: 'bg-bad', text: 'text-bad', bar: 'bg-gradient-to-r from-bad/50 to-bad', label: 'Low' }
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
    <Card interactive={false} className="flex min-w-0 flex-col p-4 transition">
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5 text-[10px] font-bold uppercase leading-tight tracking-[0.14em] text-chalk/45">
          {icon}
          <span className="min-w-0 break-words">{label}</span>
        </div>
        <span className={`flex shrink-0 items-center gap-1 text-[10px] font-bold ${c.text}`}>
          {metric?.estimated && hasValue ? (
            <span className="rounded bg-warn/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-warn">
              Est.
            </span>
          ) : null}
          <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
          {c.label}
        </span>
      </div>

      <div className="mt-2.5 flex flex-wrap items-baseline gap-x-1.5">
        <span
          className={`font-display text-[1.7rem] font-extrabold leading-none ${
            hasValue ? 'text-chalk' : 'text-chalk/25'
          }`}
        >
          {value}
        </span>
        {unit ? <span className="text-xs font-bold text-seam">{unit}</span> : null}
      </div>

      {hasValue ? (
        <div className="mt-3 flex items-center gap-2">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full transition-all ${c.bar}`}
              style={{ width: `${Math.round(conf * 100)}%` }}
            />
          </div>
          <span className="shrink-0 text-[10px] font-bold tabular-nums text-chalk/45">
            {Math.round(conf * 100)}%
          </span>
        </div>
      ) : null}

      {metric?.note ? (
        <p
          className={`mt-2.5 break-words text-[11px] leading-snug ${
            hasValue ? 'text-chalk/45' : 'text-warn/80'
          }`}
        >
          {metric.note}
        </p>
      ) : null}
    </Card>
  )
}

import type { Metrics } from '../api/client'

const LEGALITY_LABEL: Record<string, string> = {
  within_limit: 'Within the 15° limit',
  borderline: 'Borderline — re-film square-on',
  above_limit_screening: 'Above 15° on this view (screening only)',
  flexing: 'Elbow flexes into release — no extension',
}

function legalityTone(verdict?: string | null) {
  if (verdict === 'within_limit') return 'border-emerald-200 bg-emerald-50 text-emerald-900'
  if (verdict === 'borderline' || verdict === 'above_limit_screening')
    return 'border-amber-200 bg-amber-50 text-amber-950'
  if (verdict === 'flexing') return 'border-pitch/15 bg-mist text-pitch/80'
  return 'border-pitch/10 bg-white text-pitch/80'
}

function formatFps(n?: number | null) {
  if (n == null || Number.isNaN(n)) return '—'
  return Number.isInteger(n) ? String(n) : n.toFixed(0)
}

export function DeliveryHonesty({ metrics }: { metrics: Metrics }) {
  const pace = metrics.delivery_type
  const legality = metrics.action_legality
  const cons = metrics.speed_consistency
  const tb = metrics.timebase
  const q = metrics.quality
  const paceOk = pace?.status === 'ok' && Boolean(pace?.value)
  const legalOk = legality?.status === 'ok' && Boolean(legality?.verdict)
  const fps = tb?.fps ?? q?.capture_fps
  const slowMo = Boolean(tb?.slow_motion || q?.slow_motion)

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <article className="rounded-2xl border border-pitch/10 bg-white p-4 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-pitch/45">Capture & view</p>
        <p className="mt-2 font-display text-xl font-extrabold text-pitch">
          {formatFps(fps)} <span className="text-sm font-semibold text-pitch/50">fps</span>
        </p>
        <p className="mt-1 text-xs text-pitch/60">
          {slowMo
            ? 'Measured from the ball’s fall — the file understated the capture rate.'
            : 'Frame rate taken from the video file.'}
        </p>
        {slowMo && tb?.note ? <p className="mt-2 text-[11px] leading-snug text-pitch/55">{tb.note}</p> : null}
        {q?.camera_view ? (
          <p className="mt-2 text-[11px] capitalize text-pitch/55">
            Camera: {q.camera_view.replace('_', '-')}
            {q.speed_view_from_ball ? ' · speeds unlocked by tracked ball flight' : ''}
          </p>
        ) : null}
        {q?.camera_view_note ? <p className="mt-1 text-[11px] leading-snug text-pitch/50">{q.camera_view_note}</p> : null}
      </article>

      <article className="rounded-2xl border border-pitch/10 bg-white p-4 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-pitch/45">Pace band</p>
        <p className="mt-2 font-display text-xl font-extrabold text-pitch">{paceOk ? pace!.value : '—'}</p>
        <p className="mt-1 text-xs text-pitch/60">
          {paceOk
            ? `From ${String(pace?.basis || 'speed').replace(/_/g, ' ')}${
                pace?.speed_kmh != null ? ` · ${Math.round(pace.speed_kmh)} km/h` : ''
              }`
            : pace?.note || 'No measured ball or arm speed — a stated bowling style is not a band.'}
        </p>
        {paceOk && pace?.band_edge_caveat && pace?.note ? (
          <p className="mt-2 text-[11px] leading-snug text-amber-800">{pace.note}</p>
        ) : null}
      </article>

      <article className={`rounded-2xl border p-4 shadow-sm ${legalityTone(legalOk ? legality?.verdict : null)}`}>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-60">Throwing screen · ICC 15°</p>
        <p className="mt-2 font-display text-lg font-extrabold">
          {legalOk ? LEGALITY_LABEL[legality!.verdict!] || legality!.verdict : 'Not assessable from this camera'}
        </p>
        {legalOk && legality?.extension_deg != null ? (
          <p className="mt-1 text-xs opacity-80">
            Elbow extension {legality.extension_deg.toFixed(0)}° (limit {legality.limit_deg ?? 15}°)
          </p>
        ) : null}
        {legality?.elbow_at_release_deg != null ? (
          <p className="mt-1 text-xs opacity-80">Elbow at release {legality.elbow_at_release_deg.toFixed(0)}°</p>
        ) : null}
        {legality?.note ? <p className="mt-2 text-[11px] leading-snug opacity-75">{legality.note}</p> : null}
      </article>

      {cons?.ok === false && cons.note ? (
        <article className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-800/70">Speed consistency</p>
          <p className="mt-2 text-sm leading-relaxed">{cons.note}</p>
        </article>
      ) : cons?.ok === true && cons.note ? (
        <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-800/70">Speed consistency</p>
          <p className="mt-2 text-sm leading-relaxed">{cons.note}</p>
        </article>
      ) : (
        <article className="rounded-2xl border border-pitch/10 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-pitch/45">Speed consistency</p>
          <p className="mt-2 text-sm text-pitch/60">Needs both a tracked ball and a measured arm speed.</p>
        </article>
      )}
    </div>
  )
}

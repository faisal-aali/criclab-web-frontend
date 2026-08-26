import type { ReactNode } from 'react'
import type { Metrics } from '../api/client'
import { Card, Chip } from './site/ui'

/**
 * The "what we could actually see" panel.
 *
 * Every card here is a caveat as much as a reading, so the dark treatment keeps
 * a real verdict visually distinct from a missing one: measured values sit in
 * full chalk, absent ones stay dimmed behind an em dash, and every note the
 * analysis attached is still printed underneath.
 */

const LEGALITY_LABEL: Record<string, string> = {
  within_limit: 'Within the 15° limit',
  borderline: 'Borderline — re-film square-on',
  above_limit_screening: 'Above 15° on this view (screening only)',
  flexing: 'Elbow flexes into release — no extension',
}

function legalityTone(verdict?: string | null): { accent: string; ring: string } {
  if (verdict === 'within_limit') return { accent: 'text-ok', ring: 'ring-ok/25' }
  if (verdict === 'borderline' || verdict === 'above_limit_screening')
    return { accent: 'text-warn', ring: 'ring-warn/25' }
  if (verdict === 'flexing') return { accent: 'text-chalk', ring: 'ring-white/10' }
  return { accent: 'text-chalk/60', ring: 'ring-transparent' }
}

function formatFps(n?: number | null) {
  if (n == null || Number.isNaN(n)) return '—'
  return Number.isInteger(n) ? String(n) : n.toFixed(0)
}

function PanelLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-chalk/45">{children}</p>
  )
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
  const tone = legalityTone(legalOk ? legality?.verdict : null)

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card interactive={false} className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <PanelLabel>Capture &amp; view</PanelLabel>
          {slowMo ? <Chip tone="warn">Slow motion</Chip> : null}
        </div>
        <p className="mt-2.5 font-display text-2xl font-extrabold text-chalk">
          {formatFps(fps)} <span className="text-sm font-bold text-seam">fps</span>
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-chalk/60">
          {slowMo
            ? 'Measured from the ball’s fall — the file understated the capture rate.'
            : 'Frame rate taken from the video file.'}
        </p>
        {slowMo && tb?.note ? (
          <p className="mt-2 text-[11px] leading-snug text-chalk/45">{tb.note}</p>
        ) : null}
        {q?.camera_view ? (
          <p className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] text-chalk/55">
            <span className="font-bold uppercase tracking-[0.14em] text-chalk/35">Camera</span>
            <span className="capitalize text-chalk/70">{q.camera_view.replace('_', '-')}</span>
            {q.speed_view_from_ball ? (
              <span className="text-lime">· speeds unlocked by tracked ball flight</span>
            ) : null}
          </p>
        ) : null}
        {q?.camera_view_note ? (
          <p className="mt-1.5 text-[11px] leading-snug text-chalk/45">{q.camera_view_note}</p>
        ) : null}
      </Card>

      <Card interactive={false} className="p-5">
        <PanelLabel>Pace band</PanelLabel>
        <p
          className={`mt-2.5 font-display text-2xl font-extrabold ${
            paceOk ? 'text-chalk' : 'text-chalk/25'
          }`}
        >
          {paceOk ? pace!.value : '—'}
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-chalk/60">
          {paceOk
            ? `From ${String(pace?.basis || 'speed').replace(/_/g, ' ')}${
                pace?.speed_kmh != null ? ` · ${Math.round(pace.speed_kmh)} km/h` : ''
              }`
            : pace?.note || 'No measured ball or arm speed — a stated bowling style is not a band.'}
        </p>
        {paceOk && pace?.band_edge_caveat && pace?.note ? (
          <p className="mt-2 text-[11px] leading-snug text-warn">{pace.note}</p>
        ) : null}
      </Card>

      <Card interactive={false} className={`p-5 ring-1 ${tone.ring}`}>
        <PanelLabel>Throwing screen · ICC 15°</PanelLabel>
        <p className={`mt-2.5 font-display text-lg font-extrabold leading-snug ${tone.accent}`}>
          {legalOk ? LEGALITY_LABEL[legality!.verdict!] || legality!.verdict : 'Not assessable from this camera'}
        </p>
        {legalOk && legality?.extension_deg != null ? (
          <p className="mt-1.5 text-xs text-chalk/60">
            Elbow extension {legality.extension_deg.toFixed(0)}° (limit {legality.limit_deg ?? 15}°)
          </p>
        ) : null}
        {legality?.elbow_at_release_deg != null ? (
          <p className="mt-1 text-xs text-chalk/60">
            Elbow at release {legality.elbow_at_release_deg.toFixed(0)}°
          </p>
        ) : null}
        {legality?.note ? (
          <p className="mt-2 text-[11px] leading-snug text-chalk/45">{legality.note}</p>
        ) : null}
      </Card>

      {cons?.ok === false && cons.note ? (
        <Card interactive={false} className="p-5 ring-1 ring-warn/25">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <PanelLabel>Speed consistency</PanelLabel>
            <Chip tone="warn">Check the clip</Chip>
          </div>
          <p className="mt-2.5 text-sm leading-relaxed text-chalk/75">{cons.note}</p>
        </Card>
      ) : cons?.ok === true && cons.note ? (
        <Card interactive={false} className="p-5 ring-1 ring-ok/25">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <PanelLabel>Speed consistency</PanelLabel>
            <Chip tone="ok">Consistent</Chip>
          </div>
          <p className="mt-2.5 text-sm leading-relaxed text-chalk/75">{cons.note}</p>
        </Card>
      ) : (
        <Card interactive={false} className="p-5">
          <PanelLabel>Speed consistency</PanelLabel>
          <p className="mt-2.5 text-sm leading-relaxed text-chalk/55">
            Needs both a tracked ball and a measured arm speed.
          </p>
        </Card>
      )}
    </div>
  )
}

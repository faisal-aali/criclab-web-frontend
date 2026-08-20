import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { assetUrl, getDelivery, metricReady, type Delivery, type MetricValue, type Scores } from '../api/client'
import { DrillShelf } from '../components/DrillShelf'
import { MetricCard } from '../components/MetricCard'

function ReliabilityBanner({ data }: { data: Delivery }) {
  const q = data.metrics?.quality
  const ball = data.metrics?.ball_speed_kmh
  const calibrated = Boolean(q?.calibrated || data.player_profile?.height_m || data.metrics?.player_profile?.height_m)
  const trackingOk = q?.tracking_ok
  const poseFrames = q?.pose_frames ?? 0
  const poseOk = Boolean(trackingOk && poseFrames >= 10)
  const ballOk = metricReady(ball)
  const view = q?.camera_view
  const viewNote = q?.camera_view_note

  let tone = 'border-rose-200 bg-rose-50 text-rose-800'
  let dot = 'bg-rose-500'
  let msg = 'Low pose quality — use a clearer, side-on, stable full-body video.'

  if (q?.speed_view_ok === false || view === 'front_on') {
    tone = 'border-rose-200 bg-rose-50 text-rose-800'
    dot = 'bg-rose-500'
    msg =
      (viewNote || 'This camera angle cannot yield a truthful km/h.') +
      ' Film side-on for Action, or use Ball flight (behind the bowler, both wickets) for ICC-style speed.'
  } else if (poseOk && calibrated && ballOk) {
    tone = 'border-emerald-200 bg-emerald-50 text-emerald-800'
    dot = 'bg-emerald-500'
    msg =
      'Body mechanics from a side-on clip. Speeds come from the pose and ball on the video plus your height — bowling style (spin/pace) is coaching only, not a speed lookup. Ball km/h is still 2D, not a gun. For broadcast-style speed, line and length, use Ball flight.'
  } else if (poseOk && calibrated && !ballOk) {
    tone = 'border-amber-200 bg-amber-50 text-amber-800'
    dot = 'bg-amber-500'
    msg =
      'Height scale is in use for arm speed and release height. Ball km/h needs a visible in-air path. For ICC-style speed, line and length, use Ball flight.'
  } else if (poseOk && !calibrated) {
    tone = 'border-amber-200 bg-amber-50 text-amber-800'
    dot = 'bg-amber-500'
    msg = `Pose OK (${poseFrames} frames). Physical km/h and metres need bowler height on upload — angles and timing are still measured.`
  }

  return (
    <div className={`animate-rise flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${tone}`}>
      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dot}`} />
      <p>
        <span className="font-semibold">Measurement quality · </span>
        {msg}
      </p>
    </div>
  )
}

function CopyableUrl({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-xl border border-pitch/15 bg-white px-3 py-2">
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="min-w-0 flex-1 truncate font-mono text-xs text-pitch/70 hover:text-pitch"
        title={url}
      >
        {url}
      </a>
      <button
        onClick={() => {
          navigator.clipboard.writeText(url).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
          })
        }}
        className="shrink-0 rounded-lg bg-seam px-3 py-1 text-xs font-semibold text-white transition hover:bg-ball"
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}

function HeadlineStat({ label, metric, big }: { label: string; metric?: MetricValue; big?: boolean }) {
  const hasValue = metricReady(metric)
  const decimals = big || (metric?.unit === 'm' || metric?.unit === 'km/h') ? 1 : 0
  const value = hasValue
    ? `${typeof metric!.value === 'number' ? (metric!.value as number).toFixed(decimals) : metric!.value}`
    : '—'
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">{label}</p>
      <p className={`mt-1 font-display font-extrabold leading-none ${big ? 'text-5xl text-white' : 'text-2xl text-white/90'}`}>
        {value}
        {hasValue && metric?.unit ? <span className="ml-1 text-sm font-semibold text-seam">{metric.unit}</span> : null}
        {hasValue && metric?.estimated ? (
          <span className="ml-2 align-middle text-[10px] font-bold uppercase tracking-wide text-amber-200">Est.</span>
        ) : null}
      </p>
      {!hasValue && metric?.note ? (
        <p className="mt-1 text-[10px] leading-snug text-amber-200/90">{metric.note}</p>
      ) : null}
    </div>
  )
}

function ScoreRing({ label, score }: { label: string; score?: number | null }) {
  const v = score ?? null
  const pct = v == null ? 0 : Math.max(0, Math.min(100, v))
  const tone = pct >= 66 ? 'text-emerald-400' : pct >= 40 ? 'text-seam' : 'text-ball'
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={`grid h-20 w-20 place-items-center rounded-full ${tone}`}
        style={{ background: `conic-gradient(currentColor ${pct * 3.6}deg, rgba(255,255,255,0.08) 0deg)` }}
      >
        <div className="grid h-14 w-14 place-items-center rounded-full bg-pitch-deep">
          <span className={`font-display text-xl font-extrabold ${tone}`}>{v == null ? '—' : Math.round(v)}</span>
        </div>
      </div>
      <span className="text-center text-[10px] font-semibold uppercase tracking-wide text-white/50">{label}</span>
    </div>
  )
}

function Section({ title, body, accent }: { title: string; body?: string; accent?: boolean }) {
  return (
    <article className="animate-rise rounded-2xl border border-pitch/10 bg-white p-5 shadow-sm">
      <h2 className="flex items-center gap-2 font-display text-base font-bold text-pitch">
        <span className={`h-4 w-1 rounded-full ${accent ? 'bg-seam' : 'bg-pitch/20'}`} />
        {title}
      </h2>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-pitch/80">{body?.trim() || '—'}</p>
    </article>
  )
}

export function ResultsPage() {
  const { deliveryId } = useParams()
  const [data, setData] = useState<Delivery | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!deliveryId) return
    getDelivery(deliveryId)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
  }, [deliveryId])

  if (error) return <p className="text-ball">{error}</p>
  if (!data)
    return (
      <div className="flex items-center gap-3 text-pitch/60">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-pitch/30 border-t-pitch" />
        Loading results…
      </div>
    )

  const m = data.metrics || {}
  const a = data.analysis || {}
  const artifacts = data.artifacts || {}
  const scores: Scores = m.scores || {}
  const created = data.created_at ? new Date(data.created_at).toLocaleString() : ''

  const cloudVideo = artifacts.cloudinary_video_url
  const processedSrc = cloudVideo || (artifacts.overlay_video_url ? assetUrl(artifacts.overlay_video_url) : '')
  const originalSrc = artifacts.original_video_url ? assetUrl(artifacts.original_video_url) : ''
  const pdfHref = artifacts.pdf_url ? `${assetUrl(artifacts.pdf_url)}?download=1` : artifacts.cloudinary_pdf_url || ''
  const side = m.throwing_side ? `${m.throwing_side[0].toUpperCase()}${m.throwing_side.slice(1)}-arm` : null
  const profile = data.player_profile || m.player_profile
  const seq = m.kinematic_sequence || []
  const cmp = a.comparison

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="animate-rise">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-seam">Analysis results</p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="font-display text-4xl font-extrabold text-pitch">{data.player_name || 'Bowler'}</h1>
            {side ? (
              <span className="rounded-full border border-pitch/15 bg-white px-3 py-1 text-xs font-bold text-pitch/70">
                {side}
              </span>
            ) : null}
            {profile?.bowling_style ? (
              <span className="rounded-full border border-pitch/15 bg-white px-3 py-1 text-xs font-bold capitalize text-pitch/70">
                {profile.bowling_style}
              </span>
            ) : null}
            {profile?.height_m ? (
              <span className="rounded-full border border-pitch/15 bg-white px-3 py-1 text-xs font-bold text-pitch/70">
                {profile.height_m.toFixed(2)} m
              </span>
            ) : null}
            {profile?.age_years ? (
              <span className="rounded-full border border-pitch/15 bg-white px-3 py-1 text-xs font-bold text-pitch/70">
                Age {profile.age_years}
              </span>
            ) : null}
          </div>
          {created ? <p className="mt-1 text-xs text-pitch/50">{created}</p> : null}
          {cmp?.previous_count && cmp.delta_kmh != null ? (
            <p className="mt-2 text-sm text-pitch/70">
              {cmp.delta_kmh >= 0 ? '+' : ''}
              {cmp.delta_kmh.toFixed(1)} km/h vs your last {cmp.previous_count}{' '}
              {cmp.previous_count === 1 ? 'delivery' : 'deliveries'}
              {metricReady(m.ball_speed_kmh) ? ' (ball speed)' : ' (arm speed — ball was not tracked)'}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/"
            className="rounded-xl border border-pitch/20 bg-white px-4 py-2 text-sm font-semibold text-pitch transition hover:bg-pitch hover:text-white"
          >
            New Action clip
          </Link>
          <Link
            to="/ball-flight"
            className="rounded-xl border border-pitch/20 bg-white px-4 py-2 text-sm font-semibold text-pitch transition hover:bg-pitch hover:text-white"
          >
            Ball flight
          </Link>
          {pdfHref ? (
            <a
              href={pdfHref}
              target="_blank"
              rel="noreferrer"
              download
              className="rounded-xl bg-gradient-to-r from-seam to-ball px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
            >
              Download PDF report
            </a>
          ) : null}
        </div>
      </div>

      <ReliabilityBanner data={data} />

      {/* Hero: original on top, analyzed overlay underneath */}
      <div className="grid min-w-0 gap-6 lg:grid-cols-[1.55fr_0.85fr]">
        <div className="min-w-0 animate-rise space-y-4">
          {originalSrc ? (
            <div className="overflow-hidden rounded-3xl border border-pitch/10 bg-black shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 bg-pitch-deep px-4 py-2.5">
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/70">
                  <span className="h-2 w-2 rounded-full bg-white/50" /> Before · original upload
                </span>
              </div>
              <video className="aspect-video w-full object-contain" src={originalSrc} controls playsInline />
            </div>
          ) : null}

          {processedSrc ? (
            <div className="overflow-hidden rounded-3xl border border-pitch/10 bg-black shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 bg-pitch-deep px-4 py-2.5">
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/70">
                  <span className="h-2 w-2 rounded-full bg-seam" /> After · slow-motion + overlays
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">CricLab</span>
              </div>
              <video className="aspect-video w-full object-contain" src={processedSrc} controls playsInline />
            </div>
          ) : artifacts.release_still_url ? (
            <div className="overflow-hidden rounded-3xl border border-pitch/10 bg-black shadow-2xl">
              <img src={assetUrl(artifacts.release_still_url)} alt="Release frame" className="w-full" />
            </div>
          ) : originalSrc ? null : (
            <div className="flex aspect-video items-center justify-center rounded-3xl bg-black text-white/60">No media</div>
          )}

          {cloudVideo ? (
            <div className="min-w-0 animate-rise space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-pitch/50">Share processed video</p>
              <CopyableUrl url={cloudVideo} />
            </div>
          ) : processedSrc ? (
            <p className="rounded-xl bg-mist px-4 py-2 text-xs text-pitch/70">
              Playing the overlay from this computer. A shareable cloud link is not available.
            </p>
          ) : null}
        </div>

        {/* Headline stats panel */}
        <aside className="animate-rise flex min-w-0 flex-col justify-between gap-6 rounded-3xl bg-gradient-to-b from-pitch to-pitch-deep p-6 text-white shadow-xl">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">Headline · measured</p>
            <div className="mt-3">
              <HeadlineStat label="Ball speed" metric={m.ball_speed_kmh} big />
            </div>
            {!metricReady(m.ball_speed_kmh) && metricReady(m.arm_speed_kmh) ? (
              <p className="mt-2 text-[11px] leading-snug text-white/55">
                Ball speed is unavailable. Arm speed below is the bowling wrist, not the ball.
              </p>
            ) : null}
            <div className="mt-5 grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
              <HeadlineStat label="Arm speed" metric={m.arm_speed_kmh} />
              <HeadlineStat label="Release time" metric={m.release_time_ms} />
              <HeadlineStat label="Release height" metric={m.release_height_m} />
              <HeadlineStat label="Stride length" metric={m.stride_length_pct_height} />
            </div>
          </div>
          <div className="border-t border-white/10 pt-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">
              Heuristic score · not clinical
            </p>
            <div className="mt-2 flex items-end gap-3">
              <span className="font-display text-6xl font-extrabold leading-none text-seam">
                {scores.overall != null ? Math.round(scores.overall) : '—'}
              </span>
              <span className="pb-1 text-sm font-semibold text-white/50">/ 100</span>
            </div>
            {scores.overall != null ? (
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-seam to-ball"
                  style={{ width: `${Math.max(0, Math.min(100, scores.overall))}%` }}
                />
              </div>
            ) : (
              <p className="mt-2 text-[10px] text-white/45">Not enough measured inputs to score.</p>
            )}
          </div>
        </aside>
      </div>

      {seq.length ? (
        <div className="animate-rise rounded-2xl border border-pitch/10 bg-white p-5 shadow-sm">
          <h2 className="font-display text-base font-bold text-pitch">Kinematic sequence</h2>
          <p className="mt-1 text-xs text-pitch/55">Events we could time on this clip. Hip rotation is a 2D estimate.</p>
          <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {seq.map((item) => {
              const seen = item.frame != null
              return (
                <li
                  key={`${item.n}-${item.key}`}
                  className={`flex items-start gap-3 rounded-xl border px-3 py-3 ${
                    seen ? 'border-pitch/10 bg-mist/80' : 'border-dashed border-pitch/15 bg-white text-pitch/40'
                  }`}
                >
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${
                      seen ? 'bg-pitch text-white' : 'bg-pitch/10 text-pitch/40'
                    }`}
                  >
                    {item.n}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-pitch">{item.label}</span>
                    <span className="text-[11px] text-pitch/50">
                      {seen ? (item.estimated ? 'Estimated' : 'Measured') : 'Not seen'}
                    </span>
                  </span>
                </li>
              )
            })}
          </ol>
        </div>
      ) : null}

      {/* Score rings */}
      <div className="animate-rise rounded-3xl bg-gradient-to-b from-pitch to-pitch-deep p-6 shadow-xl">
        <h2 className="font-display text-base font-bold text-white">Action scores</h2>
        <div className="mt-5 flex flex-wrap items-start justify-around gap-6">
          <ScoreRing label="Overall" score={scores.overall} />
          <ScoreRing label="Ball speed" score={scores.ball_speed} />
          <ScoreRing label="Arm speed" score={scores.arm_speed} />
          <ScoreRing label="Sequencing" score={scores.sequencing} />
          <ScoreRing label="Front-leg brace" score={scores.front_leg_brace} />
          <ScoreRing label="Hip/Shoulder" score={scores.hip_shoulder_separation} />
        </div>
        <p className="mt-5 text-[11px] text-white/40">
          Heuristic 0–100 indicators from measured ball speed, angles and timing — for tracking
          trends, not clinical grading.
        </p>
      </div>

      {/* Detailed metrics */}
      <div>
        <h2 className="font-display mb-3 text-lg font-bold text-pitch">Measured metrics</h2>
        <div className="grid min-w-0 grid-cols-2 gap-3 lg:grid-cols-4">
          <MetricCard label="Ball speed" metric={m.ball_speed_kmh} />
          <MetricCard label="Ball speed (m/s)" metric={m.ball_speed_mps} />
          <MetricCard label="Arm speed" metric={m.arm_speed_kmh} />
          <MetricCard label="Release height" metric={m.release_height_m} />
          <MetricCard label="Release time" metric={m.release_time_ms} />
          <MetricCard label="Release angle" metric={m.release_angle_deg} />
          <MetricCard label="Elbow extension" metric={m.elbow_extension_deg} />
          <MetricCard label="Front-knee flexion" metric={m.front_knee_flexion_deg} />
          <MetricCard label="Hip/shoulder sep." metric={m.hip_shoulder_separation_deg} />
          <MetricCard label="Arm-swing speed" metric={m.arm_swing_speed_deg_s} />
          <MetricCard label="Stride length" metric={m.stride_length_pct_height} />
          <MetricCard label="Arm speed (m/s)" metric={m.arm_speed_mps} />
        </div>
        <details className="mt-4 rounded-2xl border border-pitch/10 bg-white/60 p-4">
          <summary className="cursor-pointer text-sm font-semibold text-pitch/70">
            Advanced · 2D rotation proxies (not true 3D)
          </summary>
          <div className="mt-3 grid min-w-0 grid-cols-2 gap-3">
            <MetricCard label="Hip-line proxy" metric={m.hip_rotation_speed_deg_s} />
            <MetricCard label="Trunk-line proxy" metric={m.trunk_rotation_speed_deg_s} />
          </div>
        </details>
      </div>

      {/* AI coaching */}
      <div>
        <h2 className="font-display mb-3 text-lg font-bold text-pitch">AI coaching</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Section title="Summary" body={a.summary} accent />
          <Section title="Observations" body={a.observations} />
          <Section title="Strengths" body={a.strengths} />
          <Section title="Areas to improve" body={a.improvements} />
        </div>
      </div>

      <DrillShelf drills={a.recommendations} heading="Drills for this delivery" />

      {a.confidence_note ? (
        <p className="rounded-xl border border-pitch/10 bg-pitch/5 px-4 py-3 text-xs text-pitch/60">{a.confidence_note}</p>
      ) : null}
    </div>
  )
}

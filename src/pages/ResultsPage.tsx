import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { assetUrl, downloadHref, getDelivery, metricReady, type Delivery, type MetricValue, type Scores } from '../api/client'
import { AdminReportChrome, AdminStaffBanner } from '../components/admin/AdminStaffBanner'
import { DeliveryHonesty } from '../components/DeliveryHonesty'
import { DrillShelf } from '../components/DrillShelf'
import { MetricCard } from '../components/MetricCard'
import { Card, Chip, Reveal } from '../components/site/ui'

/* ---------------------------------------------------------------------------
   Small building blocks for this screen. Everything here is presentation:
   what a value says, and whether it exists at all, is decided upstream.
--------------------------------------------------------------------------- */

function Heading({ eyebrow, title, note }: { eyebrow?: string; title: string; note?: string }) {
  return (
    <div className="min-w-0">
      {eyebrow ? (
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-lime">{eyebrow}</p>
      ) : null}
      <h2 className="font-display mt-1 text-xl font-extrabold text-chalk sm:text-2xl">{title}</h2>
      {note ? <p className="mt-1.5 text-xs leading-relaxed text-chalk/50">{note}</p> : null}
    </div>
  )
}

function ReliabilityBanner({ data }: { data: Delivery }) {
  const q = data.metrics?.quality
  const ball = data.metrics?.ball_speed_kmh
  const calibrated = Boolean(q?.calibrated || data.player_profile?.height_m || data.metrics?.player_profile?.height_m)
  const trackingOk = q?.tracking_ok
  const poseFrames = q?.pose_frames ?? 0
  const poseOk = Boolean(trackingOk && poseFrames >= 10)
  const ballOk = metricReady(ball)
  const viewNote = q?.camera_view_note
  const fromBall = Boolean(q?.speed_view_from_ball)
  const slowMo = Boolean(q?.slow_motion || data.metrics?.timebase?.slow_motion)

  let tone = 'border-bad/30 bg-bad/10'
  let dot = 'bg-bad'
  let accent = 'text-bad'
  let msg = 'The body was hard to read on this clip — use a clearer, side-on, stable full-body video.'

  if (q?.speed_view_ok === false) {
    tone = 'border-bad/30 bg-bad/10'
    dot = 'bg-bad'
    accent = 'text-bad'
    msg =
      (viewNote || 'This camera angle cannot yield a truthful km/h.') +
      ' Film side-on for Action.'
      // TODO: For Future
      // ' Film side-on for Action, or use Ball flight (behind the bowler, both wickets) for ICC-style speed.'
  } else if (poseOk && calibrated && ballOk) {
    tone = 'border-ok/30 bg-ok/10'
    dot = 'bg-ok'
    accent = 'text-ok'
    msg =
      (fromBall
        ? 'The body read as an angled camera, but the tracked ball crosses the image — speeds come from that flight and are still a flat-image floor. '
        : 'Body mechanics from this clip. Speeds come from the body and ball in frame plus your height. ') +
      (slowMo ? 'Capture rate was recovered from the ball’s fall. ' : '') +
      'Bowling style (spin/pace) is coaching only, not a speed lookup.'
      // TODO: For Future
      // 'For broadcast-style speed, line and length, use Ball flight.'
  } else if (poseOk && calibrated && !ballOk) {
    tone = 'border-warn/30 bg-warn/10'
    dot = 'bg-warn'
    accent = 'text-warn'
    msg =
      'Height scale is in use for arm speed and release height. Ball km/h needs a visible in-air path.'
      // TODO: For Future
      // 'Ball km/h needs a visible in-air path. For broadcast-style speed, line and length, use Ball flight.'
  } else if (poseOk && !calibrated) {
    tone = 'border-warn/30 bg-warn/10'
    dot = 'bg-warn'
    accent = 'text-warn'
    msg = `Body tracked on ${poseFrames} frames. Physical km/h and metres need bowler height on upload — angles and timing are still measured.`
  }

  return (
    <div className={`animate-rise flex items-start gap-3 rounded-[var(--radius-card)] border px-4 py-3.5 ${tone}`}>
      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dot}`} />
      <p className="min-w-0 break-words text-sm leading-relaxed text-chalk/80">
        <span className={`font-bold ${accent}`}>Measurement quality · </span>
        {msg}
      </p>
    </div>
  )
}

function CopyableUrl({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="min-w-0 flex-1 truncate font-mono text-xs text-chalk/60 transition hover:text-lime"
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
        className="shrink-0 rounded-lg bg-lime px-3 py-1 text-xs font-bold text-night transition hover:bg-[#c6ff62]"
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
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-chalk/40">{label}</p>
      <p
        className={`font-display mt-1 break-words font-extrabold leading-none ${
          big
            ? hasValue
              ? 'text-4xl text-chalk @min-[32rem]:text-5xl @min-[48rem]:text-[3.4rem]'
              : 'text-4xl text-chalk/30 @min-[32rem]:text-5xl @min-[48rem]:text-[3.4rem]'
            : hasValue
              ? 'text-2xl text-chalk/90'
              : 'text-2xl text-chalk/30'
        }`}
      >
        {value}
        {hasValue && metric?.unit ? <span className="ml-1 text-sm font-semibold text-seam">{metric.unit}</span> : null}
        {hasValue && metric?.estimated ? (
          <span className="ml-2 align-middle rounded border border-warn/30 bg-warn/10 px-1 py-0.5 text-[9px] font-bold uppercase tracking-wide text-warn">
            Est.
          </span>
        ) : null}
      </p>
      {!hasValue && metric?.note ? (
        <p className="mt-1.5 break-words text-[10px] leading-snug text-warn/90">{metric.note}</p>
      ) : null}
    </div>
  )
}

function ScoreRing({ label, score }: { label: string; score?: number | null }) {
  const v = score ?? null
  const pct = v == null ? 0 : Math.max(0, Math.min(100, v))
  const tone =
    v == null ? 'text-chalk/25' : pct >= 66 ? 'text-ok' : pct >= 40 ? 'text-seam' : 'text-bad'
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`grid h-20 w-20 place-items-center rounded-full ${tone}`}
        style={{ background: `conic-gradient(currentColor ${pct * 3.6}deg, rgba(255,255,255,0.08) 0deg)` }}
        aria-label={`${label} score ${v == null ? 'unavailable' : Math.round(v)} of 100`}
      >
        <div className="grid h-[3.4rem] w-[3.4rem] place-items-center rounded-full bg-night">
          <span className={`font-display text-xl font-extrabold ${tone}`}>{v == null ? '—' : Math.round(v)}</span>
        </div>
      </div>
      <span className="max-w-[6.5rem] text-center text-[10px] font-semibold uppercase tracking-wide text-chalk/45">
        {label}
      </span>
    </div>
  )
}

function NoteCard({ title, body, accent }: { title: string; body?: string; accent?: boolean }) {
  return (
    <Card interactive={false} className="min-w-0 p-5">
      <h3 className="font-display flex items-center gap-2.5 text-base font-bold text-chalk">
        <span className={`h-4 w-1 rounded-full ${accent ? 'bg-lime' : 'bg-white/20'}`} />
        {title}
      </h3>
      <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-chalk/70">
        {body?.trim() || '—'}
      </p>
    </Card>
  )
}

const APP_LINK =
  'rounded-full border border-white/25 bg-white/5 px-4 py-2 text-sm font-semibold text-chalk backdrop-blur transition hover:border-lime/60 hover:bg-white/10'

export function ResultsPage({ deliveryId: deliveryIdProp }: { deliveryId?: string } = {}) {
  const { deliveryId: paramId } = useParams()
  const deliveryId = deliveryIdProp ?? paramId
  const inAdmin = useLocation().pathname.startsWith('/admin')
  const [data, setData] = useState<Delivery | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [mediaTick, setMediaTick] = useState(0)

  useEffect(() => {
    if (!deliveryId) return
    if (mediaTick === 0) {
      setData(null)
      setError(null)
    }
    getDelivery(deliveryId)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
  }, [deliveryId, mediaTick])

  function refreshSignedMedia() {
    if (mediaTick > 1) return
    setMediaTick((n) => n + 1)
  }

  if (error)
    return (
      <div className="rounded-[var(--radius-card)] border border-bad/30 bg-bad/10 px-4 py-3.5 text-sm text-bad">
        {error}
      </div>
    )
  if (!data)
    return (
      <div className="flex items-center gap-3 text-sm text-chalk/60">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/15 border-t-lime" />
        Loading results…
      </div>
    )

  const m = data.metrics || {}
  const a = data.analysis || {}
  const artifacts = data.artifacts || {}
  const scores: Scores = m.scores || {}
  const created = data.created_at ? new Date(data.created_at).toLocaleString() : ''

  const cloudVideo = artifacts.cloudinary_video_url
  const processedSrc = assetUrl(cloudVideo || artifacts.overlay_video_url)
  const originalSrc = assetUrl(artifacts.compressed_video_url || artifacts.original_video_url)
  const pdfHref = downloadHref(artifacts.cloudinary_pdf_url || artifacts.pdf_url)
  const side = m.throwing_side ? `${m.throwing_side[0].toUpperCase()}${m.throwing_side.slice(1)}-arm` : null
  const profile = data.player_profile || m.player_profile
  const seq = m.kinematic_sequence || []
  const cmp = a.comparison

  return (
    <div className="@container min-w-0 space-y-9">
      <AdminStaffBanner />
      <AdminReportChrome />
      {/* ==================== Header ==================== */}
      <Reveal className="flex min-w-0 flex-wrap items-end justify-between gap-5">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-lime">Delivery report</p>
          <div className="mt-1.5 flex min-w-0 flex-col gap-2.5 @min-[36rem]:flex-row @min-[36rem]:flex-wrap @min-[36rem]:items-center">
            <h1 className="font-display min-w-0 break-words text-2xl font-extrabold leading-tight text-chalk @min-[28rem]:text-3xl @min-[48rem]:text-4xl @min-[64rem]:text-[2.9rem]">
              {data.player_name || 'Bowler'}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
            {side ? <Chip tone="lime">{side}</Chip> : null}
            {profile?.bowling_style ? (
              <Chip tone="neutral">
                <span className="capitalize">{profile.bowling_style}</span>
              </Chip>
            ) : null}
            {profile?.height_m ? <Chip tone="neutral">{profile.height_m.toFixed(2)} m</Chip> : null}
            {profile?.age_years ? <Chip tone="neutral">Age {profile.age_years}</Chip> : null}
            </div>
          </div>
          {created ? <p className="mt-2 text-xs text-chalk/45">{created}</p> : null}
          {cmp?.previous_count && cmp.delta_kmh != null ? (
            <p className="mt-2.5 text-sm text-chalk/65">
              <span className={`font-bold ${cmp.delta_kmh >= 0 ? 'text-ok' : 'text-warn'}`}>
                {cmp.delta_kmh >= 0 ? '+' : ''}
                {cmp.delta_kmh.toFixed(1)} km/h
              </span>{' '}
              vs your last {cmp.previous_count}{' '}
              {cmp.previous_count === 1 ? 'delivery' : 'deliveries'} (tracked ball speed)
            </p>
          ) : cmp?.arm_delta_kmh != null && cmp.previous_arm_count ? (
            <p className="mt-2.5 text-sm text-chalk/65">
              <span className={`font-bold ${cmp.arm_delta_kmh >= 0 ? 'text-ok' : 'text-warn'}`}>
                {cmp.arm_delta_kmh >= 0 ? '+' : ''}
                {cmp.arm_delta_kmh.toFixed(1)} km/h
              </span>{' '}
              arm speed vs your last {cmp.previous_arm_count}{' '}
              {cmp.previous_arm_count === 1 ? 'delivery' : 'deliveries'} — ball speed could not be measured on this clip
            </p>
          ) : null}
        </div>
        <div className="flex w-full min-w-0 flex-wrap gap-2">
          {inAdmin && !deliveryIdProp ? (
            <Link to="/admin/analyses" className={APP_LINK}>
              Back to analyses
            </Link>
          ) : !inAdmin ? (
            <>
              <Link to="/app/action" className={APP_LINK}>
                New Action clip
              </Link>
              {/* TODO: For Future */}
              {/* <Link to="/app/ball-flight" className={APP_LINK}>
                Ball flight
              </Link> */}
            </>
          ) : null}
          {pdfHref ? (
            <a
              href={pdfHref}
              target="_blank"
              rel="noreferrer"
              download
              className="sweep-on-hover inline-flex w-full min-h-11 items-center justify-center gap-2 rounded-full bg-lime px-4 py-2 text-sm font-bold text-night shadow-[0_12px_34px_-12px_rgba(182,242,74,0.75)] transition hover:bg-[#c6ff62] @min-[28rem]:w-auto"
            >
              Download PDF report
            </a>
          ) : null}
        </div>
      </Reveal>

      <ReliabilityBanner data={data} />

      {/* ==================== What we could measure ==================== */}
      <section className="min-w-0 space-y-4">
        <Heading
          eyebrow="Honesty check"
          title="What this clip could support"
          note="Capture, camera view and the checks that decide which readings are trustworthy."
        />
        <DeliveryHonesty metrics={m} />
      </section>

      {/* ==================== Hero: footage + headline numbers ==================== */}
      <section className="min-w-0 space-y-4">
        <Heading eyebrow="Your footage" title="The delivery, marked up" />
        <div className="grid min-w-0 gap-5 @min-[56rem]:grid-cols-[minmax(0,1.55fr)_minmax(0,0.85fr)]">
          <div className="min-w-0 animate-rise space-y-4">
            {originalSrc ? (
              <div className="min-w-0 overflow-hidden rounded-[var(--radius-card)] border border-white/10 bg-black shadow-[0_24px_60px_-30px_rgba(0,0,0,0.9)]">
                <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-charcoal px-4 py-2.5">
                  <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-chalk/60">
                    <span className="h-2 w-2 rounded-full bg-chalk/40" /> Before · your clip
                  </span>
                </div>
                <video
                  className="aspect-video w-full object-contain"
                  src={originalSrc}
                  controls
                  playsInline
                  onError={refreshSignedMedia}
                />
              </div>
            ) : null}

            {processedSrc ? (
              <div className="min-w-0 overflow-hidden rounded-[var(--radius-card)] border border-white/10 bg-black shadow-[0_24px_60px_-30px_rgba(0,0,0,0.9)]">
                <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-charcoal px-4 py-2.5">
                  <span className="flex min-w-0 items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-lime">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-lime" />
                    <span className="truncate">
                      After ·{' '}
                      {m.timebase?.slow_motion || m.quality?.slow_motion
                        ? 'slow-motion markup'
                        : 'marked-up clip'}
                    </span>
                  </span>
                  <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-chalk/30">
                    CricLab
                  </span>
                </div>
                <video
                  className="aspect-video w-full object-contain"
                  src={processedSrc}
                  controls
                  playsInline
                  onError={refreshSignedMedia}
                />
              </div>
            ) : artifacts.release_still_url ? (
              <div className="min-w-0 overflow-hidden rounded-[var(--radius-card)] border border-white/10 bg-black shadow-[0_24px_60px_-30px_rgba(0,0,0,0.9)]">
                <img src={assetUrl(artifacts.release_still_url)} alt="Release frame" className="w-full" />
              </div>
            ) : originalSrc ? null : (
              <div className="flex aspect-video items-center justify-center rounded-[var(--radius-card)] border border-white/10 bg-black text-sm text-chalk/45">
                No media
              </div>
            )}

            {cloudVideo ? (
              <div className="min-w-0 animate-rise space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-chalk/40">
                  Share your marked-up clip
                </p>
                <CopyableUrl url={cloudVideo} />
              </div>
            ) : processedSrc ? (
              <p className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs leading-relaxed text-chalk/55">
                Playing the marked-up clip from this device. A shareable link is not available for it.
              </p>
            ) : null}
          </div>

          {/* Headline stats panel */}
          <Card
            interactive={false}
            className="animate-rise flex min-w-0 flex-col justify-between gap-6 p-6"
          >
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-chalk/40">
                Headline · measured
              </p>
              <div className="mt-3">
                <HeadlineStat label="Ball speed" metric={m.ball_speed_kmh} big />
              </div>
              {!metricReady(m.ball_speed_kmh) && metricReady(m.arm_speed_kmh) ? (
                <p className="mt-2.5 text-[11px] leading-snug text-warn/90">
                  Ball speed is unavailable. Arm speed below is the bowling wrist, not the ball.
                </p>
              ) : null}
              <div className="mt-5 grid grid-cols-1 gap-4 border-t border-white/10 pt-5 @min-[22rem]:grid-cols-2">
                <HeadlineStat label="Arm speed" metric={m.arm_speed_kmh} />
                <HeadlineStat label="Release time" metric={m.release_time_ms} />
                <HeadlineStat label="Release height" metric={m.release_height_m} />
                <HeadlineStat label="Stride length" metric={m.stride_length_pct_height} />
              </div>
            </div>
            <div className="border-t border-white/10 pt-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-chalk/40">
                Heuristic score · not clinical
              </p>
              <div className="mt-2 flex items-end gap-3">
                <span
                  className={`font-display text-5xl font-extrabold leading-none @min-[32rem]:text-6xl ${
                    scores.overall != null ? 'text-gradient-lime' : 'text-chalk/25'
                  }`}
                >
                  {scores.overall != null ? Math.round(scores.overall) : '—'}
                </span>
                <span className="pb-1 text-sm font-semibold text-chalk/40">/ 100</span>
              </div>
              {scores.overall != null ? (
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-lime to-seam transition-all duration-700"
                    style={{ width: `${Math.max(0, Math.min(100, scores.overall))}%` }}
                  />
                </div>
              ) : (
                <p className="mt-2 text-[10px] leading-snug text-chalk/45">
                  Not enough measured inputs to score.
                </p>
              )}
            </div>
          </Card>
        </div>
      </section>

      {/* ==================== Kinematic sequence ==================== */}
      {seq.length ? (
        <section className="min-w-0 space-y-4">
          <Heading
            eyebrow="Timing"
            title="Kinematic sequence"
            note="Events we could time on this clip. Hip rotation is a 2D estimate."
          />
          <ol className="grid min-w-0 gap-3 @min-[28rem]:grid-cols-2 @min-[56rem]:grid-cols-4">
            {seq.map((item) => {
              const seen = item.frame != null
              return (
                <li
                  key={`${item.n}-${item.key}`}
                  className={`flex min-w-0 items-start gap-3 rounded-2xl border px-3.5 py-3.5 ${
                    seen
                      ? 'border-white/10 bg-white/[0.05]'
                      : 'border-dashed border-white/12 bg-transparent'
                  }`}
                >
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border text-xs font-bold ${
                      seen
                        ? 'border-lime/40 bg-lime/15 text-lime'
                        : 'border-white/10 bg-white/5 text-chalk/30'
                    }`}
                  >
                    {item.n}
                  </span>
                  <span className="min-w-0">
                    <span
                      className={`block break-words text-sm font-semibold ${
                        seen ? 'text-chalk' : 'text-chalk/35'
                      }`}
                    >
                      {item.label}
                    </span>
                    <span
                      className={`text-[11px] ${
                        seen ? (item.estimated ? 'text-warn/90' : 'text-chalk/45') : 'text-chalk/35'
                      }`}
                    >
                      {seen ? (item.estimated ? 'Estimated' : 'Measured') : 'Not seen'}
                    </span>
                  </span>
                </li>
              )
            })}
          </ol>
        </section>
      ) : null}

      {/* ==================== Score rings ==================== */}
      <section className="min-w-0 space-y-4">
        <Heading eyebrow="Indicators" title="Action scores" />
        <Card interactive={false} className="min-w-0 p-6">
          <div className="flex flex-wrap items-start justify-center gap-6 sm:justify-around sm:gap-7">
            <ScoreRing label="Overall" score={scores.overall} />
            <ScoreRing label="Ball speed" score={scores.ball_speed} />
            <ScoreRing label="Arm speed" score={scores.arm_speed} />
            <ScoreRing label="Sequencing" score={scores.sequencing} />
            <ScoreRing label="Front-leg brace" score={scores.front_leg_brace} />
            <ScoreRing label="Hip/Shoulder" score={scores.hip_shoulder_separation} />
          </div>
          <p className="mt-6 border-t border-white/10 pt-4 text-[11px] leading-relaxed text-chalk/40">
            Heuristic 0–100 indicators from measured ball speed, angles and timing — for tracking
            trends, not clinical grading.
          </p>
        </Card>
      </section>

      {/* ==================== Detailed metrics ==================== */}
      <section className="min-w-0 space-y-4">
        <Heading
          eyebrow="The numbers"
          title="Measured metrics"
          note="Each reading carries its own confidence. Anything shown as — could not be measured from this clip."
        />
        <div className="grid min-w-0 grid-cols-1 gap-3 @min-[22rem]:grid-cols-2 @min-[56rem]:grid-cols-4">
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
        <details className="group min-w-0 rounded-[var(--radius-card)] border border-white/10 bg-white/[0.03] p-4">
          <summary className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-chalk/70 transition hover:text-chalk">
            <span
              className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-white/15 text-xs leading-none text-lime transition-transform duration-300 group-open:rotate-45"
              aria-hidden
            >
              +
            </span>
            Advanced · 2D rotation proxies (not true 3D)
          </summary>
          <div className="mt-4 grid min-w-0 grid-cols-1 gap-3 @min-[22rem]:grid-cols-2">
            <MetricCard label="Hip-line proxy" metric={m.hip_rotation_speed_deg_s} />
            <MetricCard label="Trunk-line proxy" metric={m.trunk_rotation_speed_deg_s} />
            <MetricCard label="Hip→trunk peak gap" metric={m.hip_to_trunk_peak_gap_ms} />
            <MetricCard label="Elbow extension range" metric={m.elbow_extension_range_deg} />
          </div>
        </details>
      </section>

      {/* ==================== Coaching ==================== */}
      <section className="min-w-0 space-y-4">
        <Heading
          eyebrow="Coaching"
          title="Notes on this delivery"
          note="Written from what the clip actually showed — read it alongside the confidence on each number."
        />
        <div className="grid min-w-0 gap-4 @min-[36rem]:grid-cols-2">
          <NoteCard title="Summary" body={a.summary} accent />
          <NoteCard title="Observations" body={a.observations} />
          <NoteCard title="Strengths" body={a.strengths} />
          <NoteCard title="Areas to improve" body={a.improvements} />
        </div>
      </section>

      <DrillShelf drills={a.recommendations} heading="Drills for this delivery" />

      {a.confidence_note ? (
        <p className="min-w-0 break-words rounded-[var(--radius-card)] border border-white/10 bg-white/[0.03] px-4 py-3.5 text-xs leading-relaxed text-chalk/55">
          {a.confidence_note}
        </p>
      ) : null}
    </div>
  )
}

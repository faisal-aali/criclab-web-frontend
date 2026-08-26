import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { uploadVideo } from '../api/client'
import { Backdrop, Button, Card, Chip, Eyebrow, Reveal, TiltCard } from '../components/site/ui'

const PROFILE_KEY = 'criclab.playerProfile'

/** Shared field label treatment — small caps, low-contrast, dark surface. */
const LABEL = 'block text-[10px] font-bold uppercase tracking-[0.14em] text-chalk/50'

const WHY_FIELDS = [
  {
    k: 'Height',
    v: 'Converts pixels into km/h and metres. Wrong height means wrong speed.',
  },
  { k: 'Bowling arm', v: 'We track that wrist, not the front arm.' },
  { k: 'Age, weight, style', v: 'Used in the coaching report only.' },
]

const FILMING = [
  'Side-on camera, tripod or stable phone',
  'Full body in frame from run-up through follow-through',
  'Ball visible in the air after it leaves the hand (needed for a ball-speed estimate)',
]

type SavedProfile = {
  firstName: string
  lastName: string
  dob: string
  heightFt: string
  heightIn: string
  weightLbs: string
  bowlingArm: 'left' | 'right' | ''
  bowlingStyle: 'pace' | 'spin' | 'medium' | ''
}

const emptyProfile: SavedProfile = {
  firstName: '',
  lastName: '',
  dob: '',
  heightFt: '',
  heightIn: '',
  weightLbs: '',
  bowlingArm: '',
  bowlingStyle: '',
}

function loadProfile(): SavedProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    if (!raw) return emptyProfile
    return { ...emptyProfile, ...JSON.parse(raw) }
  } catch {
    return emptyProfile
  }
}

export function UploadPage() {
  const navigate = useNavigate()
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [profile, setProfile] = useState<SavedProfile>(emptyProfile)
  const [metersPerPixel, setMetersPerPixel] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setProfile(loadProfile())
  }, [])

  useEffect(() => {
    if (!file) {
      setPreviewUrl('')
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const heightM = useMemo(() => {
    const ft = Number(profile.heightFt)
    const inch = Number(profile.heightIn)
    if (Number.isNaN(ft) && Number.isNaN(inch)) return null
    const m = (Number.isNaN(ft) ? 0 : ft) * 0.3048 + (Number.isNaN(inch) ? 0 : inch) * 0.0254
    return m > 0 ? m : null
  }, [profile.heightFt, profile.heightIn])

  const inches = Number(profile.heightIn)
  const inchesOk = profile.heightIn === '' || (!Number.isNaN(inches) && inches >= 0 && inches <= 11)

  const blockers: string[] = []
  if (!profile.firstName.trim()) blockers.push('first name')
  if (!profile.lastName.trim()) blockers.push('last name')
  if (!profile.dob) blockers.push('date of birth')
  if (heightM == null) blockers.push('height')
  else if (heightM < 1.2 || heightM > 2.3) blockers.push('a realistic height (about 4′0″–7′6″)')
  if (!inchesOk) blockers.push('inches between 0 and 11')
  if (!(Number(profile.weightLbs) >= 50 && Number(profile.weightLbs) <= 400)) blockers.push('weight in lbs')
  if (profile.bowlingArm !== 'left' && profile.bowlingArm !== 'right') blockers.push('bowling arm')
  if (!['pace', 'spin', 'medium'].includes(profile.bowlingStyle)) blockers.push('bowling style')
  if (!file) blockers.push('a bowling video')

  const ready = blockers.length === 0

  function setField<K extends keyof SavedProfile>(key: K, value: SavedProfile[K]) {
    setProfile((p) => ({ ...p, [key]: value }))
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!file) {
      setError('Choose a bowling video first.')
      return
    }
    if (!ready) {
      setError('Fill every player detail before analysis — height and bowling arm scale the metrics.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
      const res = await uploadVideo({
        file,
        playerName: `${profile.firstName.trim()} ${profile.lastName.trim()}`,
        firstName: profile.firstName.trim(),
        lastName: profile.lastName.trim(),
        dateOfBirth: profile.dob,
        heightFt: Number(profile.heightFt) || 0,
        heightIn: Number(profile.heightIn) || 0,
        weightLbs: Number(profile.weightLbs),
        bowlingArm: profile.bowlingArm as 'left' | 'right',
        bowlingStyle: profile.bowlingStyle as 'pace' | 'spin' | 'medium',
        metersPerPixel: metersPerPixel ? Number(metersPerPixel) : undefined,
      })
      navigate(`/app/processing/${res.job_id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* ---------------- Page header ---------------- */}
      <header className="on-night animate-rise relative overflow-hidden rounded-[var(--radius-card)] border border-white/10 px-5 py-8 sm:px-8 sm:py-10">
        <Backdrop plate="pitch" scrim="dark" parallax={0.08} />
        <div
          className="pointer-events-none absolute -right-20 -top-16 h-56 w-56 animate-glow-breathe rounded-full bg-lime/10 blur-[90px]"
          aria-hidden
        />
        <div className="relative flex flex-col items-start gap-4">
        <Eyebrow>Action · mechanics lab</Eyebrow>
        <h1 className="font-display text-[2.4rem] font-extrabold leading-[1.05] sm:text-5xl lg:text-[3.4rem]">
          <span className="text-chalk">Analyze the</span>{' '}
          <span className="text-gradient-lime">action</span>
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-chalk/65">
          Body mechanics from a <span className="font-semibold text-chalk">side-on</span> clip. Ball
          km/h here is estimated from one camera view plus your height — not a speed gun. For
          broadcast-style speed, line and length, use{' '}
          <Link
            className="font-semibold text-lime underline decoration-lime/40 underline-offset-4 transition hover:text-chalk"
            to="/app/ball-flight"
          >
            Ball flight
          </Link>
          .
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Chip tone="lime">Side-on camera</Chip>
          <Chip>One delivery</Chip>
          <Chip>Full body in frame</Chip>
        </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        {/* ---------------- Capture form ---------------- */}
        <form
          onSubmit={onSubmit}
          className="glass card-sheen animate-rise rounded-[var(--radius-card)] border-white/10 p-5 sm:p-6 lg:order-2"
          style={{ animationDelay: '80ms' }}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="font-display text-xl font-bold text-chalk sm:text-2xl">
                Bowler profile
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-chalk/55">
                Required before we can measure this video correctly.
              </p>
            </div>
            {ready ? <Chip tone="ok">Ready</Chip> : <Chip>Incomplete</Chip>}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div>
              <label className={LABEL} htmlFor="first-name">
                First name
              </label>
              <input
                id="first-name"
                required
                className="field field-dark mt-1.5"
                value={profile.firstName}
                onChange={(e) => setField('firstName', e.target.value)}
              />
            </div>
            <div>
              <label className={LABEL} htmlFor="last-name">
                Last name
              </label>
              <input
                id="last-name"
                required
                className="field field-dark mt-1.5"
                value={profile.lastName}
                onChange={(e) => setField('lastName', e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4">
            <label className={LABEL} htmlFor="dob">
              Date of birth
            </label>
            <input
              id="dob"
              required
              type="date"
              className="field field-dark mt-1.5 [color-scheme:dark]"
              value={profile.dob}
              onChange={(e) => setField('dob', e.target.value)}
            />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
            <div className="min-w-0">
              <label className={LABEL} htmlFor="height-ft">
                Height ft
              </label>
              <input
                id="height-ft"
                required
                inputMode="numeric"
                className="field field-dark mt-1.5"
                value={profile.heightFt}
                onChange={(e) => setField('heightFt', e.target.value)}
                placeholder="5"
              />
            </div>
            <div className="min-w-0">
              <label className={LABEL} htmlFor="height-in">
                Height in
              </label>
              <input
                id="height-in"
                inputMode="numeric"
                className="field field-dark mt-1.5"
                value={profile.heightIn}
                onChange={(e) => setField('heightIn', e.target.value)}
                placeholder="10"
              />
            </div>
            <div className="min-w-0">
              <label className={LABEL} htmlFor="weight-lbs">
                Weight lbs
              </label>
              <input
                id="weight-lbs"
                required
                inputMode="decimal"
                className="field field-dark mt-1.5"
                value={profile.weightLbs}
                onChange={(e) => setField('weightLbs', e.target.value)}
                placeholder="165"
              />
            </div>
          </div>
          {heightM ? (
            <p className="mt-2 text-[11px] leading-snug text-chalk/45">
              {heightM.toFixed(2)} m — used to convert pixels into km/h and metres
            </p>
          ) : null}

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label className={LABEL} htmlFor="bowling-arm">
                Bowling arm
              </label>
              <select
                id="bowling-arm"
                required
                className="field field-dark mt-1.5"
                value={profile.bowlingArm}
                onChange={(e) => setField('bowlingArm', e.target.value as SavedProfile['bowlingArm'])}
              >
                <option className="bg-charcoal" value="">
                  Select
                </option>
                <option className="bg-charcoal" value="right">
                  Right-arm
                </option>
                <option className="bg-charcoal" value="left">
                  Left-arm
                </option>
              </select>
            </div>
            <div>
              <label className={LABEL} htmlFor="bowling-style">
                Bowling style
              </label>
              <select
                id="bowling-style"
                required
                className="field field-dark mt-1.5"
                value={profile.bowlingStyle}
                onChange={(e) =>
                  setField('bowlingStyle', e.target.value as SavedProfile['bowlingStyle'])
                }
              >
                <option className="bg-charcoal" value="">
                  Select
                </option>
                <option className="bg-charcoal" value="pace">
                  Pace
                </option>
                <option className="bg-charcoal" value="medium">
                  Medium
                </option>
                <option className="bg-charcoal" value="spin">
                  Spin
                </option>
              </select>
            </div>
          </div>

          {/* ---------------- Drop zone ---------------- */}
          <div className="mt-6 border-t border-white/10 pt-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className={LABEL} htmlFor="bowling-video">
                Bowling video
              </label>
              {file ? <Chip tone="ok">Clip selected</Chip> : null}
            </div>

            <div className="relative mt-2 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-white/20 bg-white/[0.03] px-4 py-8 text-center transition hover:border-lime/50 hover:bg-lime/5 focus-within:border-lime/60">
              <input
                id="bowling-video"
                required
                type="file"
                accept="video/mp4,video/quicktime,video/webm,video/x-msvideo,.mp4,.mov,.webm,.avi,.mkv"
                className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <span className="grid h-11 w-11 place-items-center rounded-xl border border-lime/25 bg-lime/10 text-lime">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="h-5 w-5"
                  aria-hidden
                >
                  <path
                    d="M12 16V4m0 0L8 8m4-4 4 4M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="max-w-full break-words px-2 text-sm font-semibold text-chalk">
                {file ? file.name : 'Drop your clip here, or tap to browse'}
              </span>
              <span className="text-[11px] text-chalk/45">
                MP4, MOV, or WebM · one delivery, side-on
              </span>
            </div>

            {previewUrl ? (
              <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-night">
                <p className="border-b border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-chalk/50">
                  Before · your upload
                </p>
                <video className="aspect-video w-full object-contain" src={previewUrl} controls playsInline />
              </div>
            ) : null}
          </div>

          <details className="group mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-3.5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-semibold text-chalk/80 transition hover:text-lime">
              Advanced scale (optional)
              <span
                className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-white/15 text-base leading-none text-lime transition-transform duration-300 group-open:rotate-45"
                aria-hidden
              >
                +
              </span>
            </summary>
            <div className="mt-3">
              <label className={LABEL} htmlFor="meters-per-pixel">
                Meters per pixel
              </label>
              <input
                id="meters-per-pixel"
                className="field field-dark mt-1.5"
                value={metersPerPixel}
                onChange={(e) => setMetersPerPixel(e.target.value)}
                placeholder="e.g. 0.008 — overrides height if set"
                inputMode="decimal"
              />
            </div>
          </details>

          {error ? (
            <p className="mt-4 rounded-xl border border-bad/30 bg-bad/10 px-3.5 py-2.5 text-sm font-medium leading-relaxed text-bad">
              {error}
            </p>
          ) : null}
          {!ready && !error ? (
            <p className="mt-4 text-[11px] leading-relaxed text-chalk/50">
              Still needed: {blockers.join(', ')}.
            </p>
          ) : null}

          <Button type="submit" size="lg" disabled={busy || !ready} className="mt-5 w-full">
            {busy ? 'Uploading…' : ready ? 'Analyze delivery' : 'Complete player details to continue'}
          </Button>
        </form>

        {/* ---------------- Guidance ---------------- */}
        <div className="animate-rise flex flex-col gap-4 lg:order-1" style={{ animationDelay: '140ms' }}>
          <Reveal>
          <TiltCard>
          <Card interactive={false} className="ring-glow p-5">
            <h2 className="font-display text-base font-bold text-chalk">What each detail does</h2>
            <ul className="mt-3 flex flex-col divide-y divide-white/10">
              {WHY_FIELDS.map((r) => (
                <li key={r.k} className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0">
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-lime">
                    {r.k}
                  </span>
                  <span className="text-sm leading-relaxed text-chalk/60">{r.v}</span>
                </li>
              ))}
            </ul>
          </Card>
          </TiltCard>
          </Reveal>

          <Reveal delay={90}>
          <Card interactive={false} className="p-5 ring-1 ring-warn/25">
            <p className="font-display text-base font-bold text-warn">Two cameras, two truths</p>
            <p className="mt-2 text-sm leading-relaxed text-chalk/65">
              Action measures how the ball is thrown (sequence, brace, stride, elbow, release).
              Stump-calibrated ICC speed lives on Ball flight — we will not paste that number onto a
              clip filmed for mechanics.
            </p>
          </Card>
          </Reveal>

          <Reveal delay={180}>
          <TiltCard>
          <Card interactive={false} className="ring-glow p-5">
            <h2 className="font-display text-base font-bold text-chalk">Film it this way</h2>
            <ul className="mt-3 flex flex-col gap-2.5">
              {FILMING.map((t, i) => (
                <li key={t} className="flex items-start gap-2.5 text-sm leading-relaxed text-chalk/65">
                  <span
                    className="animate-pop-in mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-lime/15 text-[10px] font-extrabold text-lime"
                    style={{ animationDelay: `${i * 90}ms` }}
                  >
                    {i + 1}
                  </span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <Button to="/record" variant="secondary" size="sm" className="mt-4">
              Read the filming guide
              <span aria-hidden>→</span>
            </Button>
          </Card>
          </TiltCard>
          </Reveal>

          <Reveal delay={270}>
          <div className="relative h-48 overflow-hidden rounded-[var(--radius-card)] border border-white/10 sm:h-60">
            <img
              src="/hero-bowling.jpg"
              alt="Cricket pitch ready for bowling analysis"
              className="h-full w-full object-cover opacity-80"
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night via-night/45 to-transparent"
              aria-hidden
            />
            <p className="absolute inset-x-4 bottom-4 font-display text-sm font-bold text-chalk sm:text-base">
              Side-on · Stable camera · Full body in frame
            </p>
          </div>
          </Reveal>
        </div>
      </div>
    </div>
  )
}

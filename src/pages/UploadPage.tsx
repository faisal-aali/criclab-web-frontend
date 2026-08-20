import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { uploadVideo } from '../api/client'

const PROFILE_KEY = 'criclab.playerProfile'

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
      navigate(`/processing/${res.job_id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
      <div className="animate-rise">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-seam">Action · mechanics lab</p>
        <h1 className="font-display mt-3 text-5xl font-bold leading-[1.12] tracking-normal sm:text-6xl">
          <span className="text-pitch">Analyze the</span>{' '}
          <span className="bg-gradient-to-r from-seam to-ball bg-clip-text pr-1 text-transparent">action</span>
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-pitch/75">
          Body mechanics from a <span className="font-semibold text-pitch">side-on</span> clip. Ball km/h here is 2D +
          your height — not a speed gun. For broadcast-style speed, line and length, use{' '}
          <Link className="font-semibold text-seam underline" to="/ball-flight">
            Ball flight
          </Link>
          .
        </p>
        <ul className="mt-6 space-y-2 text-sm text-pitch/70">
          <li>
            <span className="font-semibold text-pitch">Height</span> — converts pixels into km/h and metres. Wrong
            height means wrong speed.
          </li>
          <li>
            <span className="font-semibold text-pitch">Bowling arm</span> — we track that wrist, not the front arm
          </li>
          <li>
            <span className="font-semibold text-pitch">Age, weight, style</span> — used in the coaching report only
          </li>
        </ul>
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          <p className="font-semibold">Two cameras, two truths</p>
          <p className="mt-1 text-amber-900/80">
            Action measures how the ball is thrown (sequence, brace, stride, elbow, release). Stump-calibrated ICC
            speed lives on Ball flight — we will not paste that number onto a front-on pose job.
          </p>
        </div>
        <div className="mt-4 rounded-2xl border border-pitch/10 bg-white/70 p-4 text-sm text-pitch/75">
          <p className="font-semibold text-pitch">Film it this way</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Side-on camera, tripod or stable phone</li>
            <li>Full body in frame from run-up through follow-through</li>
            <li>Ball visible in the air after it leaves the hand (needed for a 2D ball-speed estimate)</li>
          </ul>
        </div>
        <div className="relative mt-8 h-56 overflow-hidden rounded-3xl border border-pitch/10 shadow-lg sm:h-72">
          <img
            src="/hero-bowling.jpg"
            alt="Cricket pitch ready for bowling analysis"
            className="h-full w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-pitch-deep/65 via-pitch-deep/25 to-transparent" />
          <p className="absolute bottom-4 left-4 font-display text-lg font-bold text-white drop-shadow">
            Side-on · Stable camera · Full body in frame
          </p>
        </div>
      </div>

      <form
        onSubmit={onSubmit}
        className="animate-rise rounded-3xl border border-pitch/10 bg-white/80 p-6 shadow-xl backdrop-blur"
        style={{ animationDelay: '80ms' }}
      >
        <h2 className="font-display text-2xl font-bold text-pitch">Bowler profile</h2>
        <p className="mt-1 text-sm text-pitch/60">Required before we can measure this video correctly.</p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-pitch">First name</label>
            <input
              required
              className="mt-1 w-full rounded-xl border border-pitch/15 bg-white px-3 py-2.5 outline-none ring-seam/40 focus:ring-2"
              value={profile.firstName}
              onChange={(e) => setField('firstName', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-pitch">Last name</label>
            <input
              required
              className="mt-1 w-full rounded-xl border border-pitch/15 bg-white px-3 py-2.5 outline-none ring-seam/40 focus:ring-2"
              value={profile.lastName}
              onChange={(e) => setField('lastName', e.target.value)}
            />
          </div>
        </div>

        <label className="mt-4 block text-sm font-medium text-pitch">Date of birth</label>
        <input
          required
          type="date"
          className="mt-1 w-full rounded-xl border border-pitch/15 bg-white px-3 py-2.5 outline-none ring-seam/40 focus:ring-2"
          value={profile.dob}
          onChange={(e) => setField('dob', e.target.value)}
        />

        <div className="mt-4 grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-pitch">Height (ft)</label>
            <input
              required
              inputMode="numeric"
              className="mt-1 w-full rounded-xl border border-pitch/15 bg-white px-3 py-2.5 outline-none ring-seam/40 focus:ring-2"
              value={profile.heightFt}
              onChange={(e) => setField('heightFt', e.target.value)}
              placeholder="5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-pitch">Height (in)</label>
            <input
              inputMode="numeric"
              className="mt-1 w-full rounded-xl border border-pitch/15 bg-white px-3 py-2.5 outline-none ring-seam/40 focus:ring-2"
              value={profile.heightIn}
              onChange={(e) => setField('heightIn', e.target.value)}
              placeholder="10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-pitch">Weight (lbs)</label>
            <input
              required
              inputMode="decimal"
              className="mt-1 w-full rounded-xl border border-pitch/15 bg-white px-3 py-2.5 outline-none ring-seam/40 focus:ring-2"
              value={profile.weightLbs}
              onChange={(e) => setField('weightLbs', e.target.value)}
              placeholder="165"
            />
          </div>
        </div>
        {heightM ? (
          <p className="mt-1 text-xs text-pitch/55">
            {heightM.toFixed(2)} m — used to convert pixels into km/h and metres
          </p>
        ) : null}

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-pitch">Bowling arm</label>
            <select
              required
              className="mt-1 w-full rounded-xl border border-pitch/15 bg-white px-3 py-2.5 outline-none ring-seam/40 focus:ring-2"
              value={profile.bowlingArm}
              onChange={(e) => setField('bowlingArm', e.target.value as SavedProfile['bowlingArm'])}
            >
              <option value="">Select</option>
              <option value="right">Right-arm</option>
              <option value="left">Left-arm</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-pitch">Bowling style</label>
            <select
              required
              className="mt-1 w-full rounded-xl border border-pitch/15 bg-white px-3 py-2.5 outline-none ring-seam/40 focus:ring-2"
              value={profile.bowlingStyle}
              onChange={(e) => setField('bowlingStyle', e.target.value as SavedProfile['bowlingStyle'])}
            >
              <option value="">Select</option>
              <option value="pace">Pace</option>
              <option value="medium">Medium</option>
              <option value="spin">Spin</option>
            </select>
          </div>
        </div>

        <label className="mt-5 block text-sm font-medium text-pitch">Bowling video</label>
        <p className="mt-0.5 text-xs text-pitch/50">MP4, MOV, or WebM · one delivery, side-on</p>
        <input
          required
          type="file"
          accept="video/mp4,video/quicktime,video/webm,video/x-msvideo,.mp4,.mov,.webm,.avi,.mkv"
          className="mt-1 block w-full text-sm text-pitch/80 file:mr-3 file:rounded-lg file:border-0 file:bg-pitch file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        {file ? <p className="mt-2 text-xs text-pitch/55">{file.name}</p> : null}
        {previewUrl ? (
          <div className="mt-3 overflow-hidden rounded-2xl border border-pitch/10 bg-black">
            <p className="border-b border-white/10 bg-pitch-deep px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white/70">
              Before · your upload
            </p>
            <video className="aspect-video w-full object-contain" src={previewUrl} controls playsInline />
          </div>
        ) : null}

        <details className="mt-4 rounded-xl bg-mist/80 p-3 text-sm text-pitch/70">
          <summary className="cursor-pointer font-medium text-pitch">Advanced scale (optional)</summary>
          <div className="mt-3">
            <label className="block text-xs font-medium">Meters per pixel</label>
            <input
              className="mt-1 w-full rounded-lg border border-pitch/15 px-3 py-2"
              value={metersPerPixel}
              onChange={(e) => setMetersPerPixel(e.target.value)}
              placeholder="e.g. 0.008 — overrides height if set"
              inputMode="decimal"
            />
          </div>
        </details>

        {error ? <p className="mt-4 text-sm text-ball">{error}</p> : null}
        {!ready && !error ? (
          <p className="mt-4 text-xs text-pitch/55">Still needed: {blockers.join(', ')}.</p>
        ) : null}

        <button
          type="submit"
          disabled={busy || !ready}
          className="mt-6 w-full rounded-xl bg-pitch px-4 py-3 font-semibold text-white transition hover:bg-pitch-deep disabled:opacity-60"
        >
          {busy ? 'Uploading…' : ready ? 'Analyze delivery' : 'Complete player details to continue'}
        </button>
      </form>
    </section>
  )
}

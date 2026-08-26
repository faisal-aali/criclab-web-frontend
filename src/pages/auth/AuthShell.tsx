/**
 * Shared frame and form parts for the authentication screens.
 *
 * A split layout: the form on the left, and on the right a floodlit panel that
 * carries the same product story as the marketing site. The point is that
 * signing in should not feel like leaving CricLab for an admin tool.
 */
import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CricLabMark } from '../../components/site/SiteHeader'
import { Backdrop } from '../../components/site/ui'
import { SeamBall, StadiumAtmosphere } from '../../components/site/visuals'

export function AuthShell({
  title,
  lead,
  children,
  footer,
  aside,
}: {
  title: string
  lead?: ReactNode
  children: ReactNode
  footer?: ReactNode
  aside?: { heading: string; points: string[] }
}) {
  const { pathname } = useLocation()
  useEffect(() => {
    document.title = `${title} — CricLab`
  }, [title, pathname])

  return (
    <div className="grid min-h-screen bg-night lg:grid-cols-[1fr_0.9fr]">
      {/* form */}
      <div className="flex flex-col px-6 py-10 sm:px-12 lg:px-16">
        <Link to="/" className="inline-flex text-chalk transition hover:opacity-85">
          <CricLabMark />
        </Link>
        <div className="flex flex-1 items-center py-10">
          <div className="w-full max-w-md">
            <h1 className="font-display text-3xl font-extrabold leading-tight text-chalk sm:text-4xl">
              {title}
            </h1>
            {lead ? <p className="pt-3 text-sm leading-relaxed text-chalk/60">{lead}</p> : null}
            <div className="pt-8">{children}</div>
            {footer ? <div className="pt-7 text-sm text-chalk/55">{footer}</div> : null}
          </div>
        </div>
        <p className="text-[11px] text-chalk/35">
          By continuing you agree to our{' '}
          <Link to="/terms" className="underline hover:text-chalk/70">
            terms
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="underline hover:text-chalk/70">
            privacy policy
          </Link>
          .
        </p>
      </div>

      {/* story panel — hidden on small screens where it would just push the form down */}
      <div className="relative hidden overflow-hidden border-l border-white/8 lg:block">
        <Backdrop plate="stadium" scrim="dark-soft" parallax={0} />
        <StadiumAtmosphere />
        <div className="relative flex h-full flex-col justify-center gap-8 px-14">
          <SeamBall size={72} className="animate-bob" />
          <h2 className="font-display text-3xl font-extrabold leading-tight text-chalk">
            {aside?.heading ?? 'Every delivery, measured.'}
          </h2>
          <ul className="flex flex-col gap-4">
            {(
              aside?.points ?? [
                'One phone clip becomes a marked-up delivery',
                'Numbers that say how confident they are',
                'A written read on what to work on next',
              ]
            ).map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm text-chalk/70">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-lime/15 text-[11px] font-bold text-lime">
                  ✓
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Form parts                                                                  */
/* -------------------------------------------------------------------------- */

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string
  hint?: ReactNode
  error?: string
  children: ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-baseline justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-chalk/55">{label}</span>
        {hint}
      </span>
      {children}
      {error ? (
        <span role="alert" className="text-xs font-medium text-bad">
          {error}
        </span>
      ) : null}
    </label>
  )
}

export function AuthAlert({ tone, children }: { tone: 'error' | 'ok' | 'info'; children: ReactNode }) {
  const tones = {
    error: 'border-bad/30 bg-bad/10 text-bad',
    ok: 'border-ok/30 bg-ok/10 text-ok',
    info: 'border-lime/25 bg-lime/8 text-lime',
  }
  return (
    <div role="alert" className={`rounded-xl border px-4 py-3 text-sm ${tones[tone]}`}>
      {children}
    </div>
  )
}

export function SubmitButton({
  busy,
  children,
  disabled,
}: {
  busy: boolean
  children: ReactNode
  disabled?: boolean
}) {
  return (
    <button
      type="submit"
      disabled={busy || disabled}
      className="sweep-on-hover inline-flex w-full items-center justify-center gap-2 rounded-full bg-lime px-6 py-3.5 text-sm font-bold text-night shadow-[0_12px_34px_-12px_rgba(182,242,74,0.75)] transition hover:bg-[#c6ff62] disabled:cursor-not-allowed disabled:opacity-55"
    >
      {busy ? (
        <>
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-night/30 border-t-night" />
          Working…
        </>
      ) : (
        children
      )}
    </button>
  )
}

/**
 * Six single-character inputs that behave like one field: typing advances,
 * backspace retreats, and a pasted code fills the whole row.
 */
export function OtpInput({
  value,
  onChange,
  disabled,
  length = 6,
}: {
  value: string
  onChange: (next: string) => void
  disabled?: boolean
  length?: number
}) {
  const [focus, setFocus] = useState(-1)
  const chars = value.padEnd(length).slice(0, length).split('')

  const setAt = (index: number, char: string) => {
    const next = chars.slice()
    next[index] = char
    onChange(next.join('').replace(/\s/g, ''))
  }

  return (
    <div className="flex gap-2" role="group" aria-label="Verification code">
      {chars.map((char, i) => (
        <input
          key={i}
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          disabled={disabled}
          aria-label={`Digit ${i + 1}`}
          value={char.trim()}
          onFocus={() => setFocus(i)}
          onBlur={() => setFocus(-1)}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, '')
            if (!digits) {
              setAt(i, ' ')
              return
            }
            if (digits.length > 1) {
              // A paste: fill from here and jump to the end.
              onChange((value.slice(0, i) + digits).slice(0, length))
              const target = Math.min(i + digits.length, length - 1)
              document.querySelectorAll<HTMLInputElement>('[aria-label^="Digit"]')[target]?.focus()
              return
            }
            setAt(i, digits)
            document.querySelectorAll<HTMLInputElement>('[aria-label^="Digit"]')[i + 1]?.focus()
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !char.trim() && i > 0) {
              document.querySelectorAll<HTMLInputElement>('[aria-label^="Digit"]')[i - 1]?.focus()
            }
          }}
          className={`h-14 w-full rounded-xl border bg-white/5 text-center font-display text-2xl font-extrabold text-chalk transition ${
            focus === i ? 'border-lime shadow-[0_0_0_4px_rgba(182,242,74,0.18)]' : 'border-white/14'
          } disabled:opacity-50`}
        />
      ))}
    </div>
  )
}

/** Counts down, then offers the action again. Used for "resend code". */
export function ResendTimer({
  seconds,
  onResend,
  busy,
}: {
  seconds: number
  onResend: () => void
  busy: boolean
}) {
  const [left, setLeft] = useState(seconds)
  useEffect(() => {
    setLeft(seconds)
  }, [seconds])
  useEffect(() => {
    if (left <= 0) return
    const t = setTimeout(() => setLeft((v) => v - 1), 1000)
    return () => clearTimeout(t)
  }, [left])

  if (left > 0) {
    return <span className="text-xs text-chalk/40">Resend available in {left}s</span>
  }
  return (
    <button
      type="button"
      onClick={onResend}
      disabled={busy}
      className="text-xs font-semibold text-lime transition hover:text-chalk disabled:opacity-50"
    >
      {busy ? 'Sending…' : 'Resend code'}
    </button>
  )
}

/** Guards against a double submit while a request is in flight. */
export function useSubmit<T>(fn: () => Promise<T>) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const run = async (e?: FormEvent) => {
    e?.preventDefault()
    if (busy) return
    setBusy(true)
    setError('')
    try {
      await fn()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }
  return { busy, error, setError, run }
}

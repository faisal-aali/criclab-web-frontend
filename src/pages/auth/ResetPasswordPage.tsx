import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { auth } from '../../api/auth'
import { AuthAlert, AuthShell, Field, OtpInput, ResendTimer, SubmitButton, useSubmit } from './AuthShell'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation() as { state?: { email?: string } }
  const [email, setEmail] = useState(location.state?.email || '')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [notice, setNotice] = useState('')
  const [resendBusy, setResendBusy] = useState(false)
  const [cooldown, setCooldown] = useState(45)

  useEffect(() => {
    if (!location.state?.email) setNotice('Enter the address you asked to reset.')
  }, [location.state])

  const strong = useMemo(
    () => password.length >= 8 && /[a-z]/i.test(password) && /\d/.test(password),
    [password],
  )

  const { busy, error, setError, run } = useSubmit(async () => {
    await auth.resetPassword(email.trim(), code, password)
    navigate('/login', { replace: true, state: { justReset: true } })
  })

  const resend = async () => {
    setResendBusy(true)
    setError('')
    try {
      const r = await auth.resendOtp(email.trim(), 'reset_password')
      setNotice(r.message)
      setCooldown(45)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send a new code')
    } finally {
      setResendBusy(false)
    }
  }

  return (
    <AuthShell
      title="Set a new password"
      lead="Enter the code we emailed you, then choose a new password."
      footer={<><Link to="/forgot-password" className="font-semibold text-lime hover:text-chalk">Start over</Link></>}
      aside={{
        heading: 'Choose something only you would pick.',
        points: ['At least 8 characters', 'A letter and a number', 'Not the name of the product'],
      }}
    >
      <form onSubmit={run} className="flex flex-col gap-5" noValidate>
        {error ? <AuthAlert tone="error">{error}</AuthAlert> : null}
        {!error && notice ? <AuthAlert tone="info">{notice}</AuthAlert> : null}

        <Field label="Email">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@club.com"
            className="field field-dark"
          />
        </Field>

        <Field label="Reset code">
          <OtpInput value={code} onChange={setCode} disabled={busy} />
        </Field>

        <div className="-mt-2 flex justify-end">
          <ResendTimer seconds={cooldown} onResend={resend} busy={resendBusy} />
        </div>

        <Field label="New password" error={password && !strong ? 'Use 8+ characters with a letter and a number' : undefined}>
          <div className="relative">
            <input
              type={show ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              className="field field-dark pr-16"
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold uppercase tracking-wider text-chalk/45 hover:text-lime"
            >
              {show ? 'Hide' : 'Show'}
            </button>
          </div>
        </Field>

        <SubmitButton busy={busy} disabled={!email || code.replace(/\D/g, '').length < 6 || !strong}>
          Update password
        </SubmitButton>
      </form>
    </AuthShell>
  )
}

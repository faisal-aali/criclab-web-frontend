import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { auth } from '../../api/auth'
import { useAuth } from '../../auth/AuthProvider'
import { AuthAlert, AuthShell, OtpInput, ResendTimer, SubmitButton, useSubmit } from './AuthShell'

export function VerifyEmailPage() {
  const navigate = useNavigate()
  const { adopt, user } = useAuth()
  const location = useLocation() as { state?: { email?: string; message?: string } }
  // The address comes from wherever we arrived from; falling back to the signed-in
  // user covers a half-finished signup reopened later.
  const email = location.state?.email || user?.email || ''
  const [code, setCode] = useState('')
  const [notice, setNotice] = useState(location.state?.message || '')
  const [resendBusy, setResendBusy] = useState(false)
  const [cooldown, setCooldown] = useState(45)

  useEffect(() => {
    if (!email) navigate('/signup', { replace: true })
  }, [email, navigate])

  const { busy, error, setError, run } = useSubmit(async () => {
    const result = await auth.verifyEmail(email, code)
    adopt(result)
    navigate('/app', { replace: true })
  })

  const resend = async () => {
    setResendBusy(true)
    setError('')
    try {
      const r = await auth.resendOtp(email, 'verify_email')
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
      title="Confirm your email"
      lead={<>We sent a 6-digit code to <span className="font-semibold text-chalk">{email}</span>. Enter it below to finish setting up your account.</>}
      footer={<><Link to="/login" className="font-semibold text-lime hover:text-chalk">Back to sign in</Link></>}
      aside={{
        heading: 'One code and you are in.',
        points: ['Codes last 10 minutes', 'Five attempts per code', 'Check spam if it has not arrived'],
      }}
    >
      <form onSubmit={run} className="flex flex-col gap-5" noValidate>
        {error ? <AuthAlert tone="error">{error}</AuthAlert> : null}
        {!error && notice ? <AuthAlert tone="info">{notice}</AuthAlert> : null}

        <OtpInput value={code} onChange={setCode} disabled={busy} />

        <div className="flex items-center justify-between">
          <span className="text-xs text-chalk/40">Did not get it?</span>
          <ResendTimer seconds={cooldown} onResend={resend} busy={resendBusy} />
        </div>

        <SubmitButton busy={busy} disabled={code.replace(/\D/g, '').length < 6}>
          Confirm email
        </SubmitButton>
      </form>
    </AuthShell>
  )
}

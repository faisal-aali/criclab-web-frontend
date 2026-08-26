import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { auth } from '../../api/auth'
import { useAuth } from '../../auth/AuthProvider'
import { AuthAlert, AuthShell, Field, SubmitButton, useSubmit } from './AuthShell'

export function LoginPage() {
  const { adopt } = useAuth()
  const navigate = useNavigate()
  const location = useLocation() as { state?: { from?: string; justReset?: boolean } }
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const { busy, error, run } = useSubmit(async () => {
    const result = await auth.signIn(email.trim(), password)
    if (result.status === 'pending_verification') {
      // Valid credentials, unconfirmed address — carry the email forward so the
      // verification screen does not ask for it again.
      navigate('/verify-email', { state: { email: result.email, message: result.message } })
      return
    }
    adopt(result)
    navigate(location.state?.from || '/app', { replace: true })
  })

  return (
    <AuthShell
      title="Sign in to CricLab"
      lead="Pick up where you left off — your sessions, analyses and bookings are waiting."
      footer={
        <>
          New to CricLab?{' '}
          <Link to="/signup" className="font-semibold text-lime hover:text-chalk">
            Create an account
          </Link>
        </>
      }
      aside={{
        heading: 'Your sessions, side by side.',
        points: [
          'Every delivery you have analysed, kept',
          'Compare this month against last',
          'Book a coach and track what changed',
        ],
      }}
    >
      <form onSubmit={run} className="flex flex-col gap-5" noValidate>
        {location.state?.justReset ? (
          <AuthAlert tone="ok">Password updated. Sign in with your new password.</AuthAlert>
        ) : null}
        {error ? <AuthAlert tone="error">{error}</AuthAlert> : null}

        <Field label="Email">
          <input
            type="email"
            required
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@club.com"
            className="field field-dark"
          />
        </Field>

        <Field
          label="Password"
          hint={
            <Link to="/forgot-password" className="text-xs font-semibold text-lime hover:text-chalk">
              Forgot?
            </Link>
          }
        >
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              className="field field-dark pr-16"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold uppercase tracking-wider text-chalk/45 hover:text-lime"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </Field>

        <SubmitButton busy={busy} disabled={!email || !password}>
          Sign in
        </SubmitButton>
      </form>
    </AuthShell>
  )
}

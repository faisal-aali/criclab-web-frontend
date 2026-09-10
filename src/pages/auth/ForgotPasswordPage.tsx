import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { auth } from '../../api/auth'
import { AuthAlert, AuthShell, Field, SubmitButton, useSubmit } from './AuthShell'

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')

  const { busy, error, run } = useSubmit(async () => {
    await auth.forgotPassword(email.trim())
    // The API answers the same whether or not the address is known, so the next
    // screen is shown either way — it must not become a membership check.
    navigate('/reset-password', { state: { email: email.trim() } })
  })

  return (
    <AuthShell
      title="Reset your password"
      lead="Enter the address on your account and we will send a 6-digit code."
      footer={<>Remembered it? <Link to="/login" className="font-semibold text-lime hover:text-chalk">Sign in</Link></>}
      aside={{
        heading: 'Back in, in a minute.',
        points: ['A code, not a link you have to hunt for', 'Codes expire after 10 minutes', 'Resetting signs you out everywhere'],
      }}
    >
      <form onSubmit={run} className="flex flex-col gap-5" noValidate>
        {error ? <AuthAlert tone="error">{error}</AuthAlert> : null}
        <Field label="Email">
          <input
            type="email"
            required
            autoFocus
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@club.com"
            className="field field-dark"
          />
        </Field>
        <SubmitButton busy={busy} disabled={!email}>Send reset code</SubmitButton>
      </form>
    </AuthShell>
  )
}

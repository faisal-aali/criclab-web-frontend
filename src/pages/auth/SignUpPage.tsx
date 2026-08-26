import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { auth } from '../../api/auth'
import { AuthAlert, AuthShell, Field, SubmitButton, useSubmit } from './AuthShell'

/**
 * Mirrors the server's rules so the user is told before submitting rather than
 * after. The server still enforces them — this is guidance, not the gate.
 */
function passwordChecks(password: string) {
  const stem = password.toLowerCase().replace(/[0-9!@#$]+$/, '')
  const common = [
    'password', 'passw0rd', 'qwerty', 'qwertyui', 'letmein', 'welcome',
    'iloveyou', 'admin', 'abc', 'abcd', 'test', 'changeme', 'secret',
    'cricket', 'criclab', 'bowling', 'monkey', 'dragon', 'football',
  ]
  return [
    { label: 'At least 8 characters', ok: password.length >= 8 },
    { label: 'Contains a letter', ok: /[a-z]/i.test(password) },
    { label: 'Contains a number', ok: /\d/.test(password) },
    { label: 'Not an obvious guess', ok: password.length > 0 && !common.includes(stem) && !common.includes(password.toLowerCase()) },
  ]
}

export function SignUpPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const checks = useMemo(() => passwordChecks(password), [password])
  const strong = checks.every((c) => c.ok)

  const { busy, error, run } = useSubmit(async () => {
    const result = await auth.signUp(name.trim(), email.trim(), password)
    navigate('/verify-email', { state: { email: result.email, message: result.message } })
  })

  return (
    <AuthShell
      title="Create your CricLab account"
      lead="Film one delivery and see what a proper read looks like. No rig, no markers."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-lime hover:text-chalk">
            Sign in
          </Link>
        </>
      }
      aside={{
        heading: 'From a phone clip to a coaching plan.',
        points: [
          'Upload a delivery, get it marked up',
          'Measured numbers, with their confidence',
          'Drills matched to what the footage showed',
        ],
      }}
    >
      <form onSubmit={run} className="flex flex-col gap-5" noValidate>
        {error ? <AuthAlert tone="error">{error}</AuthAlert> : null}

        <Field label="Your name">
          <input
            required
            autoFocus
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Talha Khilji"
            className="field field-dark"
          />
        </Field>

        <Field label="Email">
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@club.com"
            className="field field-dark"
          />
        </Field>

        <Field label="Password">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Choose a strong password"
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

        {password ? (
          <ul className="-mt-1 grid grid-cols-2 gap-x-4 gap-y-1.5">
            {checks.map((c) => (
              <li
                key={c.label}
                className={`flex items-center gap-2 text-[11px] font-medium transition ${
                  c.ok ? 'text-ok' : 'text-chalk/40'
                }`}
              >
                <span
                  className={`grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full text-[8px] ${
                    c.ok ? 'bg-ok/20' : 'bg-white/10'
                  }`}
                >
                  {c.ok ? '✓' : ''}
                </span>
                {c.label}
              </li>
            ))}
          </ul>
        ) : null}

        <SubmitButton busy={busy} disabled={!name || !email || !strong}>
          Create account
        </SubmitButton>

        <p className="text-center text-xs text-chalk/40">
          We will send a 6-digit code to confirm your address.
        </p>
      </form>
    </AuthShell>
  )
}

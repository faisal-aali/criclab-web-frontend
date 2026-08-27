/**
 * Account settings: profile, password, and active devices.
 *
 * Changing a password ends every other session, so the API hands back a fresh
 * token pair — adopted here so the person who just changed it is not signed out
 * of the tab they are standing in.
 */
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../../api/auth'
import { useAuth } from '../../auth/AuthProvider'
import { useConfirm } from '../../components/site/ConfirmDialog'
import { Button, Card, Chip, Reveal } from '../../components/site/ui'
import { useToast } from '../../components/site/Toast'
import { useTheme, type ThemePreference } from '../../theme/ThemeProvider'

type Session = { id: string; device: string; created_at: string; last_used_at: string }

function Panel({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <Card tone="dark" interactive={false} className="p-6">
      <h2 className="font-display text-lg font-bold text-chalk">{title}</h2>
      {description ? <p className="pt-1.5 text-sm leading-relaxed text-chalk/55">{description}</p> : null}
      <div className="pt-5">{children}</div>
    </Card>
  )
}

function Banner({ tone, children }: { tone: 'ok' | 'error'; children: React.ReactNode }) {
  return (
    <div
      role="status"
      className={`rounded-xl border px-4 py-2.5 text-sm ${
        tone === 'ok' ? 'border-ok/30 bg-ok/10 text-ok' : 'border-bad/30 bg-bad/10 text-bad'
      }`}
    >
      {children}
    </div>
  )
}

export function AccountSettingsPage() {
  const { user, setUser, signOut, adopt } = useAuth()
  const { preference, setPreference } = useTheme()
  const navigate = useNavigate()
  const confirm = useConfirm()
  const toast = useToast()

  const [name, setName] = useState(user?.name ?? '')
  const [profileBusy, setProfileBusy] = useState(false)
  const [profileMsg, setProfileMsg] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)

  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [pwBusy, setPwBusy] = useState(false)
  const [pwMsg, setPwMsg] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)

  const [sessions, setSessions] = useState<Session[] | null>(null)

  useEffect(() => setName(user?.name ?? ''), [user?.name])

  const loadSessions = useCallback(async () => {
    try {
      const r = await auth.sessions()
      setSessions(r.items)
    } catch {
      setSessions([])
    }
  }, [])

  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (profileBusy) return
    setProfileBusy(true)
    setProfileMsg(null)
    try {
      const { user: updated } = await auth.updateMe({ name: name.trim() })
      setUser(updated)
      setProfileMsg({ tone: 'ok', text: 'Saved.' })
    } catch (err) {
      setProfileMsg({ tone: 'error', text: err instanceof Error ? err.message : 'Could not save' })
    } finally {
      setProfileBusy(false)
    }
  }

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pwBusy) return
    setPwBusy(true)
    setPwMsg(null)
    try {
      const result = await auth.changePassword(current, next)
      // Keeps this tab signed in; every other device is now signed out.
      adopt(result)
      setCurrent('')
      setNext('')
      setPwMsg({
        tone: 'ok',
        text: `Password updated. ${result.sessions_ended} other ${
          result.sessions_ended === 1 ? 'device was' : 'devices were'
        } signed out.`,
      })
      loadSessions()
    } catch (err) {
      setPwMsg({ tone: 'error', text: err instanceof Error ? err.message : 'Could not change password' })
    } finally {
      setPwBusy(false)
    }
  }

  if (!user) return null
  const strong = next.length >= 8 && /[a-z]/i.test(next) && /\d/.test(next)

  return (
    <div className="flex flex-col gap-7">
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-chalk">Account</h1>
            <p className="pt-1.5 text-sm text-chalk/55">
              Your details, your password, and where you are signed in.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Chip tone={user.email_verified ? 'ok' : 'warn'}>
              {user.email_verified ? 'Email confirmed' : 'Email not confirmed'}
            </Chip>
            {user.role === 'admin' ? <Chip tone="lime">Admin</Chip> : null}
          </div>
        </div>
      </Reveal>

      <Reveal delay={40}>
        <Panel
          title="Appearance"
          description="Light, dark, or match the device. Saved in this browser."
        >
          <div className="flex flex-wrap gap-2">
            {(
              [
                ['system', 'System'],
                ['light', 'Light'],
                ['dark', 'Dark'],
              ] as [ThemePreference, string][]
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setPreference(id)}
                aria-pressed={preference === id}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  preference === id
                    ? 'border-lime/50 bg-lime/15 text-lime'
                    : 'border-white/15 text-chalk/70 hover:border-white/30 hover:text-chalk'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </Panel>
      </Reveal>

      <div className="grid gap-5 lg:grid-cols-2">
        <Reveal>
          <Panel title="Your details" description="How your name appears on reports and bookings.">
            <form onSubmit={saveProfile} className="flex flex-col gap-4">
              {profileMsg ? <Banner tone={profileMsg.tone}>{profileMsg.text}</Banner> : null}
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-chalk/55">Name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="field field-dark"
                  required
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-chalk/55">Email</span>
                <input value={user.email} readOnly className="field field-dark opacity-60" />
                <span className="text-[11px] text-chalk/35">
                  Contact support to change the address on your account.
                </span>
              </label>
              <Button type="submit" size="sm" disabled={profileBusy || !name.trim()}>
                {profileBusy ? 'Saving…' : 'Save changes'}
              </Button>
            </form>
          </Panel>
        </Reveal>

        <Reveal delay={80}>
          <Panel
            title="Password"
            description="Changing it signs you out on every other device."
          >
            <form onSubmit={changePassword} className="flex flex-col gap-4">
              {pwMsg ? <Banner tone={pwMsg.tone}>{pwMsg.text}</Banner> : null}
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-chalk/55">
                  Current password
                </span>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                  className="field field-dark"
                  required
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-chalk/55">
                  New password
                </span>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={next}
                  onChange={(e) => setNext(e.target.value)}
                  className="field field-dark"
                  required
                />
                {next && !strong ? (
                  <span className="text-[11px] text-warn">
                    Use 8+ characters with a letter and a number
                  </span>
                ) : null}
              </label>
              <Button type="submit" size="sm" disabled={pwBusy || !current || !strong}>
                {pwBusy ? 'Updating…' : 'Update password'}
              </Button>
            </form>
          </Panel>
        </Reveal>

        <Reveal delay={160} className="lg:col-span-2">
          <Panel title="Signed in devices" description="End a session you do not recognise.">
            {sessions === null ? (
              <div className="flex flex-col gap-2">
                {[0, 1].map((i) => (
                  <div key={i} className="h-14 animate-pulse rounded-xl bg-white/5" />
                ))}
              </div>
            ) : sessions.length === 0 ? (
              <p className="text-sm text-chalk/45">No other active sessions.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {sessions.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-chalk">{s.device}</p>
                      <p className="text-[11px] text-chalk/40">
                        Last used {new Date(s.last_used_at).toLocaleString()}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        const ok = await confirm({
                          title: 'End this session?',
                          body: `${s.device} will be signed out immediately.`,
                          confirmLabel: 'End session',
                          tone: 'danger',
                        })
                        if (!ok) return
                        const worked = await auth.endSession(s.id).then(
                          () => true,
                          () => false,
                        )
                        toast.push(
                          worked ? 'Session ended.' : 'Could not end that session — try again.',
                          worked ? 'ok' : 'error',
                        )
                        loadSessions()
                      }}
                      className="shrink-0 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-chalk/70 transition hover:border-bad/50 hover:text-bad"
                    >
                      End
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-5 flex flex-wrap gap-2.5 border-t border-white/8 pt-5">
              <Button
                variant="secondary"
                size="sm"
                onClick={async () => {
                  const ok = await confirm({
                    title: 'Sign out everywhere?',
                    body: 'Every device signed in to this account — including this one — will be signed out immediately.',
                    confirmLabel: 'Sign out everywhere',
                    tone: 'danger',
                  })
                  if (!ok) return
                  await auth.signOutEverywhere().catch(() => undefined)
                  await signOut()
                  navigate('/login', { replace: true })
                }}
              >
                Sign out everywhere
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  await signOut()
                  navigate('/', { replace: true })
                }}
              >
                Sign out
              </Button>
            </div>
          </Panel>
        </Reveal>
      </div>
    </div>
  )
}

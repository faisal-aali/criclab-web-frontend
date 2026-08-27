/** Signed-in identity, account links and sign-out. */
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthProvider'

export function AccountMenu() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!user) return null
  const initials = (user.name || user.email).slice(0, 2).toUpperCase()

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Account menu"
        className="grid h-10 w-10 place-items-center rounded-xl border border-white/12 text-xs font-extrabold text-night transition hover:border-lime/40"
        style={{ background: user.avatar_color || '#b6f24a' }}
      >
        {initials}
      </button>

      {open ? (
        <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-2xl border border-white/12 bg-charcoal shadow-2xl shadow-black/50">
          <div className="border-b border-white/8 px-4 py-3.5">
            <p className="truncate text-sm font-bold text-chalk">{user.name}</p>
            <p className="truncate text-xs text-chalk/45">{user.email}</p>
            {!user.email_verified ? (
              <span className="mt-2 inline-flex rounded-full border border-warn/30 bg-warn/10 px-2 py-0.5 text-[10px] font-bold text-warn">
                Email not confirmed
              </span>
            ) : null}
          </div>
          <div className="flex flex-col py-1.5">
            {[
              ...(user.role === 'admin' ? [{ to: '/admin', label: 'Admin panel' }] : []),
              { to: '/app/settings', label: 'Account settings' },
              { to: '/app/history', label: 'Your sessions' },
              { to: '/app/support', label: 'Support' },
            ].map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="px-4 py-2.5 text-sm text-chalk/70 transition hover:bg-white/5 hover:text-chalk"
              >
                {l.label}
              </Link>
            ))}
          </div>
          <button
            type="button"
            onClick={async () => {
              setOpen(false)
              await signOut()
              navigate('/', { replace: true })
            }}
            className="w-full border-t border-white/8 px-4 py-3 text-left text-sm font-semibold text-bad transition hover:bg-bad/10"
          >
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  )
}

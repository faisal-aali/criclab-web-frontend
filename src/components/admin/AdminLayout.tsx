/**
 * Admin shell — deliberately its own layout, not the user workspace's.
 *
 * Sharing `Layout.tsx` would put "Users", "Broadcast", "Disable account" one
 * click away from the same sidebar a player uses to review a delivery. The
 * separation here is visual, matching the spec's "completely separate from
 * the normal user experience" — the actual boundary is the `RequireAdmin`
 * guard plus every backend endpoint depending on `AdminUser`, not this file.
 *
 * Written dark-first with no `dark:` variants, same convention as the user
 * workspace shell — see "Workspace theming" in the memory bank.
 */
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../auth/AuthProvider'
import { CricLabMark } from '../site/SiteHeader'
import { InstallAppButton } from '../site/InstallAppButton'

const NAV = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/analyses', label: 'Analyses' },
  { to: '/admin/drills', label: 'Drills' },
  { to: '/admin/coaching', label: 'Coaching' },
  { to: '/admin/tickets', label: 'Support' },
  { to: '/admin/notifications', label: 'Notifications' },
]

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  useEffect(() => setOpen(false), [location.pathname])

  const nav = (
    <nav className="flex flex-col gap-1">
      {NAV.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          end={l.end}
          className={({ isActive }) => {
            const onReports = l.to === '/admin/analyses' && location.pathname.startsWith('/admin/reports')
            const active = isActive || onReports
            return `rounded-lg px-3.5 py-2.5 text-sm font-semibold transition ${
              active ? 'bg-lime/12 text-lime' : 'text-chalk/60 hover:bg-white/5 hover:text-chalk'
            }`
          }}
        >
          {l.label}
        </NavLink>
      ))}
    </nav>
  )

  return (
    <div className="flex min-h-screen bg-charcoal text-chalk">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-white/8 bg-night/60 px-4 py-6 lg:flex">
        <Link to="/admin" className="flex items-center gap-2 px-1 pb-8">
          <CricLabMark />
          <span className="rounded-md border border-warn/30 bg-warn/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-warn">
            Admin
          </span>
        </Link>
        {nav}
        <div className="mt-auto flex flex-col gap-3 pt-6">
          <Link
            to="/app"
            className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-xs font-semibold text-chalk/60 transition hover:border-lime/30 hover:text-chalk"
          >
            ← Back to CricLab
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-white/8 bg-night/70 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-xl lg:hidden">
          <Link to="/admin" className="flex items-center gap-2">
            <CricLabMark />
            <span className="rounded-md border border-warn/30 bg-warn/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-warn">
              Admin
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <InstallAppButton compact />
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              className="grid h-10 w-10 place-items-center rounded-lg border border-white/15 bg-white/5"
            >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4.5 w-4.5">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
          </div>
        </header>
        {open ? <div className="border-b border-white/8 bg-night px-4 py-4 lg:hidden">{nav}</div> : null}

        <div className="hidden items-center justify-between border-b border-white/8 bg-night/40 px-8 py-3 lg:flex">
          <p className="text-xs text-chalk/40">Platform administration</p>
          <div className="flex items-center gap-3">
            <InstallAppButton />
            <p className="text-xs font-semibold text-chalk/70">{user?.name}</p>
          </div>
        </div>

        <main className="scroll-slim min-w-0 flex-1 bg-stadium px-4 py-7 sm:px-7 lg:px-9 lg:py-9">
          <div
            className={`mx-auto w-full ${
              location.pathname.startsWith('/admin/reports') ? 'max-w-7xl' : 'max-w-6xl'
            }`}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { CricLabMark } from './site/SiteHeader'
import { AccountMenu } from './app/AccountMenu'
import { NotificationBell } from './app/NotificationBell'
import { ThemeToggle } from './ThemeToggle'
import { InstallAppButton } from './site/InstallAppButton'

/**
 * Application shell.
 *
 * Written entirely in dark-first tokens — `text-chalk`, `bg-charcoal`,
 * `bg-white/5` — and never with `dark:` variants. Light mode is produced by
 * `.app-shell` in index.css remapping those tokens, which means a `dark:` pair
 * here would be applied *on top of* an already-remapped token and come out
 * inverted: `bg-chalk` would paint a dark surface under dark text.
 *
 * Deliberately darker and denser than the marketing site: this is a workspace
 * people sit in during a session, so the footage is the brightest thing on
 * screen and the chrome recedes. Same palette, type and motion language as the
 * public pages, so moving between them does not feel like two products.
 */

const NAV = [
  {
    to: '/app',
    label: 'Action',
    hint: 'Side-on mechanics',
    icon: (
      <path
        d="M12 3.5v5m0 0-3 3.5m3-3.5 3 3.5M7.5 20l2-5.5m7 5.5-2-5.5M12 3.5a1.5 1.5 0 1 0 0-.01Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    to: '/app/ball-flight',
    label: 'Ball flight',
    hint: 'Speed, line & length',
    icon: (
      <path
        d="M3 17c4-9 11-12 18-12M6 20h.01M9.5 20h.01M13 20h.01"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    to: '/app/train',
    label: 'Train',
    hint: 'Drill library',
    icon: (
      <path
        d="M4 9v6m16-6v6M7 7v10m10-10v10M10 12h4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    to: '/app/coaching',
    label: 'Coaching',
    hint: 'Book a session',
    icon: (
      <path
        d="M8 3v3m8-3v3M4 9h16M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Zm5.5 8 1.5 1.5 3-3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    to: '/app/history',
    label: 'History',
    hint: 'Past sessions',
    icon: (
      <path
        d="M12 7v5l3 2m6-2a9 9 0 1 1-3.2-6.9M21 3v4h-4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    to: '/app/leaderboard',
    label: 'Leaderboard',
    hint: 'Top 20 throws',
    icon: (
      <path
        d="M8 21h8M12 17v4M7 4h10v5a5 5 0 1 1-10 0V4Zm-3 2h3v4a3 3 0 0 1-3-3V6Zm16 0h-3v4a3 3 0 0 0 3-3V6Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    to: '/app/support',
    label: 'Support',
    hint: 'Ask for help',
    icon: (
      <path
        d="M12 3a7 7 0 0 0-7 7v4a3 3 0 0 0 3 3h1v-6H7v-1a5 5 0 0 1 10 0v1h-2v6h1a3 3 0 0 0 3-3v-4a7 7 0 0 0-7-7Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
]

const TITLES: [string, string][] = [
  ['/app/processing', 'Processing'],
  ['/app/results', 'Results'],
  ['/app/ball-flight/processing', 'Ball flight — processing'],
  ['/app/ball-flight/results', 'Ball flight — results'],
  ['/app/ball-flight', 'Ball flight'],
  ['/app/coaching', 'Coaching'],
  ['/app/support', 'Support'],
  ['/app/train', 'Train'],
  ['/app/leaderboard', 'Leaderboard'],
  ['/app/history', 'History'],
  ['/app/settings', 'Account'],
]

const TABS = [
  { to: '/app', label: 'Action', end: true },
  { to: '/app/ball-flight', label: 'Flight', end: false },
  { to: '/app/history', label: 'History', end: false },
  { to: '/app/train', label: 'Train', end: false },
]

function tabActive(to: string, pathname: string) {
  if (to === '/app') {
    return (
      pathname === '/app' ||
      pathname.startsWith('/app/processing') ||
      pathname.startsWith('/app/results')
    )
  }
  return pathname === to || pathname.startsWith(`${to}/`)
}

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const match = TITLES.find(([prefix]) => location.pathname.startsWith(prefix))
    document.title = `CricLab — ${match ? match[1] : 'Action'}`
  }, [location.pathname])

  useEffect(() => setOpen(false), [location.pathname])

  const nav = (
    <nav className="flex flex-col gap-1.5">
      {NAV.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          end={l.to === '/app'}
          className={({ isActive }) =>
            `group relative flex items-center gap-3 rounded-xl px-3.5 py-3 transition ${
              isActive
                ? 'bg-lime/12 text-lime'
                : 'text-chalk/60 hover:bg-white/5 hover:text-chalk'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={`absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-lime transition-all duration-300 ${
                  isActive ? 'opacity-100' : 'opacity-0'
                }`}
              />
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="h-5 w-5 shrink-0"
                aria-hidden
              >
                {l.icon}
              </svg>
              <span className="flex min-w-0 flex-col">
                <span className="text-sm font-semibold leading-tight">{l.label}</span>
                <span className="truncate text-[11px] text-current/55">{l.hint}</span>
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )

  return (
    <div className="app-shell flex min-h-dvh bg-charcoal text-chalk">
      {/* ---------------- Desktop sidebar ---------------- */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-white/8 bg-charcoal/80 px-4 py-6 lg:flex">
        <Link to="/" className="px-2 pb-8 text-chalk transition hover:opacity-85">
          <CricLabMark />
        </Link>
        {nav}
        <div className="mt-auto flex flex-col gap-3 pt-6">
          <Link
            to="/record"
            className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5 transition hover:border-lime/40"
          >
            <div className="text-xs font-bold uppercase tracking-[0.14em] text-lime">
              Filming guide
            </div>
            <p className="pt-1.5 text-[11px] leading-relaxed text-chalk/50">
              A better clip gives a better read. Two minutes well spent.
            </p>
          </Link>
          <Link
            to="/"
            className="px-2 text-[11px] font-semibold text-chalk/40 transition hover:text-chalk/70"
          >
            ← Back to criclab.com
          </Link>
        </div>
      </aside>

      {/* ---------------- Mobile header ---------------- */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-white/8 bg-charcoal/85 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-xl lg:hidden">
          <Link to="/" className="text-chalk">
            <CricLabMark />
          </Link>
          <div className="flex items-center gap-2">
            <InstallAppButton compact />
            <ThemeToggle variant="on-dark" />
            <NotificationBell />
            <AccountMenu />
          </div>
        </header>

        {open ? (
          <div className="border-b border-white/8 bg-charcoal px-4 py-4 lg:hidden">
            {nav}
            <Link
              to="/"
              className="mt-4 block px-2 text-[11px] font-semibold text-chalk/40"
            >
              ← Back to criclab.com
            </Link>
          </div>
        ) : null}

        <div className="sticky top-0 z-30 hidden items-center justify-end gap-2.5 border-b border-white/8 bg-charcoal/80 px-9 py-3 backdrop-blur-xl lg:flex">
          <InstallAppButton />
          <ThemeToggle variant="on-dark" />
          <NotificationBell />
          <AccountMenu />
        </div>

        <main className="scroll-slim min-w-0 flex-1 bg-stadium px-4 py-7 pb-[calc(6.5rem+env(safe-area-inset-bottom))] sm:px-7 lg:px-9 lg:py-10 lg:pb-10">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>

        <nav
          className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-white/10 bg-charcoal/95 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-xl lg:hidden"
          aria-label="Primary"
        >
          {TABS.map((t) => {
            const item = NAV.find((n) => n.to === t.to)
            const active = tabActive(t.to, location.pathname)
            return (
              <NavLink
                key={t.to}
                to={t.to}
                end={t.end}
                className={`flex min-h-12 flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-semibold ${
                  active ? 'text-lime' : 'text-chalk/50'
                }`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden>
                  {item?.icon}
                </svg>
                {t.label}
              </NavLink>
            )
          })}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'More'}
            aria-expanded={open}
            className={`flex min-h-12 flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-semibold ${
              open ? 'text-lime' : 'text-chalk/50'
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden>
              <path d="M5 7h14M5 12h14M5 17h14" strokeLinecap="round" />
            </svg>
            More
          </button>
        </nav>

        <footer className="hidden border-t border-white/8 bg-charcoal/60 px-5 py-4 lg:block">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 text-[11px] text-chalk/55">
            <span>CricLab — the cricket performance lab</span>
            <span>
              Measured estimates from your footage. A coaching tool, not officiating
              equipment.
            </span>
          </div>
        </footer>
      </div>
    </div>
  )
}

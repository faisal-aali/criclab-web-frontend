import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { CricLabMark } from './site/SiteHeader'
import { AccountMenu } from './app/AccountMenu'
import { NotificationBell } from './app/NotificationBell'
import { ProcessingIndicator } from './app/ProcessingIndicator'
import { ThemeToggle } from './ThemeToggle'
import { InstallAppButton } from './site/InstallAppButton'
import {
  itemCoversPath,
  visibleWorkspaceNav,
  workspaceMobileTabs,
} from '../config/nav'
import { navIcon } from '../config/navIcons'

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
 *
 * Sidebar items, mobile tabs, and labels come from `src/config/nav.workspace.json`.
 */

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
  ['/app/action', 'Action'],
  ['/app/settings', 'Account'],
]

const MOBILE_NAV_COLS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
}

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const navItems = visibleWorkspaceNav()
  const tabs = workspaceMobileTabs()
  const tabColumns = Math.min(5, Math.max(1, tabs.length + 1))

  useEffect(() => {
    const match = TITLES.find(([prefix]) => location.pathname.startsWith(prefix))
    document.title = `CricLab — ${match ? match[1] : 'Action'}`
  }, [location.pathname])

  useEffect(() => setOpen(false), [location.pathname])

  const nav = (
    <nav className="flex flex-col gap-1.5">
      {navItems.map((item) => {
        const active = itemCoversPath(item, location.pathname)
        return (
          <NavLink
            key={item.id}
            to={item.path}
            end={item.end === true}
            className={`group relative flex items-center gap-3 rounded-xl px-3.5 py-3 transition ${
              active
                ? 'bg-lime/12 text-lime'
                : 'text-chalk/60 hover:bg-white/5 hover:text-chalk'
            }`}
          >
            <span
              className={`absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-lime transition-all duration-300 ${
                active ? 'opacity-100' : 'opacity-0'
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
              {navIcon(item.icon)}
            </svg>
            <span className="flex min-w-0 flex-col">
              <span className="text-sm font-semibold leading-tight">{item.name}</span>
              <span className="truncate text-[11px] text-current/55">{item.hint}</span>
            </span>
          </NavLink>
        )
      })}
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
            <ProcessingIndicator />
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
          <ProcessingIndicator />
          <NotificationBell />
          <AccountMenu />
        </div>

        <main className="scroll-slim min-w-0 flex-1 bg-stadium px-4 py-7 pb-[calc(6.5rem+env(safe-area-inset-bottom))] sm:px-7 lg:px-9 lg:py-10 lg:pb-10">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>

        <nav
          className={`fixed inset-x-0 bottom-0 z-40 grid ${MOBILE_NAV_COLS[tabColumns]} border-t border-white/10 bg-charcoal/95 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-xl lg:hidden`}
          aria-label="Primary"
        >
          {tabs.map((item) => {
            const active = itemCoversPath(item, location.pathname)
            return (
              <NavLink
                key={item.id}
                to={item.path}
                end={item.end === true}
                className={`flex min-h-12 flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-semibold ${
                  active ? 'text-lime' : 'text-chalk/50'
                }`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden>
                  {navIcon(item.icon)}
                </svg>
                {item.mobileName ?? item.name}
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

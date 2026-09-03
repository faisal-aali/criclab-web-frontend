import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../auth/AuthProvider'
import { visibleSiteHeaderNav } from '../../config/nav'
import { Button } from './ui'
import { ThemeToggle } from '../ThemeToggle'
import { InstallAppButton } from './InstallAppButton'

export function CricLabMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <img
        src="/icons/icon-192.png"
        alt=""
        width={36}
        height={36}
        className="h-9 w-9 rounded-[10px] shadow-[0_8px_22px_-8px_rgba(182,242,74,0.9)]"
      />
      {!compact && (
        <span className="font-display text-lg font-extrabold tracking-tight">
          Cric<span className="text-lime">Lab</span>
        </span>
      )}
    </span>
  )
}

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const { status, user } = useAuth()
  const signedIn = status === 'authenticated' && Boolean(user)
  const authReady = status !== 'loading'
  const navItems = visibleSiteHeaderNav()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the drawer on navigation, and stop the page scrolling behind it.
  useEffect(() => setOpen(false), [location.pathname])
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'border-b border-white/10 bg-night/80 backdrop-blur-xl supports-[backdrop-filter]:bg-night/65'
            : 'border-b border-transparent bg-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link to="/" className="text-chalk transition hover:opacity-85" aria-label="CricLab home">
            <CricLabMark />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.id}
                to={item.path}
                end={item.end === true}
                className={({ isActive }) =>
                  `relative rounded-full px-3.5 py-2 text-sm font-semibold transition ${
                    isActive ? 'text-lime' : 'text-chalk/70 hover:text-chalk'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {item.name}
                    <span
                      className={`absolute inset-x-3.5 -bottom-0.5 h-px origin-left bg-lime transition-transform duration-300 ${
                        isActive ? 'scale-x-100' : 'scale-x-0'
                      }`}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <InstallAppButton className="hidden md:inline-flex" />
            <ThemeToggle variant="on-dark" />
            {authReady ? (
              signedIn ? (
              <>
                {user?.role === 'admin' ? (
                  <Link
                    to="/admin"
                    className="hidden rounded-full px-3.5 py-2 text-sm font-semibold text-chalk/70 transition hover:text-chalk sm:block"
                  >
                    Admin
                  </Link>
                ) : null}
                <Button to="/app/action" size="sm" className="hidden sm:inline-flex">
                  Open workspace
                </Button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden rounded-full px-3.5 py-2 text-sm font-semibold text-chalk/70 transition hover:text-chalk sm:block"
                >
                  Sign in
                </Link>
                <Button to="/signup" size="sm" className="hidden sm:inline-flex">
                  Start Analyzing
                </Button>
              </>
            )
            ) : (
              <span className="hidden h-9 w-28 sm:block" aria-hidden />
            )}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              className="grid h-10 w-10 place-items-center rounded-xl border border-white/15 bg-white/5 text-chalk lg:hidden"
            >
              <span className="relative block h-4 w-5">
                <span
                  className={`absolute left-0 h-0.5 w-5 rounded bg-current transition-all duration-300 ${
                    open ? 'top-[7px] rotate-45' : 'top-0'
                  }`}
                />
                <span
                  className={`absolute left-0 top-[7px] h-0.5 w-5 rounded bg-current transition-all duration-200 ${
                    open ? 'opacity-0' : 'opacity-100'
                  }`}
                />
                <span
                  className={`absolute left-0 h-0.5 w-5 rounded bg-current transition-all duration-300 ${
                    open ? 'top-[7px] -rotate-45' : 'top-[14px]'
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-40 lg:hidden ${open ? '' : 'pointer-events-none'}`}
        aria-hidden={!open}
      >
        <div
          className={`absolute inset-0 bg-night/70 backdrop-blur-sm transition-opacity duration-300 ${
            open ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setOpen(false)}
        />
        <div
          className={`absolute inset-x-0 top-0 origin-top bg-stadium px-5 pb-8 pt-24 transition-all duration-400 ${
            open ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
          }`}
        >
          <nav className="flex flex-col gap-1">
            {navItems.map((item, i) => (
              <NavLink
                key={item.id}
                to={item.path}
                end={item.end === true}
                style={{ transitionDelay: open ? `${60 + i * 40}ms` : '0ms' }}
                className={({ isActive }) =>
                  `rounded-xl px-4 py-3.5 text-lg font-semibold transition-all duration-300 ${
                    open ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
                  } ${isActive ? 'bg-lime/10 text-lime' : 'text-chalk/80 hover:bg-white/5'}`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>
          <div className="mt-6 flex flex-col gap-3">
            <InstallAppButton size="lg" className="w-full" />
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <span className="text-sm font-semibold text-chalk/70">Appearance</span>
              <ThemeToggle variant="on-dark" />
            </div>
            {authReady ? (
              signedIn ? (
              <>
                <Button to="/app/action" size="lg">
                  Open workspace
                </Button>
                {user?.role === 'admin' ? (
                  <Button to="/admin" variant="secondary" size="lg">
                    Admin panel
                  </Button>
                ) : null}
              </>
            ) : (
              <>
                <Button to="/signup" size="lg">
                  Start Analyzing
                </Button>
                <Button to="/login" variant="secondary" size="lg">
                  Sign in
                </Button>
              </>
            )
            ) : null}
          </div>
        </div>
      </div>
    </>
  )
}

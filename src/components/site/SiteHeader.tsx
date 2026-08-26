import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Button } from './ui'

const NAV = [
  { to: '/', label: 'Home' },
  { to: '/features', label: 'Features' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/record', label: 'Record a Video' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export function CricLabMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-lime to-lime-deep shadow-[0_8px_22px_-8px_rgba(182,242,74,0.9)]">
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
          <circle cx="12" cy="12" r="9" fill="#05090a" />
          <path d="M6 6.5 Q12 12 6 17.5" fill="none" stroke="#b6f24a" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M18 6.5 Q12 12 18 17.5" fill="none" stroke="#b6f24a" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      </span>
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
            {NAV.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) =>
                  `relative rounded-full px-3.5 py-2 text-sm font-semibold transition ${
                    isActive ? 'text-lime' : 'text-chalk/70 hover:text-chalk'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {l.label}
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
            <Link
              to="/app"
              className="hidden rounded-full px-3.5 py-2 text-sm font-semibold text-chalk/70 transition hover:text-chalk sm:block"
            >
              Sign in
            </Link>
            <Button to="/app" size="sm" className="hidden sm:inline-flex">
              Start Analyzing
            </Button>
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
            {NAV.map((l, i) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                style={{ transitionDelay: open ? `${60 + i * 40}ms` : '0ms' }}
                className={({ isActive }) =>
                  `rounded-xl px-4 py-3.5 text-lg font-semibold transition-all duration-300 ${
                    open ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
                  } ${isActive ? 'bg-lime/10 text-lime' : 'text-chalk/80 hover:bg-white/5'}`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-6 flex flex-col gap-3">
            <Button to="/app" size="lg">
              Start Analyzing
            </Button>
            <Button to="/app" variant="secondary" size="lg">
              Sign in
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

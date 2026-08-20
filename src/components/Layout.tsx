import { NavLink, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Logo } from './Logo'

const links = [
  { to: '/', label: 'Action' },
  { to: '/ball-flight', label: 'Ball flight' },
  { to: '/train', label: 'Train' },
  { to: '/history', label: 'History' },
]

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  useEffect(() => {
    if (location.pathname.startsWith('/processing')) document.title = 'Cric-Lab — Processing'
    else if (location.pathname.startsWith('/results')) document.title = 'Cric-Lab — Results'
    else if (location.pathname.startsWith('/ball-flight')) document.title = 'Cric-Lab — Ball flight'
    else if (location.pathname.startsWith('/train')) document.title = 'Cric-Lab — Train'
    else if (location.pathname.startsWith('/history')) document.title = 'Cric-Lab — History'
    else document.title = 'Cric-Lab — Action'
  }, [location.pathname])

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-pitch/10 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <NavLink to="/" className="transition hover:opacity-80">
            <Logo />
          </NavLink>
          <nav className="flex items-center gap-1 rounded-full border border-pitch/10 bg-white/60 p-1 shadow-sm">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) =>
                  `rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-pitch text-white shadow'
                      : 'text-pitch/70 hover:bg-pitch/10 hover:text-pitch'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8">{children}</main>

      <footer className="border-t border-pitch/10 bg-white/50">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-5 py-4 text-xs text-pitch/55">
          <span>CricLab — AI cricket bowling laboratory</span>
          <span>Action is 2D mechanics. Ball flight is stump-calibrated pitch-plane speed — not a radar gun.</span>
        </div>
      </footer>
    </div>
  )
}

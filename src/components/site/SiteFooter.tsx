import { Link } from 'react-router-dom'
import { CricLabMark } from './SiteHeader'
import { Backdrop, Container } from './ui'
import { PitchFloor } from './visuals'

const COLUMNS: { title: string; links: { to: string; label: string }[] }[] = [
  {
    title: 'Product',
    links: [
      { to: '/features', label: 'Features' },
      { to: '/how-it-works', label: 'How It Works' },
      { to: '/record', label: 'Record a Video' },
      { to: '/pricing', label: 'Pricing' },
      { to: '/app', label: 'Open CricLab' },
    ],
  },
  {
    title: 'Company',
    links: [
      { to: '/about', label: 'About Us' },
      { to: '/careers', label: 'Careers' },
      { to: '/testimonials', label: 'Testimonials' },
      { to: '/contact', label: 'Contact' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { to: '/resources', label: 'Insights' },
      { to: '/faq', label: 'FAQ' },
      { to: '/record', label: 'Filming Guide' },
      { to: '/app/train', label: 'Drill Library' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { to: '/privacy', label: 'Privacy Policy' },
      { to: '/terms', label: 'Terms of Service' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-night text-chalk">
      <Backdrop plate="turf" scrim="dark" parallax={0.05} />
      <PitchFloor />
      <Container size="wide" className="relative py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2.6fr]">
          <div className="flex flex-col gap-5">
            <CricLabMark />
            <p className="max-w-sm text-sm leading-relaxed text-chalk/55">
              The cricket performance lab. Turn a phone video of a delivery into
              measured, coachable insight — for players, coaches, academies and
              teams.
            </p>
            <div className="flex gap-2.5">
              {['X', 'IG', 'YT', 'IN'].map((s) => (
                <a
                  key={s}
                  href="#"
                  aria-label={s}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-white/12 bg-white/5 text-xs font-bold text-chalk/60 transition hover:border-lime/50 hover:text-lime"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {COLUMNS.map((col) => (
              <div key={col.title} className="flex flex-col gap-3.5">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-lime/80">
                  {col.title}
                </h3>
                <ul className="flex flex-col gap-2.5">
                  {col.links.map((l) => (
                    <li key={l.to + l.label}>
                      <Link
                        to={l.to}
                        className="text-sm text-chalk/60 transition hover:text-chalk"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-7 text-xs text-chalk/45 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} CricLab. All rights reserved.</span>
          <span className="max-w-xl sm:text-right">
            CricLab reports measured estimates from the footage you provide. It is a
            coaching and performance tool, not officiating equipment.
          </span>
        </div>
      </Container>
    </footer>
  )
}

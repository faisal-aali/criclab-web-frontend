import { Link } from 'react-router-dom'
import { visibleSiteFooterColumns } from '../../config/nav'
import { CricLabMark } from './SiteHeader'
import { Backdrop, Container } from './ui'
import { PitchFloor } from './visuals'

export function SiteFooter() {
  const columns = visibleSiteFooterColumns()

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
            {columns.map((col) => (
              <div key={col.id} className="flex flex-col gap-3.5">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-lime/80">
                  {col.title}
                </h3>
                <ul className="flex flex-col gap-2.5">
                  {col.links.map((link) => (
                    <li key={link.id}>
                      <Link
                        to={link.path}
                        className="text-sm text-chalk/60 transition hover:text-chalk"
                      >
                        {link.name}
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

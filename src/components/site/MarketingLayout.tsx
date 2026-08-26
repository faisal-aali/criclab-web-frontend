import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'

/**
 * Shell for every public page. The header floats over the hero (which is why
 * each page opens with a dark section), so there is no top padding here —
 * pages own their own first-section spacing.
 */
export function MarketingLayout({
  children,
  title,
}: {
  children: React.ReactNode
  title?: string
}) {
  const { pathname } = useLocation()

  useEffect(() => {
    document.title = title ? `${title} — CricLab` : 'CricLab — The Cricket Performance Lab'
  }, [title])

  // Router does not reset scroll between routes on its own.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])

  return (
    <div className="flex min-h-screen flex-col bg-chalk">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}

/**
 * Standard opening block for interior pages: dark, floodlit, with room for the
 * fixed header. Home overrides this with its own full-bleed hero.
 */
export function PageHero({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow?: string
  title: React.ReactNode
  lead?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <section className="relative overflow-hidden bg-stadium pb-20 pt-36 text-chalk sm:pt-44">
      <div className="pointer-events-none absolute inset-0 bg-grid-tech opacity-50" aria-hidden />
      <div className="pointer-events-none absolute -right-40 top-0 h-[28rem] w-[28rem] rounded-full bg-lime/10 blur-[120px]" aria-hidden />
      <div className="relative mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="flex max-w-3xl flex-col items-start gap-5">
          {eyebrow ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-lime/30 bg-lime/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-lime">
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {eyebrow}
            </span>
          ) : null}
          <h1 className="font-display text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          {lead ? (
            <p className="max-w-2xl text-base leading-relaxed text-chalk/65 sm:text-lg">{lead}</p>
          ) : null}
          {children}
        </div>
      </div>
    </section>
  )
}

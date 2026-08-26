/**
 * CricLab design-system primitives.
 *
 * Every marketing and application screen composes from these so the product
 * reads as one thing. If a page needs a new visual treatment, add it here
 * rather than styling in place — that is what kept the old build from ever
 * looking like a system.
 */
import { Link } from 'react-router-dom'
import {
  createElement,
  useEffect,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from 'react'

/* ---------------------------------------------------------------------------
   Scroll reveal
   IntersectionObserver rather than an animation dependency: one observer per
   element, unobserved after firing, and it degrades to "always visible" when
   the API is missing or the visitor asked for reduced motion.
--------------------------------------------------------------------------- */

export function Reveal({
  children,
  delay = 0,
  className = '',
  as = 'div',
}: {
  children: ReactNode
  delay?: number
  className?: string
  as?: ElementType
}) {
  const ref = useRef<HTMLElement | null>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduced || typeof IntersectionObserver === 'undefined') {
      setShown(true)
      return
    }
    // threshold 0, not a fraction of the element. A fractional threshold can
    // never be met by an element taller than viewport/threshold — on a short
    // window a tall section would stay invisible forever, which is a blank page
    // rather than a missing animation. Trigger as soon as any part enters,
    // pulled in slightly so it starts just before the element is on screen.
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true)
            io.unobserve(e.target)
          }
        }
      },
      { threshold: 0, rootMargin: '0px 0px -40px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return createElement(
    as,
    {
      ref,
      className: `reveal ${shown ? 'is-visible' : ''} ${className}`,
      style: delay ? { transitionDelay: `${delay}ms` } : undefined,
    },
    children,
  )
}

/* ---------------------------------------------------------------------------
   Animated statistic
   Counts only once, when scrolled into view. Respects reduced motion by
   jumping straight to the final value.
--------------------------------------------------------------------------- */

export function CountUp({
  to,
  suffix = '',
  prefix = '',
  decimals = 0,
  duration = 1600,
  className = '',
}: {
  to: number
  suffix?: string
  prefix?: string
  decimals?: number
  duration?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement | null>(null)
  const [value, setValue] = useState(0)
  const done = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduced || typeof IntersectionObserver === 'undefined') {
      setValue(to)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting || done.current) continue
          done.current = true
          io.unobserve(e.target)
          const start = performance.now()
          const tick = (now: number) => {
            const p = Math.min(1, (now - start) / duration)
            // easeOutExpo: fast settle, so the number feels measured not spun
            const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p)
            setValue(to * eased)
            if (p < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        }
      },
      // See Reveal: a fractional threshold is unreachable for tall elements.
      { threshold: 0, rootMargin: '0px 0px -40px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [to, duration])

  return (
    <span ref={ref} className={className}>
      {prefix}
      {value.toFixed(decimals)}
      {suffix}
    </span>
  )
}

/* ---------------------------------------------------------------------------
   Buttons
--------------------------------------------------------------------------- */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'light'
type ButtonSize = 'sm' | 'md' | 'lg'

const BUTTON_BASE =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition duration-300 disabled:cursor-not-allowed disabled:opacity-50'

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'sweep-on-hover bg-lime text-night shadow-[0_12px_34px_-12px_rgba(182,242,74,0.75)] hover:bg-[#c6ff62] hover:shadow-[0_18px_40px_-14px_rgba(182,242,74,0.9)]',
  secondary:
    'border border-white/25 bg-white/5 text-chalk backdrop-blur hover:border-lime/60 hover:bg-white/10',
  light:
    'sweep-on-hover bg-pitch text-chalk shadow-[0_12px_30px_-14px_rgba(11,61,46,0.8)] hover:bg-pitch-soft',
  ghost: 'text-chalk/80 hover:text-lime',
}

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
}

export function Button({
  to,
  href,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  disabled,
}: {
  to?: string
  href?: string
  onClick?: () => void
  type?: 'button' | 'submit'
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  children: ReactNode
  disabled?: boolean
}) {
  const cls = `${BUTTON_BASE} ${BUTTON_VARIANTS[variant]} ${BUTTON_SIZES[size]} ${className}`
  if (to) {
    return (
      <Link to={to} className={cls}>
        {children}
      </Link>
    )
  }
  if (href) {
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    )
  }
  return (
    <button type={type} onClick={onClick} className={cls} disabled={disabled}>
      {children}
    </button>
  )
}

/* ---------------------------------------------------------------------------
   Layout + type
--------------------------------------------------------------------------- */

export type SectionTone = 'light' | 'dark' | 'pitch' | 'plain' | 'mid' | 'warm' | 'night'

/**
 * Six surfaces, not two. A long page that only flips chalk/night reads as a
 * stack of stripes; the intermediate tones let it *step* between them, which is
 * where the depth comes from.
 */
const SECTION_TONES: Record<SectionTone, string> = {
  plain: 'bg-chalk text-ink',
  light: 'bg-chalk-gradient text-ink',
  warm: 'bg-chalk-warm text-ink',
  mid: 'bg-slate-mid text-chalk',
  pitch: 'bg-pitch-gradient text-chalk',
  dark: 'bg-stadium text-chalk',
  night: 'bg-night text-chalk',
}

export function Section({
  children,
  className = '',
  tone = 'light',
  id,
  slant,
}: {
  children: ReactNode
  className?: string
  tone?: SectionTone
  id?: string
  /** Angled seam where this block meets its neighbour. */
  slant?: 'top' | 'bottom' | 'both'
}) {
  const clip =
    slant === 'top'
      ? 'divider-slant-top'
      : slant === 'bottom'
        ? 'divider-slant-bottom'
        : slant === 'both'
          ? 'divider-slant-top divider-slant-bottom'
          : ''
  return (
    <section id={id} className={`relative overflow-hidden ${SECTION_TONES[tone]} ${clip} ${className}`}>
      {children}
    </section>
  )
}

/** Drawn seam between two blocks — a crease line fading out to both sides. */
export function SectionSeam({ tone = 'lime' }: { tone?: 'lime' | 'muted' }) {
  return (
    <div className="relative h-px w-full" aria-hidden>
      <div
        className={`absolute inset-0 ${
          tone === 'lime'
            ? 'bg-gradient-to-r from-transparent via-lime/45 to-transparent'
            : 'bg-gradient-to-r from-transparent via-white/15 to-transparent'
        }`}
      />
    </div>
  )
}

export function Container({
  children,
  className = '',
  size = 'default',
}: {
  children: ReactNode
  className?: string
  size?: 'default' | 'wide' | 'narrow'
}) {
  const w =
    size === 'wide' ? 'max-w-7xl' : size === 'narrow' ? 'max-w-3xl' : 'max-w-6xl'
  return <div className={`mx-auto w-full ${w} px-5 sm:px-8 ${className}`}>{children}</div>
}

export function Eyebrow({
  children,
  tone = 'dark',
}: {
  children: ReactNode
  tone?: 'dark' | 'light'
}) {
  const base =
    tone === 'dark'
      ? 'border-lime/30 bg-lime/10 text-lime'
      : 'border-pitch/15 bg-pitch/5 text-pitch'
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border ${base} px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em]`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  tone = 'light',
  align = 'center',
  className = '',
}: {
  eyebrow?: string
  title: ReactNode
  lead?: ReactNode
  tone?: 'light' | 'dark'
  align?: 'center' | 'left'
  className?: string
}) {
  const alignment = align === 'center' ? 'mx-auto text-center items-center' : 'text-left items-start'
  return (
    <Reveal className={`flex max-w-3xl flex-col gap-4 ${alignment} ${className}`}>
      {eyebrow ? <Eyebrow tone={tone === 'dark' ? 'dark' : 'light'}>{eyebrow}</Eyebrow> : null}
      <h2
        className={`font-display text-3xl font-extrabold leading-[1.1] sm:text-4xl lg:text-[2.9rem] ${
          tone === 'dark' ? 'text-chalk' : 'text-ink'
        }`}
      >
        {title}
      </h2>
      {lead ? (
        <p
          className={`text-base leading-relaxed sm:text-lg ${
            tone === 'dark' ? 'text-chalk/65' : 'text-ink/65'
          }`}
        >
          {lead}
        </p>
      ) : null}
    </Reveal>
  )
}

export function Card({
  children,
  className = '',
  tone = 'dark',
  interactive = true,
}: {
  children: ReactNode
  className?: string
  tone?: 'dark' | 'light'
  interactive?: boolean
}) {
  const base =
    tone === 'dark'
      ? 'glass card-sheen border-white/10 text-chalk hover:border-lime/35'
      : 'glass-light card-sheen text-ink hover:border-pitch/25'
  return (
    <div
      className={`rounded-[var(--radius-card)] ${base} ${interactive ? 'lift' : ''} ${className}`}
    >
      {children}
    </div>
  )
}

export function Stat({
  value,
  suffix,
  prefix,
  decimals,
  label,
  tone = 'dark',
}: {
  value: number
  suffix?: string
  prefix?: string
  decimals?: number
  label: string
  tone?: 'dark' | 'light'
}) {
  return (
    <div className="flex flex-col gap-1">
      <div
        className={`font-display text-3xl font-extrabold sm:text-4xl ${
          tone === 'dark' ? 'text-gradient-lime' : 'text-gradient-pitch'
        }`}
      >
        <CountUp to={value} suffix={suffix} prefix={prefix} decimals={decimals} />
      </div>
      <div
        className={`text-xs font-semibold uppercase tracking-[0.14em] ${
          tone === 'dark' ? 'text-chalk/50' : 'text-ink/50'
        }`}
      >
        {label}
      </div>
    </div>
  )
}

/** Small labelled pill used for statuses and tags across app + marketing. */
export function Chip({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: 'neutral' | 'ok' | 'warn' | 'bad' | 'lime'
}) {
  const tones = {
    neutral: 'border-white/15 bg-white/5 text-chalk/70',
    ok: 'border-ok/30 bg-ok/10 text-ok',
    warn: 'border-warn/30 bg-warn/10 text-warn',
    bad: 'border-bad/30 bg-bad/10 text-bad',
    lime: 'border-lime/35 bg-lime/10 text-lime',
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  )
}

/** Accessible disclosure used by every FAQ block. */
export function Accordion({
  items,
  tone = 'light',
}: {
  items: { q: string; a: ReactNode }[]
  tone?: 'light' | 'dark'
}) {
  const [open, setOpen] = useState<number | null>(0)
  const dark = tone === 'dark'
  return (
    <div className="flex flex-col gap-3">
      {items.map((item, i) => {
        const isOpen = open === i
        return (
          <Reveal key={item.q} delay={i * 60}>
            <div
              className={`overflow-hidden rounded-2xl border transition ${
                dark
                  ? `border-white/10 bg-white/[0.04] ${isOpen ? 'border-lime/35' : ''}`
                  : `border-pitch/10 bg-white ${isOpen ? 'border-pitch/30 shadow-lg shadow-pitch/5' : ''}`
              }`}
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className={`flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold ${
                  dark ? 'text-chalk' : 'text-ink'
                }`}
              >
                <span>{item.q}</span>
                <span
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border text-lg leading-none transition-transform duration-300 ${
                    dark ? 'border-white/20 text-lime' : 'border-pitch/20 text-pitch'
                  } ${isOpen ? 'rotate-45' : ''}`}
                  aria-hidden
                >
                  +
                </span>
              </button>
              <div
                className={`grid transition-all duration-300 ${
                  isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <div
                    className={`px-5 pb-5 text-sm leading-relaxed ${
                      dark ? 'text-chalk/65' : 'text-ink/65'
                    }`}
                  >
                    {item.a}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        )
      })}
    </div>
  )
}

/* ---------------------------------------------------------------------------
   Depth + motion primitives added in the second design pass.
   All of them no-op under prefers-reduced-motion.
--------------------------------------------------------------------------- */

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

/**
 * Scroll parallax. Translates a layer at a fraction of scroll speed while its
 * container is on screen. Driven by rAF off a passive scroll listener and
 * written straight to `style.transform`, so it never triggers React work.
 */
export function Parallax({
  children,
  speed = 0.18,
  className = '',
}: {
  children: ReactNode
  speed?: number
  className?: string
}) {
  const outer = useRef<HTMLDivElement | null>(null)
  const inner = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const o = outer.current
    const i = inner.current
    if (!o || !i || prefersReducedMotion()) return
    let raf = 0
    const update = () => {
      raf = 0
      const r = o.getBoundingClientRect()
      if (r.bottom < -200 || r.top > window.innerHeight + 200) return
      // 0 when the block is centred; ± as it leaves either edge
      const offset = r.top + r.height / 2 - window.innerHeight / 2
      i.style.transform = `translate3d(0, ${(-offset * speed).toFixed(1)}px, 0)`
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [speed])

  return (
    <div ref={outer} className={className}>
      <div ref={inner} className="will-change-transform">
        {children}
      </div>
    </div>
  )
}

/** A section backdrop: generated plate + scrim + optional grain, behind content. */
export function Backdrop({
  plate,
  scrim = 'dark',
  grain = true,
  parallax = 0.12,
  className = '',
}: {
  plate: 'stadium' | 'pitch' | 'nets' | 'bokeh' | 'turf' | 'light'
  scrim?: 'dark' | 'dark-soft' | 'light' | 'none'
  grain?: boolean
  parallax?: number
  className?: string
}) {
  const scrimClass =
    scrim === 'none'
      ? ''
      : scrim === 'light'
        ? 'scrim-light'
        : scrim === 'dark-soft'
          ? 'scrim-dark-soft'
          : 'scrim-dark'
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${grain ? 'grain-overlay' : ''} ${className}`}
      aria-hidden
    >
      <Parallax speed={parallax} className="absolute inset-0">
        {/* Oversized so the parallax shift never exposes an edge. */}
        <div className={`absolute -inset-y-[12%] inset-x-0 backdrop-plate plate-${plate}`} />
      </Parallax>
      {scrimClass ? <div className={`absolute inset-0 ${scrimClass}`} /> : null}
    </div>
  )
}

/** Card that leans toward the pointer. Pointer-only; untouched on touch. */
export function TiltCard({
  children,
  className = '',
  max = 7,
}: {
  children: ReactNode
  className?: string
  max?: number
}) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width - 0.5
      const py = (e.clientY - r.top) / r.height - 0.5
      el.style.setProperty('--ry', `${(px * max).toFixed(2)}deg`)
      el.style.setProperty('--rx', `${(-py * max).toFixed(2)}deg`)
    }
    const leave = () => {
      el.style.setProperty('--rx', '0deg')
      el.style.setProperty('--ry', '0deg')
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
    }
  }, [max])

  return (
    <div ref={ref} className={`tilt ${className}`}>
      {children}
    </div>
  )
}

/** Infinite ticker. Children are rendered twice so the loop is seamless. */
export function Marquee({
  items,
  className = '',
}: {
  items: ReactNode[]
  className?: string
}) {
  return (
    <div className={`marquee ${className}`}>
      <div className="marquee-track">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
            {items.map((item, i) => (
              <span key={i} className="flex items-center gap-3 px-6 py-2">
                {item}
                <span className="h-1 w-1 rounded-full bg-lime/50" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/** Reading-progress rail. Fixed under the site header. */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let raf = 0
    const update = () => {
      raf = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      el.style.setProperty('--p', max > 0 ? String(Math.min(1, window.scrollY / max)) : '0')
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])
  return (
    <div className="fixed inset-x-0 top-0 z-[60] h-0.5 bg-transparent" aria-hidden>
      <div ref={ref} className="scroll-rail h-full bg-gradient-to-r from-lime-deep via-lime to-seam" />
    </div>
  )
}

/** Headline that lifts in word by word. */
export function WordReveal({
  text,
  className = '',
  stagger = 55,
  as = 'span',
}: {
  text: string
  className?: string
  stagger?: number
  as?: ElementType
}) {
  const ref = useRef<HTMLElement | null>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      setShown(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && (setShown(true), io.unobserve(e.target))),
      { threshold: 0, rootMargin: '0px 0px -40px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return createElement(
    as,
    { ref, className: `word-rise ${shown ? 'is-visible' : ''} ${className}` },
    text.split(' ').map((word, i) => (
      <span key={`${word}-${i}`} style={{ transitionDelay: `${i * stagger}ms` }}>
        {word}
        {i < text.split(' ').length - 1 ? ' ' : ''}
      </span>
    )),
  )
}

/** Circular progress ring that draws itself on reveal. */
export function ProgressRing({
  value,
  size = 120,
  stroke = 8,
  label,
  sub,
}: {
  value: number
  size?: number
  stroke?: number
  label?: string
  sub?: string
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [on, setOn] = useState(false)
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(100, value))

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setOn(true)
      return
    }
    const io = new IntersectionObserver(
      (e) => e[0]?.isIntersecting && (setOn(true), io.disconnect()),
      { threshold: 0, rootMargin: '0px 0px -40px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref} className="relative inline-flex flex-col items-center gap-1.5">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={on ? c - (c * pct) / 100 : c}
          style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.22,1,0.36,1)' }}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#b6f24a" />
            <stop offset="100%" stopColor="#2f9e6b" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pb-5">
        <span className="font-display text-2xl font-extrabold text-chalk">
          <CountUp to={pct} />
        </span>
        {sub ? <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-chalk/40">{sub}</span> : null}
      </div>
      {label ? (
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-chalk/50">{label}</span>
      ) : null}
    </div>
  )
}

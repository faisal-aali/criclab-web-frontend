/**
 * Viewport entrances.
 *
 * `Reveal` lifts a block in the first time it scrolls into view. `Stagger` and
 * `StaggerItem` do the same for a list, each child a beat after the last.
 * Both trigger as soon as *any* part of the element is on screen (a
 * fractional threshold can never be met by an element taller than the
 * viewport, which on a short window leaves a tall section blank). Reduced
 * motion is handled by `MotionProvider`: the fade still plays, the lift does
 * not.
 */
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { useMemo, type ElementType, type ReactNode } from 'react'
import { DUR, EASE_OUT, STAGGER } from './tokens'

const VIEWPORT = { once: true, margin: '0px 0px -40px 0px' } as const

const cache = new Map<string, ReturnType<typeof motion.create>>()
function motionTag(as: ElementType) {
  if (typeof as !== 'string') return motion.create(as as never)
  let comp = cache.get(as)
  if (!comp) {
    comp = motion.create(as as keyof HTMLElementTagNameMap)
    cache.set(as, comp)
  }
  return comp
}

export function Reveal({
  children,
  delay = 0,
  className = '',
  as = 'div',
  y = 22,
  once = true,
  style,
}: {
  children: ReactNode
  /** Milliseconds, to match the old CSS-driven API. */
  delay?: number
  className?: string
  as?: ElementType
  /** Lift distance in px. */
  y?: number
  once?: boolean
  style?: React.CSSProperties
}) {
  const Comp = useMemo(() => motionTag(as), [as])
  const reduced = useReducedMotion()
  const variants = useMemo<Variants>(
    () => ({
      hidden: { opacity: 0, y: reduced ? 0 : y },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: DUR.reveal, ease: EASE_OUT, delay: delay / 1000 },
      },
    }),
    [delay, y, reduced],
  )
  return (
    <Comp
      className={className}
      style={style}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ ...VIEWPORT, once }}
    >
      {children}
    </Comp>
  )
}

export function Stagger({
  children,
  className = '',
  as = 'div',
  stagger = STAGGER.base,
  delay = 0,
  once = true,
}: {
  children: ReactNode
  className?: string
  as?: ElementType
  stagger?: number
  delay?: number
  once?: boolean
}) {
  const Comp = useMemo(() => motionTag(as), [as])
  const variants = useMemo<Variants>(
    () => ({ hidden: {}, visible: { transition: { staggerChildren: stagger, delayChildren: delay } } }),
    [stagger, delay],
  )
  return (
    <Comp
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ ...VIEWPORT, once }}
    >
      {children}
    </Comp>
  )
}

export function StaggerItem({
  children,
  className = '',
  as = 'div',
  y = 18,
  scale,
}: {
  children: ReactNode
  className?: string
  as?: ElementType
  y?: number
  /** Start scale, for cards that should pop rather than lift. */
  scale?: number
}) {
  const Comp = useMemo(() => motionTag(as), [as])
  const reduced = useReducedMotion()
  const variants = useMemo<Variants>(
    () => ({
      hidden: { opacity: 0, y: reduced ? 0 : y, scale: reduced ? 1 : (scale ?? 1) },
      visible: { opacity: 1, y: 0, scale: 1, transition: { duration: DUR.reveal, ease: EASE_OUT } },
    }),
    [y, scale, reduced],
  )
  return (
    <Comp className={className} variants={variants}>
      {children}
    </Comp>
  )
}

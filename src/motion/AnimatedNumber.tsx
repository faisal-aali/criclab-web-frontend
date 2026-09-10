/**
 * A number that counts to its value.
 *
 * Starts when it scrolls into view and re-animates when the value changes
 * (a dashboard switching range, a metric updating), always from where it
 * currently is rather than from zero. Under reduced motion it jumps straight
 * to the value. Tabular figures keep the width steady while it runs.
 */
import { animate, useInView, useMotionValue, useMotionValueEvent, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { EASE_OUT_EXPO } from './tokens'

export function AnimatedNumber({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  duration = 1.4,
  className = '',
  format,
}: {
  value: number
  decimals?: number
  prefix?: string
  suffix?: string
  duration?: number
  className?: string
  /** Custom formatter; receives the in-flight value. */
  format?: (v: number) => string
}) {
  const ref = useRef<HTMLSpanElement | null>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -40px 0px' })
  const reduced = useReducedMotion()
  const mv = useMotionValue(0)
  const fmt = (v: number) => (format ? format(v) : v.toFixed(decimals))
  const [text, setText] = useState(() => fmt(0))

  useMotionValueEvent(mv, 'change', (v) => setText(fmt(v)))

  useEffect(() => {
    if (!inView) return
    if (reduced) {
      mv.set(value)
      setText(fmt(value))
      return
    }
    const controls = animate(mv, value, { duration, ease: EASE_OUT_EXPO })
    return () => controls.stop()
    // fmt is derived from props already listed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, value, reduced, duration, mv, decimals])

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {prefix}
      {text}
      {suffix}
    </span>
  )
}

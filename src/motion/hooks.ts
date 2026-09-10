/**
 * Motion hooks.
 *
 * `usePointerParallax` gives a set of spring-smoothed motion values that
 * follow the pointer across the window, for layered hero art. It is inert on
 * touch devices and under reduced motion, and never triggers React renders —
 * the values are written straight to transforms by Framer.
 */
import { useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import { useEffect } from 'react'
import { SPRING } from './tokens'

export function usePointerParallax(strength = 18) {
  const reduced = useReducedMotion()
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const sx = useSpring(px, SPRING.gentle)
  const sy = useSpring(py, SPRING.gentle)
  const x = useTransform(sx, (v) => v * strength)
  const y = useTransform(sy, (v) => v * strength)
  const rx = useTransform(sy, (v) => -v * strength * 0.35)
  const ry = useTransform(sx, (v) => v * strength * 0.35)

  useEffect(() => {
    if (reduced) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const onMove = (e: PointerEvent) => {
      px.set((e.clientX / window.innerWidth - 0.5) * 2)
      py.set((e.clientY / window.innerHeight - 0.5) * 2)
    }
    const onLeave = () => {
      px.set(0)
      py.set(0)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
    }
  }, [px, py, reduced])

  return { x, y, rx, ry }
}

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

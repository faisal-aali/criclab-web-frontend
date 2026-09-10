/**
 * Application-wide motion configuration.
 *
 * `reducedMotion="user"` makes every Framer Motion transform/layout animation
 * respect `prefers-reduced-motion` automatically — opacity fades still run,
 * movement does not — so individual components do not need to check it.
 * The default transition is the product's signature ease.
 */
import { MotionConfig } from 'framer-motion'
import type { ReactNode } from 'react'
import { DUR, EASE_OUT } from './tokens'

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: DUR.base, ease: EASE_OUT }}>
      {children}
    </MotionConfig>
  )
}

/**
 * Motion tokens.
 *
 * One easing family and a small set of durations, so every entrance, hover
 * and transition in the product moves the same way. Springs are for things
 * that follow the pointer or settle into place (menus, counters, the 3D
 * stage); tweens are for entrances that should read as deliberate.
 */
import type { Transition } from 'framer-motion'

/** The product's signature ease — fast start, long settle. */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const
/** Counters: quick to most of the value, slow over the last digits. */
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const

export const DUR = {
  /** Hover, press, focus rings. */
  fast: 0.18,
  /** Menus, toasts, dialogs. */
  base: 0.28,
  /** Route changes. */
  page: 0.42,
  /** Scroll-triggered entrances. */
  reveal: 0.7,
} as const

export const SPRING = {
  soft: { type: 'spring', stiffness: 170, damping: 24, mass: 0.9 },
  snappy: { type: 'spring', stiffness: 460, damping: 32, mass: 0.8 },
  gentle: { type: 'spring', stiffness: 90, damping: 20, mass: 1.1 },
} as const satisfies Record<string, Transition>

export const STAGGER = {
  tight: 0.05,
  base: 0.08,
  loose: 0.12,
} as const

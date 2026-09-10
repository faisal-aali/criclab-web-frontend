/**
 * Shared Framer Motion variants. Pages and components import these rather
 * than writing their own keyframes, which is what keeps the motion language
 * consistent across marketing, workspace and admin.
 */
import type { Variants } from 'framer-motion'
import { DUR, EASE_OUT, STAGGER } from './tokens'

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: DUR.reveal, ease: EASE_OUT } },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: DUR.reveal, ease: EASE_OUT } },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1, transition: { duration: DUR.base, ease: EASE_OUT } },
}

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 28 },
  visible: { opacity: 1, x: 0, transition: { duration: DUR.reveal, ease: EASE_OUT } },
}

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -28 },
  visible: { opacity: 1, x: 0, transition: { duration: DUR.reveal, ease: EASE_OUT } },
}

/** Parent that staggers its `fadeUp`/`scaleIn` children. */
export function staggerContainer(stagger: number = STAGGER.base, delay = 0): Variants {
  return {
    hidden: {},
    visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
  }
}

/** Route entrance. Exit is deliberately quick so navigation never feels held. */
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  enter: { opacity: 1, y: 0, transition: { duration: DUR.page, ease: EASE_OUT } },
  exit: { opacity: 0, y: -6, transition: { duration: DUR.fast } },
}

/** Popover / menu presence: grows from its anchor corner. */
export const popoverVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: -6 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: DUR.fast, ease: EASE_OUT } },
  exit: { opacity: 0, scale: 0.97, y: -4, transition: { duration: 0.14 } },
}

/** Modal panel presence. */
export const dialogVariants: Variants = {
  hidden: { opacity: 0, scale: 0.94, y: 12 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: DUR.base, ease: EASE_OUT } },
  exit: { opacity: 0, scale: 0.97, y: 8, transition: { duration: DUR.fast } },
}

/** Toast presence: rises from below the stack. */
export const toastVariants: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: DUR.base, ease: EASE_OUT } },
  exit: { opacity: 0, y: 10, scale: 0.98, transition: { duration: DUR.fast } },
}

/**
 * Route entrance.
 *
 * Keyed on the pathname so every navigation mounts a fresh page and plays the
 * entrance once. There is deliberately no exit animation through
 * `AnimatePresence`: the routes are code-split behind `Suspense`, and holding
 * the old page while the new chunk loads would make navigation feel slower,
 * not smoother. Scroll position is reset by the layouts themselves.
 */
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { pageVariants } from './variants'

export function PageTransition({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  const { pathname } = useLocation()
  return (
    <motion.div key={pathname} className={className} variants={pageVariants} initial="initial" animate="enter">
      {children}
    </motion.div>
  )
}

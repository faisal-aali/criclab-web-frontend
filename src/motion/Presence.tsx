/**
 * Presence primitives — the enter/exit choreography for anything that
 * appears over the page: menus, popovers, dialogs, drawers, toasts.
 *
 * Each takes an `open` flag and handles `AnimatePresence` itself, so a
 * caller keeps its plain `open ? … : null` shape and only swaps the wrapper.
 */
import { AnimatePresence, motion } from 'framer-motion'
import type { CSSProperties, KeyboardEvent, MouseEvent, ReactNode } from 'react'
import { dialogVariants, popoverVariants } from './variants'

export function PopoverPanel({
  open,
  children,
  className = '',
  origin = 'top right',
  role,
  id,
}: {
  open: boolean
  children: ReactNode
  className?: string
  /** CSS transform-origin — the corner the panel grows from. */
  origin?: string
  role?: string
  id?: string
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          id={id}
          role={role}
          className={className}
          style={{ transformOrigin: origin }}
          variants={popoverVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

/** Dimmed backdrop + centred panel. The caller owns focus and the close button. */
export function ModalOverlay({
  open,
  children,
  onBackdropClick,
  onKeyDown,
  labelledBy,
  className = '',
  panelClassName = '',
  panelStyle,
}: {
  open: boolean
  children: ReactNode
  onBackdropClick?: () => void
  onKeyDown?: (e: KeyboardEvent<HTMLDivElement>) => void
  labelledBy?: string
  className?: string
  panelClassName?: string
  panelStyle?: CSSProperties
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className={className}
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelledBy}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.16 } }}
          onClick={(e: MouseEvent<HTMLDivElement>) => {
            if (e.target === e.currentTarget) onBackdropClick?.()
          }}
          onKeyDown={onKeyDown}
        >
          <motion.div
            className={panelClassName}
            style={panelStyle}
            variants={dialogVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

/** Height-animated disclosure body (accordions, expandable rows). */
export function Collapse({
  open,
  children,
  className = '',
}: {
  open: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <AnimatePresence initial={false}>
      {open ? (
        <motion.div
          key="body"
          className={className}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{ overflow: 'hidden' }}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

/**
 * Confirmation dialog for destructive or hard-to-undo actions — cancelling a
 * booked session, signing out every other device, ending a single device's
 * session. Not used for routine actions (marking a notification read, saving
 * a form): a dialog in front of something reversible and low-stakes just adds
 * a click nobody needed.
 *
 * `useConfirm()` returns a function that resolves `true`/`false`, so a caller
 * reads as a single `if (await confirm({...})) { ...}` rather than managing
 * open state itself.
 */
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { Button } from './ui'

type ConfirmOptions = {
  title: string
  body: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'default' | 'danger'
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>

const ConfirmContext = createContext<ConfirmFn | null>(null)

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const resolver = useRef<((v: boolean) => void) | null>(null)

  const confirm = useCallback<ConfirmFn>((opts) => {
    setOptions(opts)
    return new Promise((resolve) => {
      resolver.current = resolve
    })
  }, [])

  const settle = (value: boolean) => {
    setOptions(null)
    resolver.current?.(value)
    resolver.current = null
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {options ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-night/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          onClick={(e) => e.target === e.currentTarget && settle(false)}
          onKeyDown={(e) => e.key === 'Escape' && settle(false)}
        >
          <div className="animate-pop-in w-full max-w-sm rounded-2xl border border-white/12 bg-charcoal p-6 shadow-2xl shadow-black/50">
            <h2 id="confirm-dialog-title" className="font-display text-lg font-bold text-chalk">
              {options.title}
            </h2>
            <div className="pt-2 text-sm leading-relaxed text-chalk/60">{options.body}</div>
            <div className="flex justify-end gap-2.5 pt-6">
              <Button variant="ghost" size="sm" onClick={() => settle(false)}>
                {options.cancelLabel ?? 'Never mind'}
              </Button>
              <Button
                variant={options.tone === 'danger' ? 'primary' : 'primary'}
                size="sm"
                className={options.tone === 'danger' ? '!bg-bad !text-chalk hover:!bg-bad/85' : ''}
                onClick={() => settle(true)}
              >
                {options.confirmLabel ?? 'Confirm'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </ConfirmContext.Provider>
  )
}

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider')
  return ctx
}

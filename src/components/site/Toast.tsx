/**
 * Toast notifications.
 *
 * A `<ToastProvider>` sits once near the app root; anywhere below it calls
 * `useToast()` to push a transient confirmation or error. Reserved for
 * feedback on actions that have no dedicated inline result to update — ending
 * a session from a list, cancelling a booking, resolving a ticket from a menu.
 * A form with its own success/error banner (sign-in, account settings) keeps
 * that banner; a toast next to it would just be a second copy of the same
 * sentence.
 */
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'

type ToastTone = 'ok' | 'error' | 'info'
type Toast = { id: number; tone: ToastTone; text: string }

type ToastContextValue = {
  push: (text: string, tone?: ToastTone) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const TONE_STYLE: Record<ToastTone, string> = {
  ok: 'border-ok/30 bg-charcoal text-chalk before:bg-ok',
  error: 'border-bad/30 bg-charcoal text-chalk before:bg-bad',
  info: 'border-lime/30 bg-charcoal text-chalk before:bg-lime',
}

const TONE_ICON: Record<ToastTone, ReactNode> = {
  ok: (
    <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
  ),
  error: (
    <path d="M12 9v4m0 4h.01M10.3 3.9 2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" strokeLinecap="round" strokeLinejoin="round" />
  ),
  info: (
    <path d="M12 8h.01M11 12h1v5h1" strokeLinecap="round" strokeLinejoin="round" />
  ),
}

const DURATION_MS = 4500

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(1)

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const push = useCallback(
    (text: string, tone: ToastTone = 'ok') => {
      const id = nextId.current++
      setToasts((prev) => [...prev.slice(-3), { id, tone, text }])
      window.setTimeout(() => dismiss(id), DURATION_MS)
    },
    [dismiss],
  )

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed bottom-5 left-1/2 z-[70] flex w-[min(92vw,26rem)] -translate-x-1/2 flex-col gap-2 sm:bottom-6 sm:left-auto sm:right-6 sm:translate-x-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`animate-rise pointer-events-auto relative flex items-start gap-3 overflow-hidden rounded-xl border px-4 py-3 shadow-2xl shadow-black/40 before:absolute before:inset-y-0 before:left-0 before:w-1 ${TONE_STYLE[t.tone]}`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className={`mt-0.5 h-4 w-4 shrink-0 ${
                t.tone === 'ok' ? 'text-ok' : t.tone === 'error' ? 'text-bad' : 'text-lime'
              }`}
              aria-hidden
            >
              {TONE_ICON[t.tone]}
            </svg>
            <p className="flex-1 text-[13px] leading-snug text-chalk/90">{t.text}</p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="shrink-0 text-chalk/35 transition hover:text-chalk"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

/**
 * Install / standalone detection for the CricLab PWA.
 *
 * Chrome/Edge/Android fire `beforeinstallprompt`. iOS Safari never does —
 * those visitors get a short "Add to Home Screen" sheet instead of a dead
 * button. Once the app is running in standalone (or the install event fired),
 * the header button hides.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type Platform = 'ios' | 'android' | 'desktop'

type PwaContextValue = {
  installed: boolean
  canPrompt: boolean
  platform: Platform
  install: () => Promise<void>
}

const PwaContext = createContext<PwaContextValue | null>(null)

function detectPlatform(): Platform {
  const ua = navigator.userAgent || ''
  if (/iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
    return 'ios'
  }
  if (/Android/i.test(ua)) return 'android'
  return 'desktop'
}

export function isStandaloneDisplay(): boolean {
  if (typeof window === 'undefined') return false
  const nav = window.navigator as Navigator & { standalone?: boolean }
  if (nav.standalone) return true
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches ||
    window.matchMedia('(display-mode: window-controls-overlay)').matches
  )
}

export function PwaInstallProvider({ children }: { children: ReactNode }) {
  const [installed, setInstalled] = useState(() => (typeof window === 'undefined' ? false : isStandaloneDisplay()))
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [helpOpen, setHelpOpen] = useState(false)
  const [platform] = useState<Platform>(() => (typeof navigator === 'undefined' ? 'desktop' : detectPlatform()))

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    const onInstalled = () => {
      setDeferred(null)
      setInstalled(true)
      setHelpOpen(false)
    }
    const onDisplay = () => {
      if (isStandaloneDisplay()) setInstalled(true)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    const mq = window.matchMedia('(display-mode: standalone)')
    mq.addEventListener?.('change', onDisplay)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
      mq.removeEventListener?.('change', onDisplay)
    }
  }, [])

  const install = useCallback(async () => {
    if (deferred) {
      await deferred.prompt()
      const choice = await deferred.userChoice
      setDeferred(null)
      if (choice.outcome === 'accepted') {
        setInstalled(true)
      }
      return
    }
    setHelpOpen(true)
  }, [deferred])

  const value = useMemo<PwaContextValue>(
    () => ({
      installed,
      canPrompt: Boolean(deferred),
      platform,
      install,
    }),
    [installed, deferred, platform, install],
  )

  return (
    <PwaContext.Provider value={value}>
      {children}
      {helpOpen ? (
        <div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-night/70 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-install-title"
          onClick={(e) => e.target === e.currentTarget && setHelpOpen(false)}
        >
          <div className="w-full max-w-sm rounded-2xl border border-white/12 bg-charcoal p-6 text-chalk shadow-2xl">
            <h2 id="pwa-install-title" className="font-display text-lg font-bold">
              Install CricLab
            </h2>
            {platform === 'ios' ? (
              <ol className="mt-3 list-decimal space-y-2 pl-4 text-sm leading-relaxed text-chalk/70">
                <li>
                  Tap the <span className="font-semibold text-chalk">Share</span> button in Safari.
                </li>
                <li>
                  Choose <span className="font-semibold text-chalk">Add to Home Screen</span>.
                </li>
                <li>Confirm, and CricLab opens like an app next time.</li>
              </ol>
            ) : (
              <p className="mt-3 text-sm leading-relaxed text-chalk/70">
                This browser does not expose a one-tap install prompt. In Chrome or Edge, open the
                browser menu and choose <span className="font-semibold text-chalk">Install CricLab</span>{' '}
                / <span className="font-semibold text-chalk">Add to Home screen</span>.
              </p>
            )}
            <button
              type="button"
              onClick={() => setHelpOpen(false)}
              className="mt-5 w-full rounded-full bg-lime py-2.5 text-sm font-bold text-night"
            >
              Got it
            </button>
          </div>
        </div>
      ) : null}
    </PwaContext.Provider>
  )
}

export function usePwaInstall(): PwaContextValue {
  const ctx = useContext(PwaContext)
  if (!ctx) throw new Error('usePwaInstall must be used within PwaInstallProvider')
  return ctx
}

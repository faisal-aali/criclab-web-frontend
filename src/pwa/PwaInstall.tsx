/**
 * Install / standalone detection for the CricLab PWA.
 *
 * Chrome/Edge/Android fire `beforeinstallprompt`. That event is stashed as
 * early as index.html so a late React effect cannot miss it. iOS Safari never
 * fires it — those visitors get a short "Add to Home Screen" sheet instead of
 * a dead button. Once the app is running standalone, the header button hides.
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
import {
  PWA_PROMPT_EVENT,
  clearInstallPrompt,
  peekInstallPrompt,
  type BeforeInstallPromptEvent,
} from './installPrompt'

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

function waitForPrompt(ms: number): Promise<BeforeInstallPromptEvent | null> {
  const already = peekInstallPrompt()
  if (already) return Promise.resolve(already)
  return new Promise((resolve) => {
    const finish = () => {
      window.clearTimeout(timer)
      window.removeEventListener(PWA_PROMPT_EVENT, onReady)
      window.removeEventListener('beforeinstallprompt', onReady)
      resolve(peekInstallPrompt())
    }
    const onReady = () => finish()
    const timer = window.setTimeout(finish, ms)
    window.addEventListener(PWA_PROMPT_EVENT, onReady)
    window.addEventListener('beforeinstallprompt', onReady)
  })
}

function installBlockedReason(): 'insecure' | 'ios' | 'none' {
  if (typeof window === 'undefined') return 'none'
  if (!window.isSecureContext) return 'insecure'
  return 'none'
}

export function PwaInstallProvider({ children }: { children: ReactNode }) {
  const [installed, setInstalled] = useState(() => (typeof window === 'undefined' ? false : isStandaloneDisplay()))
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(() =>
    typeof window === 'undefined' ? null : peekInstallPrompt(),
  )
  const [helpOpen, setHelpOpen] = useState(false)
  const [platform] = useState<Platform>(() => (typeof navigator === 'undefined' ? 'desktop' : detectPlatform()))

  useEffect(() => {
    const sync = () => setDeferred(peekInstallPrompt())
    sync()
    const onInstalled = () => {
      clearInstallPrompt()
      setDeferred(null)
      setInstalled(true)
      setHelpOpen(false)
    }
    const onDisplay = () => {
      if (isStandaloneDisplay()) setInstalled(true)
    }
    window.addEventListener(PWA_PROMPT_EVENT, sync)
    window.addEventListener('beforeinstallprompt', sync)
    window.addEventListener('appinstalled', onInstalled)
    const mq = window.matchMedia('(display-mode: standalone)')
    mq.addEventListener?.('change', onDisplay)
    return () => {
      window.removeEventListener(PWA_PROMPT_EVENT, sync)
      window.removeEventListener('beforeinstallprompt', sync)
      window.removeEventListener('appinstalled', onInstalled)
      mq.removeEventListener?.('change', onDisplay)
    }
  }, [])

  const install = useCallback(async () => {
    if (installBlockedReason() === 'insecure') {
      setHelpOpen(true)
      return
    }
    let event = deferred ?? peekInstallPrompt()
    if (!event) {
      // Chrome only allows prompt() while the click is still a user gesture.
      event = await waitForPrompt(800)
    }
    if (event) {
      try {
        await event.prompt()
        const choice = await event.userChoice
        clearInstallPrompt()
        setDeferred(null)
        if (choice.outcome === 'accepted') setInstalled(true)
        return
      } catch {
        // Fall through to the manual steps (private window, policy, expired gesture).
      }
    }
    setHelpOpen(true)
  }, [deferred])

  const value = useMemo<PwaContextValue>(
    () => ({
      installed,
      canPrompt: Boolean(deferred) || Boolean(peekInstallPrompt()),
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
                  Tap the <span className="font-semibold text-chalk">Share</span> button in Safari
                  (Chrome on iPhone uses the same Share sheet).
                </li>
                <li>
                  Choose <span className="font-semibold text-chalk">Add to Home Screen</span>.
                </li>
                <li>Confirm, and CricLab opens like an app next time.</li>
              </ol>
            ) : installBlockedReason() === 'insecure' ? (
              <p className="mt-3 text-sm leading-relaxed text-chalk/70">
                Chrome will not install a PWA over plain HTTP. This page is not a secure context
                (localhost is allowed; a public http:// IP or hostname is not). Open CricLab on{' '}
                <span className="font-semibold text-chalk">https://</span> and tap Download App again.
              </p>
            ) : (
              <ol className="mt-3 list-decimal space-y-2 pl-4 text-sm leading-relaxed text-chalk/70">
                <li>Use a normal Chrome or Edge window — not Incognito / InPrivate.</li>
                <li>Reload once so the service worker can take control, then tap Download App again.</li>
                <li>
                  Or use the install icon on the right of the address bar, or the three-dot menu →{' '}
                  <span className="font-semibold text-chalk">Cast, save and share</span> →{' '}
                  <span className="font-semibold text-chalk">Install CricLab</span>.
                </li>
              </ol>
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

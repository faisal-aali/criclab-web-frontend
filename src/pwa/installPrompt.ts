/**
 * Chrome/Edge fire `beforeinstallprompt` as soon as the page is installable —
 * often before React mounts, especially when a service worker from a previous
 * visit is already controlling the tab. If we only listen in a useEffect, the
 * event is gone and Download App can only show a manual-install sheet.
 *
 * Capture it on `window` at parse time (see index.html) and again here so
 * both the HTML listener and the React tree share one deferred prompt.
 */

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type PwaStash = {
  deferred: BeforeInstallPromptEvent | null
}

declare global {
  interface Window {
    __CRICLAB_PWA?: PwaStash
  }
}

export const PWA_PROMPT_EVENT = 'criclab-pwa-prompt'

function stash(): PwaStash {
  if (typeof window === 'undefined') return { deferred: null }
  window.__CRICLAB_PWA = window.__CRICLAB_PWA ?? { deferred: null }
  return window.__CRICLAB_PWA
}

export function peekInstallPrompt(): BeforeInstallPromptEvent | null {
  return stash().deferred
}

export function clearInstallPrompt() {
  stash().deferred = null
}

export function rememberInstallPrompt(event: BeforeInstallPromptEvent) {
  event.preventDefault()
  stash().deferred = event
  window.dispatchEvent(new Event(PWA_PROMPT_EVENT))
}

let listening = false

export function listenForInstallPrompt() {
  if (typeof window === 'undefined' || listening) return
  listening = true
  window.addEventListener('beforeinstallprompt', (event) => {
    rememberInstallPrompt(event as BeforeInstallPromptEvent)
  })
  window.addEventListener('appinstalled', () => {
    clearInstallPrompt()
  })
}

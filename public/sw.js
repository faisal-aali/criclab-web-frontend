/**
 * CricLab service worker.
 *
 * Precaches the app shell (icons, manifest, start page). Runtime caching is
 * only for static assets. API calls, artifacts, media, and anything with a
 * bearer token stay on the network — never written into Cache Storage.
 */
const VERSION = 'criclab-shell-v3'
const SHELL = [
  '/',
  '/app',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/favicon.ico',
  '/apple-touch-icon.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION).then(async (cache) => {
      await Promise.all(SHELL.map((url) => cache.add(url).catch(() => undefined)))
      await self.skipWaiting()
    }),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

function shouldBypass(url) {
  if (url.origin !== self.location.origin) {
    return !(url.hostname.includes('googleapis') || url.hostname.includes('gstatic'))
  }
  return (
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/artifacts') ||
    url.pathname.startsWith('/media') ||
    url.pathname.startsWith('/src') ||
    url.pathname.startsWith('/@') ||
    url.pathname.includes('node_modules')
  )
}

async function networkFirst(request) {
  try {
    return await fetch(request)
  } catch {
    const cached = await caches.match(request)
    if (cached) return cached
    return (await caches.match('/app')) || caches.match('/')
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(VERSION)
  const cached = await cache.match(request)
  const fetching = fetch(request)
    .then((res) => {
      if (res && res.ok && request.method === 'GET') cache.put(request, res.clone())
      return res
    })
    .catch(() => cached)
  return cached || fetching
}

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (shouldBypass(url)) return
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request))
    return
  }
  if (url.hostname.includes('googleapis') || url.hostname.includes('gstatic')) {
    event.respondWith(staleWhileRevalidate(request))
    return
  }
  if (['style', 'script', 'image', 'font', 'manifest'].includes(request.destination)) {
    event.respondWith(staleWhileRevalidate(request))
  }
})

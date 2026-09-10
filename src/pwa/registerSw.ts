/** Register as early as Vite will allow so `beforeinstallprompt` can fire before the first tap. */
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  void navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' })
}

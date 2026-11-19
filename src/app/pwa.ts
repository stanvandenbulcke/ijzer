import { registerSW } from 'virtual:pwa-register'

const HOUR = 60 * 60 * 1000

/**
 * Registers the service worker. A new version is installed in the background and the page
 * reloads once it is active, so the home-screen app never keeps showing an old version.
 * iOS rarely checks for updates on its own, so we also check whenever the app comes back
 * into view and every hour while it is open. All data lives in IndexedDB, so a reload is safe.
 */
export function setupServiceWorker(): void {
  registerSW({
    immediate: true,
    onRegisteredSW(_url, registration) {
      if (!registration) return
      const check = () => {
        if (navigator.onLine) registration.update().catch(() => undefined)
      }
      window.setInterval(check, HOUR)
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') check()
      })
    },
  })
}

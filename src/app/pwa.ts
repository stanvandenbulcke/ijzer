import { registerSW } from 'virtual:pwa-register'

const HOUR = 60 * 60 * 1000

/** Reloading on the workout screen could drop a value that is being typed: wait until it is safe. */
function safeToReload(): boolean {
  return !window.location.pathname.startsWith('/training') || document.visibilityState === 'hidden'
}

/**
 * Registers the service worker. A new version installs in the background; the page reloads
 * once it is active, so the home-screen app never keeps showing an old version. During a
 * workout the reload waits until you leave the workout screen or the app goes to the
 * background. iOS rarely checks for updates itself, so we also check when the app comes back
 * into view and every hour while it is open.
 */
export function setupServiceWorker(): void {
  registerSW({
    immediate: true,
    onNeedReload() {
      if (safeToReload()) {
        window.location.reload()
        return
      }
      const timer = window.setInterval(() => {
        if (safeToReload()) {
          window.clearInterval(timer)
          window.location.reload()
        }
      }, 2000)
    },
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
